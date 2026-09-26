import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserRole(str, enum.Enum):
    FARMER = "farmer"
    AGRICULTURAL_OFFICER = "agricultural_officer"
    ADMINISTRATOR = "administrator"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=True)
    role = Column(String, default=UserRole.FARMER.value, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=True)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=True)
    panchayat_id = Column(Integer, ForeignKey("panchayats.id"), nullable=True)
    primary_crop = Column(String, nullable=True, default="Wheat")
    soil_type = Column(String, nullable=True, default="Alluvial")
    irrigation_type = Column(String, nullable=True, default="Canal / Tube Well")
    preferred_language = Column(String, default="en")

    user = relationship("User", back_populates="preferences")
