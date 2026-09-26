import os
import sys
from datetime import datetime
from sqlalchemy.orm import Session

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.db.session import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole, UserPreference
from app.models.location import State, District, Block, Panchayat
from app.models.weather import WeatherObservation, BlockForecast, DownscaledPanchayatForecast
from app.models.advisory import CropProfile, AgriculturalAdvisory, AlertRule
from app.models.ml_model import MLModelVersion, IngestionLog, AuditLog

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Users if not existing
        if not db.query(User).filter(User.email == "admin@mausamsetu.in").first():
            admin_user = User(
                email="admin@mausamsetu.in",
                hashed_password=get_password_hash("Admin@123"),
                full_name="Dr. Rajesh Sharma (Administrator)",
                phone_number="+91-9876543210",
                role=UserRole.ADMINISTRATOR.value,
                is_active=True,
                is_verified=True
            )
            officer_user = User(
                email="officer@mausamsetu.in",
                hashed_password=get_password_hash("Officer@123"),
                full_name="Priya Verma (District Agri Officer)",
                phone_number="+91-9876543211",
                role=UserRole.AGRICULTURAL_OFFICER.value,
                is_active=True,
                is_verified=True
            )
            farmer_user = User(
                email="farmer@mausamsetu.in",
                hashed_password=get_password_hash("Farmer@123"),
                full_name="Ramesh Kumar (Progressive Farmer)",
                phone_number="+91-9876543212",
                role=UserRole.FARMER.value,
                is_active=True,
                is_verified=True
            )
            db.add_all([admin_user, officer_user, farmer_user])
            db.commit()

        # 2. Seed Location Hierarchy
        if not db.query(State).first():
            up_state = State(code="UP", name="Uttar Pradesh", name_hi="उत्तर प्रदेश")
            mh_state = State(code="MH", name="Maharashtra", name_hi="महाराष्ट्र")
            pb_state = State(code="PB", name="Punjab", name_hi="पंजाब")
            db.add_all([up_state, mh_state, pb_state])
            db.commit()

            # Lucknow District under UP
            lko_dist = District(state_id=up_state.id, code="LKO", name="Lucknow", name_hi="लखनऊ", latitude=26.8467, longitude=80.9462)
            pune_dist = District(state_id=mh_state.id, code="PUN", name="Pune", name_hi="पुणे", latitude=18.5204, longitude=73.8567)
            db.add_all([lko_dist, pune_dist])
            db.commit()

            # Blocks under Lucknow
            sarojini_block = Block(
                district_id=lko_dist.id, code="SRJ", name="Sarojini Nagar", name_hi="सरोजिनी नगर",
                latitude=26.7500, longitude=80.8700, elevation=125.0, area_sq_km=145.0
            )
            chinhat_block = Block(
                district_id=lko_dist.id, code="CHN", name="Chinhat", name_hi="चिनहट",
                latitude=26.8800, longitude=81.0500, elevation=130.0, area_sq_km=110.0
            )
            db.add_all([sarojini_block, chinhat_block])
            db.commit()

            # Panchayats under Sarojini Nagar Block
            p1 = Panchayat(
                block_id=sarojini_block.id, code="GP01", name="Amausi", name_hi="अमौसी",
                latitude=26.7620, longitude=80.8810, elevation=128.0, aspect=175.0, slope=1.8, area_sq_km=12.0,
                boundary_geojson={
                    "type": "Polygon",
                    "coordinates": [[[80.87, 26.75], [80.89, 26.75], [80.89, 26.77], [80.87, 26.77], [80.87, 26.75]]]
                }
            )
            p2 = Panchayat(
                block_id=sarojini_block.id, code="GP02", name="Chillawan", name_hi="चिल्लावां",
                latitude=26.7410, longitude=80.8620, elevation=122.0, aspect=190.0, slope=2.2, area_sq_km=14.5,
                boundary_geojson={
                    "type": "Polygon",
                    "coordinates": [[[80.85, 26.73], [80.87, 26.73], [80.87, 26.75], [80.85, 26.75], [80.85, 26.73]]]
                }
            )
            p3 = Panchayat(
                block_id=sarojini_block.id, code="GP03", name="Piparsand", name_hi="पीपरसंड",
                latitude=26.7280, longitude=80.8430, elevation=135.0, aspect=160.0, slope=3.1, area_sq_km=11.0,
                boundary_geojson={
                    "type": "Polygon",
                    "coordinates": [[[80.83, 26.71], [80.85, 26.71], [80.85, 26.73], [80.83, 26.73], [80.83, 26.71]]]
                }
            )
            p4 = Panchayat(
                block_id=chinhat_block.id, code="GP04", name="Mati", name_hi="माटी",
                latitude=26.8920, longitude=81.0620, elevation=132.0, aspect=180.0, slope=2.0, area_sq_km=15.0,
                boundary_geojson={
                    "type": "Polygon",
                    "coordinates": [[[81.05, 26.88], [81.07, 26.88], [81.07, 26.90], [81.05, 26.90], [81.05, 26.88]]]
                }
            )
            db.add_all([p1, p2, p3, p4])
            db.commit()

            # Connect Farmer Preference
            farmer = db.query(User).filter(User.email == "farmer@mausamsetu.in").first()
            if farmer:
                pref = UserPreference(
                    user_id=farmer.id,
                    state_id=up_state.id,
                    district_id=lko_dist.id,
                    block_id=sarojini_block.id,
                    panchayat_id=p1.id,
                    primary_crop="Wheat",
                    soil_type="Alluvial",
                    irrigation_type="Canal / Tube Well"
                )
                db.add(pref)
                db.commit()

        # 3. Seed Crop Profiles
        if not db.query(CropProfile).first():
            crops = [
                CropProfile(name="Wheat", name_hi="गेहूं", category="Cereal", optimal_temp_min_c=12.0, optimal_temp_max_c=25.0, water_requirement_mm=450.0, critical_stages=["Sowing", "Crown Root Initiation", "Flowering", "Grain Filling"]),
                CropProfile(name="Rice", name_hi="धान", category="Cereal", optimal_temp_min_c=20.0, optimal_temp_max_c=35.0, water_requirement_mm=1200.0, critical_stages=["Transplanting", "Tillering", "Panicle Initiation", "Flowering"]),
                CropProfile(name="Maize", name_hi="मक्का", category="Cereal", optimal_temp_min_c=18.0, optimal_temp_max_c=32.0, water_requirement_mm=500.0, critical_stages=["Knee High", "Tasseling", "Silking", "Dough Stage"]),
                CropProfile(name="Sugarcane", name_hi="गन्ना", category="Cash Crop", optimal_temp_min_c=20.0, optimal_temp_max_c=38.0, water_requirement_mm=1800.0, critical_stages=["Germination", "Formative", "Grand Growth", "Maturity"]),
                CropProfile(name="Pulses", name_hi="दालें", category="Pulse", optimal_temp_min_c=15.0, optimal_temp_max_c=30.0, water_requirement_mm=350.0, critical_stages=["Branching", "Flowering", "Pod Development"]),
                CropProfile(name="Mustard", name_hi="सरसों", category="Oilseed", optimal_temp_min_c=10.0, optimal_temp_max_c=25.0, water_requirement_mm=300.0, critical_stages=["Rosette", "Flowering", "Pod Formation"])
            ]
            db.add_all(crops)
            db.commit()

        # 4. Seed ML Model Metadata
        if not db.query(MLModelVersion).first():
            ml_ver = MLModelVersion(
                version_name="v1.0.0-xgb-rf",
                algorithm="Multi-Output Random Forest + Elevation Lapse Rate",
                mae_temp_c=0.42,
                rmse_temp_c=0.58,
                r2_temp=0.94,
                rain_precision=0.89,
                rain_recall=0.91,
                status="ACTIVE",
                artifact_path="ml/artifacts/downscaling_v1.joblib"
            )
            db.add(ml_ver)
            db.commit()

        print("Database seeded successfully with default Indian locations, crops, demo accounts, and ML metadata.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
