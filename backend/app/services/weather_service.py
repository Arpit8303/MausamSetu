import logging
from app.data_ingestion.imd import IMDWeatherProvider
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.weather import WeatherObservation, BlockForecast

logger = logging.getLogger(__name__)
imd_provider = IMDWeatherProvider()

async def get_district_forecast_service():
    raw_data = await imd_provider.get_district_rainfall_forecast()
    return raw_data

async def get_aws_data_service(state_id: int):
    raw_data = await imd_provider.get_aws_data(state_id)
    return raw_data

async def get_district_nowcast_service(district_id: int):
    raw_data = await imd_provider.get_district_nowcast(district_id)
    return raw_data

async def get_district_warning_service(district_id: int):
    raw_data = await imd_provider.get_district_warning(district_id)
    return raw_data

async def sync_district_rainfall_forecast():
    """Background polling function to run every 4 hours using APScheduler."""
    db = SessionLocal()
    try:
        data = await imd_provider.get_district_rainfall_forecast()
        
        # UPSERT Logic (Pseudo code placeholder tailored for weather data)
        # Note: Actual DB upsert depends on exact schema fields
        logger.info(f"Successfully fetched IMD District Rainfall Forecast. Upserting into DB...")
        
        # Assuming we update if weather data for that location+date exists, else insert
        # for row in data:
        #     existing = db.query(Weather).filter(Weather.location_id == row.get("district_id")).first()
        #     if existing:
        #         # Update fields
        #         pass
        #     else:
        #         # Insert new record
        #         pass
        # db.commit()
    except Exception as e:
        logger.error(f"Scheduled IMD Sync failed: {str(e)}")
    finally:
        db.close()
