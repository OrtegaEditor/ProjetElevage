from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.band import Band
from app.schemas.band import BandResponse, BandCreate

router = APIRouter(prefix="/api/v1/bands", tags=["Bands"])


@router.post("/", response_model=BandResponse)
def create_band(
    data: BandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_band = Band(**data.model_dump())
    db.add(new_band)
    db.commit()
    db.refresh(new_band)
    return new_band

@router.get("/", response_model=List[BandResponse])
def get_bands(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bands = db.query(Band).all()
    return bands


@router.get("/farm/{farm_id}", response_model=List[BandResponse])
def get_bands_by_farm(
    farm_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bands = db.query(Band).filter(
        Band.farm_id == farm_id,
        Band.status == "active"
    ).all()
    return bands


@router.get("/{band_id}", response_model=BandResponse)
def get_band(
    band_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    band = db.query(Band).filter(Band.id == band_id).first()
    if not band:
        raise HTTPException(status_code=404, detail="Bande non trouvée")
    return band




@router.put("/{band_id}", response_model=BandResponse)
def update_band(
    band_id: UUID,
    data: BandCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    band = db.query(Band).filter(Band.id == band_id).first()
    if not band:
        raise HTTPException(status_code=404, detail="Bande non trouvée")
    
    for key, value in data.model_dump().items():
        setattr(band, key, value)
    
    db.commit()
    db.refresh(band)
    return band


@router.delete("/{band_id}")
def delete_band(
    band_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    band = db.query(Band).filter(Band.id == band_id).first()
    if not band:
        raise HTTPException(status_code=404, detail="Bande non trouvée")
    
    db.delete(band)
    db.commit()
    return {"message": "Bande supprimée avec succès"}

