# backend/app/api/v1/treatments.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.treatment import Treatment
from app.models.flock import Flock
from app.models.farm import Farm
from app.schemas.treatment import TreatmentCreate, TreatmentResponse

router = APIRouter(prefix="/api/v1/treatments", tags=["Treatments"])


def check_flock_access(user: User, flock_id: UUID, db: Session) -> bool:
    """Vérifie si l'utilisateur a accès au lot"""
    if user.role == "admin":
        return True
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        return False
    farm = db.query(Farm).filter(Farm.id == flock.farm_id).first()
    if not farm:
        return False
    # Vétérinaire peut tout voir, agent seulement ses fermes
    if user.role == "veterinarian":
        return True
    # agent
    return farm.manager_id == user.id


@router.get("/", response_model=List[TreatmentResponse])
def get_treatments(
    flock_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les traitements - accessible à tous"""
    query = db.query(Treatment)
    
    if flock_id:
        if not check_flock_access(current_user, flock_id, db):
            raise HTTPException(status_code=403, detail="Accès non autorisé")
        query = query.filter(Treatment.flock_id == flock_id)
    elif current_user.role not in ["admin", "veterinarian"]:
        # Agent: filtrer par ses fermes
        farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
        farm_ids = [f.id for f in farms]
        if farm_ids:
            flocks = db.query(Flock.id).filter(Flock.farm_id.in_(farm_ids)).all()
            flock_ids = [f[0] for f in flocks]
            if flock_ids:
                query = query.filter(Treatment.flock_id.in_(flock_ids))
            else:
                return []
        else:
            return []
    
    return query.order_by(Treatment.start_date.desc()).all()


@router.post("/", response_model=TreatmentResponse)
def create_treatment(
    data: TreatmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un traitement - admin, vétérinaire et agent"""
    if current_user.role not in ["admin", "veterinarian", "agent"]:
        raise HTTPException(status_code=403, detail="Permission refusée")
    
    if not check_flock_access(current_user, data.flock_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé au lot")
    
    new_treatment = Treatment(
        disease_id=data.disease_id,
        flock_id=data.flock_id,
        medication=data.medication,
        dosage=data.dosage,
        start_date=data.start_date,
        end_date=data.end_date,
        notes=data.notes
    )
    db.add(new_treatment)
    db.commit()
    db.refresh(new_treatment)
    
    return new_treatment


@router.get("/{treatment_id}", response_model=TreatmentResponse)
def get_treatment(
    treatment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer un traitement par ID"""
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Traitement non trouvé")
    
    if not check_flock_access(current_user, treatment.flock_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    return treatment


@router.put("/{treatment_id}", response_model=TreatmentResponse)
def update_treatment(
    treatment_id: UUID,
    data: TreatmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour un traitement - admin et vétérinaire uniquement"""
    if current_user.role not in ["admin", "veterinarian"]:
        raise HTTPException(status_code=403, detail="Seuls admin et vétérinaire peuvent modifier")
    
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Traitement non trouvé")
    
    if not check_flock_access(current_user, treatment.flock_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(treatment, key, value)
    
    db.commit()
    db.refresh(treatment)
    
    return treatment


@router.delete("/{treatment_id}")
def delete_treatment(
    treatment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer un traitement - admin uniquement"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul l'admin peut supprimer")
    
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Traitement non trouvé")
    
    db.delete(treatment)
    db.commit()
    
    return {"message": "Traitement supprimé avec succès"}