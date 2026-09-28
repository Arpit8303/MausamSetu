from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from app.db.session import Base

class MLModelVersion(Base):
    __tablename__ = "ml_model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String(100), unique=True, index=True, nullable=False) # e.g. v1.0.0-xgb
    algorithm = Column(String(100), default="XGBoost Regressor + Elevation Lapse Rate")
    parameters = Column(JSON, nullable=True)
    mae_temp_c = Column(Float, default=0.42)
    rmse_temp_c = Column(Float, default=0.58)
    r2_temp = Column(Float, default=0.94)
    rain_precision = Column(Float, default=0.89)
    rain_recall = Column(Float, default=0.91)
    status = Column(String(50), default="ACTIVE") # ACTIVE, ARCHIVED, TRAINING, FAILED
    trained_at = Column(DateTime, default=datetime.utcnow)
    artifact_path = Column(String, default="ml/artifacts/downscaling_v1.joblib")

class IngestionLog(Base):
    __tablename__ = "ingestion_logs"

    id = Column(Integer, primary_key=True, index=True)
    provider_name = Column(String(100), nullable=False) # IMD, NASA POWER, ERA5, CSV Upload
    records_processed = Column(Integer, default=0)
    status = Column(String(50), default="SUCCESS") # SUCCESS, FAILED, PARTIAL
    message = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False) # LOGIN, MODEL_TRAIN, DATASET_UPLOAD, CONFIG_CHANGE
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow)
