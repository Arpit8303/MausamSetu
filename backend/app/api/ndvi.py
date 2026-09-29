from fastapi import APIRouter, Query
from app.services.ndvi_service import get_ndvi_for_location

router = APIRouter(prefix="/ndvi", tags=["Satellite NDVI"])

@router.get("")
def fetch_ndvi(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_m: int = Query(2000, description="Radius in meters")
):
    return get_ndvi_for_location(lat, lng, radius_m)
