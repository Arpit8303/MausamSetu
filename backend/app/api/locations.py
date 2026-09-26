from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.location import State, District, Block, Panchayat
from app.schemas.location import StateSchema, DistrictSchema, BlockSchema, PanchayatSchema

router = APIRouter(prefix="/locations", tags=["Geospatial & Locations"])

@router.get("/states", response_model=List[StateSchema])
def get_states(db: Session = Depends(get_db)):
    return db.query(State).all()

@router.get("/districts", response_model=List[DistrictSchema])
def get_districts(state_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(District)
    if state_id:
        query = query.filter(District.state_id == state_id)
    return query.all()

@router.get("/blocks", response_model=List[BlockSchema])
def get_blocks(district_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Block)
    if district_id:
        query = query.filter(Block.district_id == district_id)
    return query.all()

@router.get("/panchayats", response_model=List[PanchayatSchema])
def get_panchayats(block_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Panchayat)
    if block_id:
        query = query.filter(Panchayat.block_id == block_id)
    return query.all()

@router.get("/panchayats/{panchayat_id}", response_model=PanchayatSchema)
def get_panchayat_by_id(panchayat_id: int, db: Session = Depends(get_db)):
    panchayat = db.query(Panchayat).filter(Panchayat.id == panchayat_id).first()
    if not panchayat:
        raise HTTPException(status_code=404, detail=f"Panchayat with ID {panchayat_id} not found.")
    return panchayat
