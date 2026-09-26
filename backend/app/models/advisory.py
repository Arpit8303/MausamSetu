from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean
from app.db.session import Base

class CropProfile(Base):
    __tablename__ = "crop_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False) # e.g. Wheat, Rice, Maize, Sugarcane, Pulses, Mustard
    name_hi = Column(String(100), nullable=True) # गेहूं, धान, मक्का, गन्ना, दालें, सरसों
    category = Column(String(50), default="Cereal")
    optimal_temp_min_c = Column(Float, default=15.0)
    optimal_temp_max_c = Column(Float, default=28.0)
    water_requirement_mm = Column(Float, default=450.0)
    critical_stages = Column(JSON, nullable=True) # ["Sowing", "Crown Root Initiation", "Flowering", "Grain Filling", "Harvesting"]

class AgriculturalAdvisory(Base):
    __tablename__ = "agricultural_advisories"

    id = Column(Integer, primary_key=True, index=True)
    panchayat_id = Column(Integer, ForeignKey("panchayats.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    growth_stage = Column(String(100), default="Flowering Stage")
    title = Column(String(200), nullable=False)
    title_hi = Column(String(200), nullable=True)
    description = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=False)
    recommended_action_hi = Column(Text, nullable=True)
    
    risk_level = Column(String(20), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    confidence_pct = Column(Float, default=88.5)
    weather_trigger = Column(String(200), default="Expected Rainfall > 25mm in next 48h")
    is_official = Column(Boolean, default=False) # True if official IMD/KVK advisory, False if AI-generated
    created_at = Column(DateTime, default=datetime.utcnow)

class AlertRule(Base):
    __tablename__ = "alert_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    condition_type = Column(String(50), nullable=False) # HEAVY_RAINFALL, HEATWAVE, STRONG_WIND, DRY_SPELL
    threshold_value = Column(Float, nullable=False)
    severity = Column(String(20), default="WARNING") # INFO, WARNING, SEVERE, EMERGENCY
    message_template = Column(Text, nullable=False)
    is_enabled = Column(Boolean, default=True)

class UserNotification(Base):
    __tablename__ = "user_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="WEATHER_ALERT")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
