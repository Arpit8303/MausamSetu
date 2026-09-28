import os
import ee
from datetime import datetime, timedelta
from fastapi import HTTPException
from app.core.config import settings

class EarthEngineProvider:
    def __init__(self):
        self._initialized = False

    def _initialize_ee(self):
        if self._initialized:
            return
        try:
            sa_email = os.getenv("GEE_SERVICE_ACCOUNT_EMAIL")
            sa_key = os.getenv("GEE_PRIVATE_KEY_PATH")
            project = os.getenv("GEE_PROJECT_ID", "absolute-codex-286216")

            if sa_email and sa_key and os.path.exists(sa_key):
                credentials = ee.ServiceAccountCredentials(sa_email, sa_key)
                ee.Initialize(credentials, project=project)
            else:
                ee.Initialize(project=project)
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Google Earth Engine Authentication Failed: {str(e)}")
        self._initialized = True

    def get_ndvi(self, lat: float, lng: float, radius_m: int = 2000) -> dict:
        self._initialize_ee()
        try:
            point = ee.Geometry.Point([lng, lat])
            region = point.buffer(radius_m)
            
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=30)
            
            collection = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                          .filterBounds(region)
                          .filterDate(start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))
                          .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                          .sort('CLOUDY_PIXEL_PERCENTAGE'))
            
            if collection.size().getInfo() == 0:
                raise HTTPException(status_code=404, detail="No suitable clear-sky imagery found for this location in the last 30 days.")
                
            image = ee.Image(collection.first())
            
            ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
            
            avg_ndvi_dict = ndvi.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=10,
                maxPixels=1e9
            ).getInfo()
            
            avg_ndvi_val = avg_ndvi_dict.get('NDVI')
            
            vis_params = {'min': 0, 'max': 1, 'palette': ['red', 'yellow', 'green']}
            map_id_dict = ee.Image(ndvi).getMapId(vis_params)
            tile_url = map_id_dict['tile_fetcher'].url_format
            
            date_used = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd').getInfo()
            
            return {
                "avg_ndvi": round(avg_ndvi_val, 4) if avg_ndvi_val is not None else 0.0,
                "tile_url": tile_url,
                "date_used": date_used
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Google Earth Engine Computation Failed: {str(e)}")
