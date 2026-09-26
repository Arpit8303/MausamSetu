from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class AdvisoryGenerateRequest(BaseModel):
    panchayat_id: int
    crop_name: str = "Wheat"
    growth_stage: str = "Flowering Stage"
    soil_type: str = "Alluvial"
    irrigation_type: str = "Canal"

class AdvisoryResponse(BaseModel):
    id: int
    panchayat_id: int
    panchayat_name: str
    crop_name: str
    growth_stage: str
    title: str
    title_hi: Optional[str] = None
    description: str
    description_hi: Optional[str] = None
    recommended_action: str
    recommended_action_hi: Optional[str] = None
    risk_level: str # LOW, MEDIUM, HIGH, CRITICAL
    confidence_pct: float
    weather_trigger: str
    is_official: bool
    created_at: datetime

class CropProfileResponse(BaseModel):
    id: int
    name: str
    name_hi: Optional[str] = None
    category: str
    optimal_temp_min_c: float
    optimal_temp_max_c: float
    water_requirement_mm: float
    critical_stages: List[str]

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: int
    title: str
    message: str
    severity: str
    panchayat_id: int
    panchayat_name: str
    created_at: datetime
