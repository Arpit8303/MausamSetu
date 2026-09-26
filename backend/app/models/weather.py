from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=False)
    timestamp = Column(DateTime, index=True, default=datetime.utcnow)
    temp_c = Column(Float, nullable=False)
    temp_min_c = Column(Float, nullable=False)
    temp_max_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    precipitation_mm = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=10.0)
    wind_direction_deg = Column(Float, default=180.0)
    pressure_hpa = Column(Float, default=1013.25)
    source_provider = Column(String, default="IMD / NASA POWER")
    is_live = Column(String, default="true")

class BlockForecast(Base):
    __tablename__ = "block_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=False)
    forecast_date = Column(DateTime, index=True, nullable=False)
    lead_time_hours = Column(Integer, default=24)
    temp_min_c = Column(Float, nullable=False)
    temp_max_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    precipitation_mm = Column(Float, default=0.0)
    precipitation_prob_pct = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=12.0)
    wind_direction_deg = Column(Float, default=180.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class DownscaledPanchayatForecast(Base):
    __tablename__ = "downscaled_panchayat_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    panchayat_id = Column(Integer, ForeignKey("panchayats.id"), nullable=False)
    block_forecast_id = Column(Integer, ForeignKey("block_forecasts.id"), nullable=True)
    forecast_date = Column(DateTime, index=True, nullable=False)
    temp_min_c = Column(Float, nullable=False)
    temp_max_c = Column(Float, nullable=False)
    temp_avg_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    precipitation_mm = Column(Float, default=0.0)
    precipitation_prob_pct = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=10.0)
    wind_direction_deg = Column(Float, default=180.0)
    
    confidence_score = Column(Float, default=0.92) # 0 to 1
    uncertainty_margin_c = Column(Float, default=0.6) # +/- deg C uncertainty
    model_version = Column(String, default="v1.0-XGBoost")
    provider_source = Column(String, default="MausamSetu Downscaling Engine")
    is_simulated = Column(String, default="false")
    created_at = Column(DateTime, default=datetime.utcnow)
