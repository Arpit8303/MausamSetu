from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class CurrentWeatherResponse(BaseModel):
    panchayat_id: int
    panchayat_name: str
    block_name: str
    district_name: str
    state_name: str
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
    current: CurrentWeatherResponse
    hourly: List[HourlyForecastItem]
    daily: List[DailyForecastItem]

class CompareBlockPanchayatResponse(BaseModel):
    block_name: str
    block_temp_min: float
    block_temp_max: float
    block_rainfall_mm: float
    panchayats: List[dict]
