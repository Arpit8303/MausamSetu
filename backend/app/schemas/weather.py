from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class NDVIData(BaseModel):
    avg_ndvi: float
    tile_url: str
    generated_at: str

class AdvisoryData(BaseModel):
    title: str
    title_hi: str
    description: str
    description_hi: str
    recommended_action: str
    recommended_action_hi: str
    risk_level: str
    confidence_pct: float
    weather_trigger: str
    is_official: bool

class CurrentWeatherResponse(BaseModel):
    panchayat_id: int
    panchayat_name: str
    block_name: str
    district_name: str
    state_name: str
    latitude: float
    longitude: float
    timestamp: datetime
    temp_c: float
    feels_like_c: float
    temp_min_c: float
    temp_max_c: float
    humidity_pct: float
    precipitation_mm: float
    precipitation_prob_pct: float
    wind_speed_kmh: float
    wind_direction_deg: float
    pressure_hpa: float
    weather_condition: str
    confidence_score: float
    uncertainty_margin_c: float
    provider_source: str
    is_simulated: bool
    
    # New Fields
    data_source: str
    weather_cached: bool
    stale: bool
    downscaled: bool
    warnings: Optional[List[str]] = None
    ndvi: Optional[NDVIData] = None
    ndvi_as_of: Optional[datetime] = None
    advisories: Optional[List[AdvisoryData]] = None

class HourlyForecastItem(BaseModel):
    timestamp: str
    hour: int
    temp_c: float
    humidity_pct: float
    precipitation_mm: float
    precipitation_prob_pct: float
    wind_speed_kmh: float
    weather_condition: str

class DailyForecastItem(BaseModel):
    date: str
    day_name: str
    temp_min_c: float
    temp_max_c: float
    humidity_pct: float
    precipitation_mm: float
    precipitation_prob_pct: float
    wind_speed_kmh: float
    weather_condition: str
    risk_level: str

class WeatherForecastResponse(BaseModel):
    panchayat_id: int
    panchayat_name: str
    block_name: str
    district_name: str
    elevation_m: float
    model_version: str
    generated_at: datetime
    data_source: str
    weather_cached: bool
    stale: bool
    downscaled: bool
    current: CurrentWeatherResponse
    hourly: List[HourlyForecastItem]
    daily: List[DailyForecastItem]
    warnings: Optional[List[str]] = None
    ndvi: Optional[NDVIData] = None
    ndvi_as_of: Optional[datetime] = None
    advisories: Optional[List[AdvisoryData]] = None

class CompareBlockPanchayatResponse(BaseModel):
    block_name: str
    block_temp_min: float
    block_temp_max: float
    block_rainfall_mm: float
    panchayats: List[dict]
