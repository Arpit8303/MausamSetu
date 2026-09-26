from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.location import Panchayat
from app.models.advisory import CropProfile
from app.services.advisory_engine import AdvisoryEngine
from app.services.alert_engine import AlertEngine
from app.data_ingestion.demo_provider import DemoWeatherProvider
from ml.downscaling_engine import WeatherDownscaler
from app.schemas.advisory import AdvisoryResponse, AdvisoryGenerateRequest, CropProfileResponse, AlertResponse

router = APIRouter(prefix="/advisories", tags=["Agro-Meteorological Advisory Center"])
downscaler = WeatherDownscaler()
demo_provider = DemoWeatherProvider()

@router.get("", response_model=List[AdvisoryResponse])
async def get_panchayat_advisories(
    panchayat_id: int = Query(...),
    crop_name: str = Query("Wheat"),
    growth_stage: str = Query("Flowering Stage"),
    db: Session = Depends(get_db)
):
    panchayat = db.query(Panchayat).filter(Panchayat.id == panchayat_id).first()
    if not panchayat:
        raise HTTPException(status_code=404, detail="Panchayat not found.")

    block = panchayat.block
    raw_block = await demo_provider.fetch_block_forecast(block.latitude, block.longitude, days=1)
    b_forecast = raw_block[0]
    
    p_meta = {"id": panchayat.id, "name": panchayat.name, "latitude": panchayat.latitude, "longitude": panchayat.longitude, "elevation": panchayat.elevation, "slope": panchayat.slope, "aspect": panchayat.aspect}
    b_meta = {"id": block.id, "name": block.name, "latitude": block.latitude, "longitude": block.longitude, "elevation": block.elevation}
    
    downscaled = downscaler.predict_panchayat_forecast(b_forecast, b_meta, p_meta)
    
    generated = AdvisoryEngine.generate_advisories(
        crop_name=crop_name,
        growth_stage=growth_stage,
        forecast=downscaled
    )

    results: List[AdvisoryResponse] = []
    for idx, adv in enumerate(generated):
        results.append(AdvisoryResponse(
            id=1000 + idx,
            panchayat_id=panchayat.id,
            panchayat_name=panchayat.name,
            crop_name=crop_name,
            growth_stage=growth_stage,
            title=adv["title"],
            title_hi=adv.get("title_hi"),
            description=adv["description"],
            description_hi=adv.get("description_hi"),
            recommended_action=adv["recommended_action"],
            recommended_action_hi=adv.get("recommended_action_hi"),
            risk_level=adv["risk_level"],
            confidence_pct=adv["confidence_pct"],
            weather_trigger=adv["weather_trigger"],
            is_official=adv["is_official"],
            created_at=datetime.utcnow()
        ))
    return results

@router.post("/generate", response_model=List[AdvisoryResponse])
async def generate_custom_advisory(req: AdvisoryGenerateRequest, db: Session = Depends(get_db)):
    return await get_panchayat_advisories(
        panchayat_id=req.panchayat_id,
        crop_name=req.crop_name,
        growth_stage=req.growth_stage,
        db=db
    )

@router.get("/crops", response_model=List[CropProfileResponse])
def get_crop_profiles(db: Session = Depends(get_db)):
    return db.query(CropProfile).all()

@router.get("/alerts", response_model=List[AlertResponse])
async def get_active_alerts(panchayat_id: Optional[int] = None, db: Session = Depends(get_db)):
    query_panchayats = db.query(Panchayat)
    if panchayat_id:
        query_panchayats = query_panchayats.filter(Panchayat.id == panchayat_id)
    
    all_alerts = []
    for p in query_panchayats.limit(5).all():
        b = p.block
        raw_b = await demo_provider.fetch_block_forecast(b.latitude, b.longitude, days=1)
        down = downscaler.predict_panchayat_forecast(raw_b[0], {"latitude": b.latitude, "longitude": b.longitude, "elevation": b.elevation}, {"latitude": p.latitude, "longitude": p.longitude, "elevation": p.elevation})
        p_alerts = AlertEngine.evaluate_panchayat_alerts(down, p.id, p.name)
        for a in p_alerts:
            all_alerts.append(AlertResponse(
                id=a["id"],
                title=a["title"],
                message=a["message"],
                severity=a["severity"],
                panchayat_id=p.id,
                panchayat_name=p.name,
                created_at=datetime.utcnow()
            ))
    return all_alerts
