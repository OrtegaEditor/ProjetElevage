from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.poultry_house import PoultryHouseResponse, PoultryHouseCreate, PoultryHouseUpdate

router = APIRouter(prefix="/api/v1/poultry-houses", tags=["Poultry Houses"])


# =========================
# CREATE
# =========================
@router.post("/", response_model=PoultryHouseResponse)
def create_poultry_house(
    data: PoultryHouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.poultry_house import PoultryHouse
    from app.models.farm import Farm
    
    # Vérifier les droits (admin ou manager de la ferme)
    if current_user.role != "admin":
        farm = db.query(Farm).filter(Farm.id == data.farm_id, Farm.manager_id == current_user.id).first()
        if not farm:
            raise HTTPException(
                status_code=403, 
                detail="Vous n'avez pas les droits pour ajouter une salle à cette ferme"
            )
    
    farm = db.query(Farm).filter(Farm.id == data.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Ferme non trouvée")
    
    new_house = PoultryHouse(**data.model_dump())
    db.add(new_house)
    db.commit()
    db.refresh(new_house)
    return new_house


# =========================
# GET ALL
# =========================
@router.get("/", response_model=List[PoultryHouseResponse])
def get_poultry_houses(
    skip: int = 0,
    limit: int = 100,
    farm_id: Optional[UUID] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.poultry_house import PoultryHouse
    from app.models.farm import Farm
    from app.models.farm_member import FarmMember
    
    # Récupérer les fermes accessibles
    if current_user.role == "admin":
        accessible_farms = db.query(Farm).all()
    else:
        accessible_farms = db.query(Farm).join(Farm.members).filter(
            Farm.members.any(id=current_user.id)
        ).all()
    
    accessible_farm_ids = [f.id for f in accessible_farms]
    
    if not accessible_farm_ids:
        return []
    
    query = db.query(PoultryHouse).filter(
        PoultryHouse.farm_id.in_(accessible_farm_ids)
    )
    
    if farm_id:
        if farm_id not in accessible_farm_ids:
            raise HTTPException(status_code=403, detail="Accès non autorisé à cette ferme")
        query = query.filter(PoultryHouse.farm_id == farm_id)
    
    if active_only:
        query = query.filter(PoultryHouse.active == True)
    
    houses = query.offset(skip).limit(limit).all()
    return houses


# =========================
# GET BY FARM
# =========================
@router.get("/farm/{farm_id}", response_model=List[PoultryHouseResponse])
def get_poultry_houses_by_farm(
    farm_id: UUID,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.poultry_house import PoultryHouse
    from app.models.farm import Farm
    from app.models.farm_member import FarmMember
    
    # Vérifier l'accès à la ferme
    if current_user.role != "admin":
        # Vérifier si membre ou manager
        member = db.query(FarmMember).filter(
            FarmMember.user_id == current_user.id,
            FarmMember.farm_id == farm_id
        ).first()
        farm = db.query(Farm).filter(Farm.id == farm_id, Farm.manager_id == current_user.id).first()
        
        if not member and not farm:
            raise HTTPException(status_code=403, detail="Accès non autorisé à cette ferme")
    
    query = db.query(PoultryHouse).filter(PoultryHouse.farm_id == farm_id)
    
    if not include_inactive:
        query = query.filter(PoultryHouse.active == True)
    
    houses = query.all()
    return houses


# =========================
# GET BY ID
# =========================
@router.get("/{house_id}", response_model=PoultryHouseResponse)
def get_poultry_house(
    house_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.poultry_house import PoultryHouse
    from app.models.farm import Farm
    from app.models.farm_member import FarmMember
    
    house = db.query(PoultryHouse).filter(PoultryHouse.id == house_id).first()
    if not house:
        raise HTTPException(status_code=404, detail="Salle non trouvée")
    
    # Vérifier l'accès à la ferme
    if current_user.role != "admin":
        member = db.query(FarmMember).filter(
            FarmMember.user_id == current_user.id,
            FarmMember.farm_id == house.farm_id
        ).first()
        farm = db.query(Farm).filter(Farm.id == house.farm_id, Farm.manager_id == current_user.id).first()
        
        if not member and not farm:
            raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    return house


# =========================
# UPDATE
# =========================
@router.put("/{house_id}", response_model=PoultryHouseResponse)
def update_poultry_house(
    house_id: UUID,
    data: PoultryHouseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.poultry_house import PoultryHouse
    from app.models.farm import Farm
    
    house = db.query(PoultryHouse).filter(PoultryHouse.id == house_id).first()
    if not house:
        raise HTTPException(status_code=404, detail="Salle non trouvée")
    
    # Vérifier les droits d'écriture (admin ou manager)
    if current_user.role != "admin":
        farm = db.query(Farm).filter(Farm.id == house.farm_id, Farm.manager_id == current_user.id).first()
        if not farm:
            raise HTTPException(
                status_code=403, 
                detail="Vous n'avez pas les droits pour modifier cette salle"
            )
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(house, key, value)
    
    db.commit()
    db.refresh(house)
    return house


# =========================
# DELETE (soft delete)
# =========================
@router.delete("/{house_id}")
def delete_poultry_house(
    house_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.poultry_house import PoultryHouse
    from app.models.farm import Farm
    
    house = db.query(PoultryHouse).filter(PoultryHouse.id == house_id).first()
    if not house:
        raise HTTPException(status_code=404, detail="Salle non trouvée")
    
    # Vérifier les droits d'écriture (admin ou manager)
    if current_user.role != "admin":
        farm = db.query(Farm).filter(Farm.id == house.farm_id, Farm.manager_id == current_user.id).first()
        if not farm:
            raise HTTPException(
                status_code=403, 
                detail="Vous n'avez pas les droits pour supprimer cette salle"
            )
    
    # Soft delete
    house.active = False
    db.commit()
    
    return {"message": "Salle désactivée avec succès"}