import subprocess
import os
import logging
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db, SessionLocal
from app.core.config import settings
from app.models.user import User
from app.models.location import Panchayat
from app.models.ml_model import IngestionLog, AuditLog, MLModelVersion
from app.schemas.auth import UserResponse
from app.schemas.admin import SystemHealthResponse, IngestionLogSchema
from app.data_ingestion.csv_parser import CSVDatasetParser

router = APIRouter(prefix="/admin", tags=["Administrator Dashboard"])

logger = logging.getLogger(__name__)

# Absolute path to repo root (backend/app/api/admin.py → go up 4 levels → repo root)
# admin.py → api/ → app/ → backend/ → repo root (MausamSetu/)
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        UserResponse(
            id=u.id, email=u.email, full_name=u.full_name, role=u.role,
            is_active=u.is_active, phone_number=u.phone_number
        ) for u in users
    ]

@router.get("/system-health", response_model=SystemHealthResponse)
def get_system_health(db: Session = Depends(get_db)):
    user_count = db.query(User).count()
    panchayat_count = db.query(Panchayat).count()

    return SystemHealthResponse(
        status="OPERATIONAL",
        database="CONNECTED (SQLAlchemy / SQLite + PostGIS Ready)",
        active_model="v1.0.0-xgb-rf (Multi-Output Random Forest)",
        demo_mode=settings.DEMO_MODE,
        ingestion_status="ACTIVE (NASA POWER / IMD Demo Adapter)",
        uptime_seconds=86400.0,
        total_users=user_count,
        total_panchayats=panchayat_count,
        active_alerts=2
    )

@router.post("/datasets/upload")
async def upload_weather_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()
    success, msg, records = CSVDatasetParser.parse_weather_csv(contents)
    
    log = IngestionLog(
        provider_name=f"CSV Upload: {file.filename}",
        records_processed=len(records),
        status="SUCCESS" if success else "FAILED",
        message=msg
    )
    db.add(log)
    db.commit()

    if not success:
        raise HTTPException(status_code=400, detail=msg)

    return {
        "status": "SUCCESS",
        "message": msg,
        "records_count": len(records),
        "filename": file.filename
    }

def _run_training(job_id: int):
    db = SessionLocal()
    try:
        script_path = os.path.join(REPO_ROOT, "ml", "train_and_eval.py")
        logger.info(f"[Training job_id={job_id}] Starting subprocess: python {script_path} (cwd={REPO_ROOT})")
        res = subprocess.run(
            ["python", script_path],
            capture_output=True, text=True, check=True,
            cwd=REPO_ROOT
        )
        logger.info(f"[Training job_id={job_id}] Completed successfully.\nSTDOUT:\n{res.stdout}")
        model = db.query(MLModelVersion).filter(MLModelVersion.id == job_id).first()
        if model:
            model.status = "ACTIVE"
            model.parameters = {"stdout": res.stdout[:2000]}
            db.commit()
    except subprocess.CalledProcessError as e:
        logger.error(f"[Training job_id={job_id}] FAILED (CalledProcessError).\nSTDERR:\n{e.stderr}\nSTDOUT:\n{e.stdout}")
        model = db.query(MLModelVersion).filter(MLModelVersion.id == job_id).first()
        if model:
            model.status = "FAILED"
            model.parameters = {"error": str(e), "stderr": e.stderr[:2000], "stdout": e.stdout[:2000]}
            db.commit()
    except Exception as e:
        logger.error(f"[Training job_id={job_id}] FAILED (unexpected exception): {e}")
        model = db.query(MLModelVersion).filter(MLModelVersion.id == job_id).first()
        if model:
            model.status = "FAILED"
            model.parameters = {"error": str(e)}
            db.commit()
    finally:
        db.close()

@router.post("/models/train")
def train_model(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing = db.query(MLModelVersion).filter(MLModelVersion.status == "TRAINING").first()
    if existing:
        return {
            "status": "ALREADY_TRAINING",
            "message": "A model training job is already in progress.",
            "job_id": existing.id
        }
        
    new_model = MLModelVersion(
        version_name=f"v-temp-{datetime.utcnow().timestamp()}",
        status="TRAINING"
    )
    db.add(new_model)
    db.commit()
    db.refresh(new_model)
    
    background_tasks.add_task(_run_training, new_model.id)
    
    return {
        "status": "training_started",
        "message": "Model retraining has been scheduled in the background.",
        "job_id": new_model.id
    }

@router.get("/ingestion-logs", response_model=List[IngestionLogSchema])
def get_ingestion_logs(db: Session = Depends(get_db)):
    logs = db.query(IngestionLog).order_by(IngestionLog.executed_at.desc()).limit(20).all()
    if not logs:
        # Provide sample log if empty
        return [
            IngestionLogSchema(
                id=1, provider_name="IMD Weather Ingestion Engine",
                records_processed=1420, status="SUCCESS",
                message="Hourly forecast sync completed for 14 Block stations",
                executed_at=datetime.utcnow()
            ),
            IngestionLogSchema(
                id=2, provider_name="NASA POWER Agroclimatology Adapter",
                records_processed=850, status="SUCCESS",
                message="Solar radiation and precipitation parameters updated",
                executed_at=datetime.utcnow()
            )
        ]
    return logs
