# backend/app/api/v1/diseases.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.disease import Disease
from app.schemas.disease import (
    DiseaseCreate,
    DiseaseUpdate,
    DiseaseResponse,
    DiseaseListResponse
)

router = APIRouter(prefix="/api/v1/diseases", tags=["Diseases"])


# ============ GET ALL ============
@router.get("/", response_model=DiseaseListResponse)
def get_diseases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer la liste des maladies - accessible à tous"""
    query = db.query(Disease)
    
    if search:
        query = query.filter(Disease.name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.order_by(Disease.name).offset(skip).limit(limit).all()
    
    return DiseaseListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit
    )


# ============ GET BY ID ============
@router.get("/{disease_id}", response_model=DiseaseResponse)
def get_disease(
    disease_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer une maladie par son ID - accessible à tous"""
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Maladie non trouvée")
    return disease


# ============ CREATE ============
@router.post("/", response_model=DiseaseResponse, status_code=201)
def create_disease(
    data: DiseaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer une nouvelle maladie - admin et vétérinaire uniquement"""
    if current_user.role not in ["admin", "veterinarian"]:
        raise HTTPException(status_code=403, detail="Permission refusée. Seuls admin et vétérinaire peuvent créer")
    
    existing = db.query(Disease).filter(Disease.name == data.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Cette maladie existe déjà")
    
    disease = Disease(**data.model_dump())
    db.add(disease)
    db.commit()
    db.refresh(disease)
    return disease


# ============ UPDATE ============
@router.put("/{disease_id}", response_model=DiseaseResponse)
def update_disease(
    disease_id: UUID,
    data: DiseaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour une maladie - admin et vétérinaire uniquement"""
    if current_user.role not in ["admin", "veterinarian"]:
        raise HTTPException(status_code=403, detail="Permission refusée. Seuls admin et vétérinaire peuvent modifier")
    
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Maladie non trouvée")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(disease, key, value)
    
    db.commit()
    db.refresh(disease)
    return disease


# ============ DELETE ============
@router.delete("/{disease_id}", status_code=204)
def delete_disease(
    disease_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer une maladie - admin uniquement"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent supprimer")
    
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Maladie non trouvée")
    
    db.delete(disease)
    db.commit()
    return None