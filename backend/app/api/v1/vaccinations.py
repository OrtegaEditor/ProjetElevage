# backend/app/api/v1/vaccinations.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.vaccination import Vaccination
from app.models.flock import Flock
from app.models.farm import Farm
from app.schemas.vaccination import VaccinationCreate, VaccinationResponse

router = APIRouter(prefix="/api/v1/vaccinations", tags=["Vaccinations"])


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
    if user.role == "veterinarian":
        return True
    return farm.manager_id == user.id


@router.get("/", response_model=List[VaccinationResponse])
def get_vaccinations(
    flock_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les vaccinations - accessible à tous"""
    query = db.query(Vaccination)
    
    if flock_id:
        if not check_flock_access(current_user, flock_id, db):
            raise HTTPException(status_code=403, detail="Accès non autorisé")
        query = query.filter(Vaccination.flock_id == flock_id)
    elif current_user.role not in ["admin", "veterinarian"]:
        farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
        farm_ids = [f.id for f in farms]
        if farm_ids:
            flocks = db.query(Flock.id).filter(Flock.farm_id.in_(farm_ids)).all()
            flock_ids = [f[0] for f in flocks]
            if flock_ids:
                query = query.filter(Vaccination.flock_id.in_(flock_ids))
            else:
                return []
        else:
            return []
    
    return query.order_by(Vaccination.administration_date.desc()).all()


@router.post("/", response_model=VaccinationResponse)
def create_vaccination(
    data: VaccinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer une vaccination - admin, vétérinaire et agent"""
    if current_user.role not in ["admin", "veterinarian", "agent"]:
        raise HTTPException(status_code=403, detail="Permission refusée")
    
    if not check_flock_access(current_user, data.flock_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé au lot")
    
    new_vaccination = Vaccination(
        vaccine=data.vaccine,
        disease_id=data.disease_id,
        flock_id=data.flock_id,
        quantity=data.quantity,
        method=data.method,
        administration_date=data.administration_date,
        next_due_date=data.next_due_date,
        notes=data.notes
    )
    db.add(new_vaccination)
    db.commit()
    db.refresh(new_vaccination)
    
    return new_vaccination


@router.get("/{vaccination_id}", response_model=VaccinationResponse)
def get_vaccination(
    vaccination_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer une vaccination par ID"""
    vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not vaccination:
        raise HTTPException(status_code=404, detail="Vaccination non trouvée")
    
    if not check_flock_access(current_user, vaccination.flock_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    return vaccination


@router.put("/{vaccination_id}", response_model=VaccinationResponse)
def update_vaccination(
    vaccination_id: UUID,
    data: VaccinationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour une vaccination - admin et vétérinaire uniquement"""
    if current_user.role not in ["admin", "veterinarian"]:
        raise HTTPException(status_code=403, detail="Seuls admin et vétérinaire peuvent modifier")
    
    vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not vaccination:
        raise HTTPException(status_code=404, detail="Vaccination non trouvée")
    
    if not check_flock_access(current_user, vaccination.flock_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(vaccination, key, value)
    
    db.commit()
    db.refresh(vaccination)
    
    return vaccination


@router.delete("/{vaccination_id}")
def delete_vaccination(
    vaccination_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer une vaccination - admin uniquement"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul l'admin peut supprimer")
    
    vaccination = db.query(Vaccination).filter(Vaccination.id == vaccination_id).first()
    if not vaccination:
        raise HTTPException(status_code=404, detail="Vaccination non trouvée")
    
    db.delete(vaccination)
    db.commit()
    
    return {"message": "Vaccination supprimée avec succès"}