from typing import Optional, List, Any
from pydantic import BaseModel

class StateSchema(BaseModel):
    id: int
    code: str
    name: str
    name_hi: Optional[str] = None

    class Config:
        from_attributes = True

class DistrictSchema(BaseModel):
    id: int
    state_id: int
    code: str
    name: str
    name_hi: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True

class BlockSchema(BaseModel):
    id: int
    district_id: int
    code: str
    name: str
    name_hi: Optional[str] = None
    latitude: float
    longitude: float
    elevation: float
    area_sq_km: float

    class Config:
        from_attributes = True

class PanchayatSchema(BaseModel):
    id: int
    block_id: int
    code: str
    name: str
    name_hi: Optional[str] = None
    latitude: float
    longitude: float
    elevation: float
    aspect: float
    slope: float
    area_sq_km: float
    boundary_geojson: Optional[Any] = None

    class Config:
        from_attributes = True
