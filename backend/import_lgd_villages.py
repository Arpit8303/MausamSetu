import os
import sys
import pandas as pd
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
import math
import time

# Ensure repository root is in sys.path
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(REPO_ROOT)

from app.core.config import settings
from app.models.location import State, District, Subdistrict, Village

# Determine dialect for on_conflict_do_nothing
if settings.DATABASE_URL.startswith("postgresql"):
    from sqlalchemy.dialects.postgresql import insert as upsert_insert
else:
    from sqlalchemy.dialects.sqlite import insert as upsert_insert

CSV_PATH = os.path.join(REPO_ROOT, "backend", "data", "lgd", "all_villages_cleaned.csv")

def get_engine_and_session():
    engine = create_engine(settings.DATABASE_URL, echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, SessionLocal()

def normalize_name(name):
    if pd.isna(name): return ""
    return str(name).strip().upper()

def import_lgd_data():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV not found at {CSV_PATH}")
        return

    print("Loading CSV...")
    df = pd.read_csv(CSV_PATH, dtype=str)
    print(f"Total rows in CSV: {len(df)}")

    engine, session = get_engine_and_session()
    
    # 1. Update State & District LGD codes
    print("\n--- Updating State & District LGD Codes ---")
    
    # Existing DB states and districts
    db_states = {s.name.upper(): s for s in session.query(State).all()}
    db_districts = {d.name.upper(): d for d in session.query(District).all()}
    
    csv_states = df[['state_name', 'state_code']].drop_duplicates()
    for _, row in csv_states.iterrows():
        name = normalize_name(row['state_name'])
        code = row['state_code']
        if name in db_states:
            db_states[name].lgd_code = code
    
    csv_districts = df[['district_name', 'district_code']].drop_duplicates()
    for _, row in csv_districts.iterrows():
        name = normalize_name(row['district_name'])
        code = row['district_code']
        if name in db_districts:
            db_districts[name].lgd_code = code
            
    session.commit()
    print("State & District LGD codes updated.")
    
    # Re-fetch maps based on LGD codes
    db_districts_by_lgd = {d.lgd_code: d.id for d in session.query(District).filter(District.lgd_code.isnot(None)).all()}
    
    # 2. Extract Subdistricts from CSV
    print("\n--- Inserting Subdistricts ---")
    subdistricts_df = df[['subdistrict_code', 'subdistrict_name', 'district_code']].drop_duplicates()
    
    subdistrict_insert_list = []
    for _, row in subdistricts_df.iterrows():
        dist_code = row['district_code']
        if dist_code in db_districts_by_lgd:
            subdistrict_insert_list.append({
                "district_id": db_districts_by_lgd[dist_code],
                "code": row['subdistrict_code'],
                "name": str(row['subdistrict_name']).strip(),
                "name_hi": None
            })
            
    if subdistrict_insert_list:
        stmt = upsert_insert(Subdistrict).values(subdistrict_insert_list)
        stmt = stmt.on_conflict_do_nothing(
            index_elements=['district_id', 'code']
        )
        session.execute(stmt)
        session.commit()
        print(f"Inserted {len(subdistrict_insert_list)} Subdistricts.")
    
    # Build Subdistrict ID Map
    # Keyed by (district_id, code) as agreed in the plan
    db_subdistricts = session.query(Subdistrict.id, Subdistrict.district_id, Subdistrict.code).all()
    sub_map = {(r.district_id, r.code): r.id for r in db_subdistricts}
    
    # 3. Insert Villages in Chunks
    print("\n--- Inserting Villages ---")
    village_records = []
    for _, row in df.iterrows():
        dist_code = row['district_code']
        sub_code = row['subdistrict_code']
        
        if dist_code in db_districts_by_lgd:
            dist_id = db_districts_by_lgd[dist_code]
            if (dist_id, sub_code) in sub_map:
                sub_id = sub_map[(dist_id, sub_code)]
                village_records.append({
                    "subdistrict_id": sub_id,
                    "code": row['village_code'],
                    "name": str(row['village_name']).strip(),
                    "name_hi": None
                })
                
    CHUNK_SIZE = 5000
    total = len(village_records)
    print(f"Total Villages to insert: {total}")
    
    for i in range(0, total, CHUNK_SIZE):
        chunk = village_records[i:i + CHUNK_SIZE]
        stmt = upsert_insert(Village).values(chunk)
        stmt = stmt.on_conflict_do_nothing(
            index_elements=['code'] # Village code is globally unique
        )
        session.execute(stmt)
        session.commit()
        
        if (i // CHUNK_SIZE) % 10 == 0:
            print(f"Inserted {i + len(chunk)} / {total} villages...")
            
    print("\n✅ LGD Village Import Complete!")

if __name__ == "__main__":
    start_time = time.time()
    import_lgd_data()
    print(f"Finished in {round(time.time() - start_time, 2)} seconds.")
