from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class State(Base):
    __tablename__ = "states"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)

    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=False)
    code = Column(String(10), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    state = relationship("State", back_populates="districts")
    blocks = relationship("Block", back_populates="district", cascade="all, delete-orphan")

class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)
    code = Column(String(10), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, default=150.0) # Elev in meters
    area_sq_km = Column(Float, default=100.0)

    district = relationship("District", back_populates="blocks")
    panchayats = relationship("Panchayat", back_populates="block", cascade="all, delete-orphan")

class Panchayat(Base):
    __tablename__ = "panchayats"

    id = Column(Integer, primary_key=True, index=True)
    block_id = Column(Integer, ForeignKey("blocks.id"), nullable=False)
    code = Column(String(20), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, default=145.0) # Panchayat specific elevation DEM
    aspect = Column(Float, default=180.0) # Slope orientation
    slope = Column(Float, default=2.5) # Slope degrees
    area_sq_km = Column(Float, default=12.5)
    boundary_geojson = Column(JSON, nullable=True)

    block = relationship("Block", back_populates="panchayats")
