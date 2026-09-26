from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class DownscaleRequest(BaseModel):
    block_id: int
    panchayat_ids: Optional[List[int]] = None
    forecast_lead_hours: int = 24

class MLModelMetricsResponse(BaseModel):
    version_name: str
    algorithm: str
    mae_temp_c: float
    rmse_temp_c: float
    r2_temp: float
    rain_precision: float
    rain_recall: float
    status: str
    trained_at: datetime
    parameters: Optional[Dict[str, Any]] = None

class MLStatusResponse(BaseModel):
    active_model_version: str
    status: str
    last_trained: datetime
    baseline_mae_c: float
    downscaled_mae_c: float
    improvement_pct: float
    total_panchayats_covered: int
