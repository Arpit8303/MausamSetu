from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone_number: Optional[str] = None
    role: str = "farmer" # farmer, agricultural_officer, administrator
    state_id: Optional[int] = None
    district_id: Optional[int] = None
    block_id: Optional[int] = None
    panchayat_id: Optional[int] = None
    primary_crop: Optional[str] = "Wheat"

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    phone_number: Optional[str] = None
    state_id: Optional[int] = None
    district_id: Optional[int] = None
    block_id: Optional[int] = None
    panchayat_id: Optional[int] = None
    primary_crop: Optional[str] = "Wheat"

    class Config:
        from_attributes = True
