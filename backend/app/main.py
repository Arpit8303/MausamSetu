# Ensure repository root is in sys.path so 'ml' module can be imported
import os
import sys
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(REPO_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base
from app.db.seed import seed_database
from app.api import auth, locations, weather, ml, advisories, admin, ndvi

# Ensure DB tables and seed data exist
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception as e:
    print(f"Seed info: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MausamSetu: High-Resolution AI Weather Downscaling & Agro-Meteorological Advisory Platform for Indian Panchayats",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/testing ease
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(locations.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(ml.router, prefix=settings.API_V1_STR)
app.include_router(advisories.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(ndvi.router, prefix=settings.API_V1_STR)

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.weather_service import sync_district_rainfall_forecast
import logging

scheduler = AsyncIOScheduler()

@app.on_event("startup")
async def start_scheduler():
    logging.info("Starting background APScheduler...")
    scheduler.add_job(sync_district_rainfall_forecast, 'interval', hours=4)
    scheduler.start()

@app.on_event("shutdown")
async def stop_scheduler():
    scheduler.shutdown()

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
