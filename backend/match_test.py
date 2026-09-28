import os
import sys
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add backend to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app.models.location import State, District

DATABASE_URL = "sqlite:///meghsetu.db"  # Check .env or default to sqlite
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def match_lgd():
    db = SessionLocal()
    
    # Get DB states and districts
    db_states = {s.name.lower(): s for s in db.query(State).all()}
    db_districts = {(d.state.name.lower(), d.name.lower()): d for d in db.query(District).join(State).all()}
    
    # Read CSV
    csv_file = "data/lgd/all_villages_cleaned.csv"
    print("Reading CSV...")
    
    # Use chunksize to not load entire file if it's too big, but we only need unique states/districts
    df_iter = pd.read_csv(csv_file, usecols=['state_code', 'state_name', 'district_code', 'district_name'], chunksize=50000)
    
    csv_states = {}
    csv_districts = {}
    
    for chunk in df_iter:
        # Filter out junk row
        chunk = chunk[(chunk['district_code'] != 0)]
        
        for _, row in chunk.drop_duplicates(subset=['state_code']).iterrows():
            csv_states[row['state_name'].lower()] = (row['state_code'], row['state_name'])
            
        for _, row in chunk.drop_duplicates(subset=['state_code', 'district_code']).iterrows():
            csv_districts[(row['state_name'].lower(), row['district_name'].lower())] = (row['district_code'], row['district_name'])

    # Match States
    state_matches = []
    state_new = []
    for s_name_lower, (s_code, s_name) in csv_states.items():
        if s_name_lower in db_states:
            state_matches.append(s_name)
        else:
            state_new.append(s_name)
            
    # Match Districts
    district_matches = []
    district_new = []
    for (s_name_lower, d_name_lower), (d_code, d_name) in csv_districts.items():
        if (s_name_lower, d_name_lower) in db_districts:
            district_matches.append(d_name)
        else:
            district_new.append(d_name)
            
    print(f"\n--- STATE MATCHING ---")
    print(f"Matched: {len(state_matches)} existing states")
    print(f"New to insert: {len(state_new)} ({', '.join(state_new[:10])}{'...' if len(state_new) > 10 else ''})")
    
    print(f"\n--- DISTRICT MATCHING ---")
    print(f"Matched: {len(district_matches)} existing districts")
    print(f"New to insert: {len(district_new)} (showing up to 20: {', '.join(district_new[:20])})")
    
    db.close()

if __name__ == "__main__":
    match_lgd()
