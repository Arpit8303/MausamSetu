import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MausamSetu"
    TAGLINE: str = "Har Panchayat Ka Mausam, Har Kisan Ke Naam"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mausamsetu-super-secret-jwt-key-production-v1")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # SQLite default fallback with PostGIS compatibility
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./meghsetu.db")
    
    # Provider Settings & API Keys
    IMD_API_KEY: str = os.getenv("IMD_API_KEY", "")
    NASA_POWER_ENABLED: bool = True
    ERA5_ENABLED: bool = True
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
