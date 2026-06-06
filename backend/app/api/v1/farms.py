from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.models.poultry_house import PoultryHouse
from app.models.flock import Flock
from app.schemas.farm import FarmResponse, FarmCreate, FarmUpdate
from app.schemas.poultry_house import PoultryHouseResponse
from app.schemas.flock import FlockResponse
from app.services.farm_service import FarmService

router = APIRouter(prefix="/api/v1/farms", tags=["Farms"])


def parse_poultry_types(value):
    """Convertit les poultry_types en liste Python"""
    if not value:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        # Enlever les accolades si présentes et split
        cleaned = value.strip('{}')
        if not cleaned:
            return []
        return [item.strip() for item in cleaned.split(',')]
    return []


# =========================
# CREATE
# =========================
@router.post("/", response_model=FarmResponse)
def create_farm(
    farm: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer une nouvelle ferme (admin uniquement)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul un admin peut créer une ferme")
    
    new_farm = Farm(**farm.model_dump(), manager_id=current_user.id)
    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)
    return new_farm


# =========================
# GET ALL FARMS (avec droits et filtres)
# =========================
@router.get("/", response_model=List[FarmResponse])
def get_farms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    search: Optional[str] = Query(None, description="Recherche par nom ou adresse"),
    active_only: bool = Query(True, description="Filtrer les fermes actives"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère toutes les fermes accessibles par l'utilisateur avec filtres"""
    
    # Récupérer les fermes où l'utilisateur est manager
    farms_where_manager = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
    
    result = []
    for farm in farms_where_manager:
        result.append({
            "id": farm.id,
            "name": farm.name,
            "address": farm.address,
            "description": farm.description,
            "poultry_types": [],
            "manager_id": farm.manager_id,
            "total_capacity": farm.total_capacity,
            "active": farm.active,
            "created_at": farm.created_at,
            "updated_at": farm.updated_at
        })
    
    # Appliquer les filtres
    filtered = result
    if search:
        search_lower = search.lower()
        filtered = [f for f in filtered if search_lower in f["name"].lower() or (f["address"] and search_lower in f["address"].lower())]
    
    if active_only:
        filtered = [f for f in filtered if f["active"]]
    
    # Pagination
    paginated = filtered[skip:skip + limit]
    
    return paginated


# =========================
# GET FARM BY ID
# =========================
@router.get("/{farm_id}", response_model=dict)
def get_farm_by_id(
    farm_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère une ferme par son ID avec vérification des droits"""
    
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Ferme non trouvée")
    
    # Vérifier l'accès
    if not FarmService.can_access_farm(db, current_user, farm_id):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    # Convertir poultry_types
    poultry_types = parse_poultry_types(farm.poultry_types)
    
    return {
        "id": farm.id,
        "name": farm.name,
        "address": farm.address,
        "description": farm.description,
        "poultry_types": poultry_types,
        "manager_id": farm.manager_id,
        "total_capacity": farm.total_capacity,
        "active": farm.active,
        "created_at": farm.created_at,
        "updated_at": farm.updated_at
    }


# =========================
# GET FARM WITH DETAILS (salles + lots)
# =========================
@router.get("/{farm_id}/details", response_model=dict)
def get_farm_details(
    farm_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère une ferme avec toutes ses salles et leurs lots"""
    farm = FarmService.get_farm_with_details(db, farm_id, current_user)
    
    if not farm:
        raise HTTPException(status_code=404, detail="Ferme non trouvée ou accès refusé")
    
    # Convertir poultry_types
    poultry_types = parse_poultry_types(farm.poultry_types)
    
    # Construire la réponse
    result = {
        "id": farm.id,
        "name": farm.name,
        "address": farm.address,
        "description": farm.description,
        "poultry_types": poultry_types,
        "manager_id": farm.manager_id,
        "total_capacity": farm.total_capacity,
        "active": farm.active,
        "created_at": farm.created_at,
        "updated_at": farm.updated_at,
        "poultry_houses": [
            {
                "id": house.id,
                "name": house.name,
                "description": house.description,
                "capacity": house.capacity,
                "current_occupancy": house.current_occupancy,
                "poultry_type": house.poultry_type,
                "has_automation": house.has_automation,
                "ventilation_status": house.ventilation_status,
                "lighting_status": house.lighting_status,
                "heating_status": house.heating_status,
                "active": house.active,
                "current_flock": {
                    "id": house.current_flock.id,
                    "name": house.current_flock.name,
                    "quantity": house.current_flock.quantity,
                    "age": house.current_flock.age,
                    "status": house.current_flock.status,
                    "average_weight": house.current_flock.average_weight
                } if house.current_flock else None
            }
            for house in farm.poultry_houses
        ]
    }
    
    return result


# =========================
# GET FARM POULTRY HOUSES (avec lots actifs)
# =========================
@router.get("/{farm_id}/poultry-houses", response_model=List[dict])
def get_farm_poultry_houses(
    farm_id: UUID,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère toutes les salles d'une ferme avec leurs lots actifs"""
    
    # Vérifier l'accès à la ferme
    if not FarmService.can_access_farm(db, current_user, farm_id):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Ferme non trouvée")
    
    # Récupérer les salles
    query = db.query(PoultryHouse).filter(PoultryHouse.farm_id == farm_id)
    if not include_inactive:
        query = query.filter(PoultryHouse.active == True)
    
    poultry_houses = query.all()
    
    result = []
    for house in poultry_houses:
        # Récupérer le lot actif
        active_flock = db.query(Flock).filter(
            Flock.poultry_house_id == house.id,
            Flock.status == "active"
        ).first()
        
        result.append({
            "id": house.id,
            "name": house.name,
            "description": house.description,
            "capacity": house.capacity,
            "current_occupancy": house.current_occupancy,
            "poultry_type": house.poultry_type,
            "has_automation": house.has_automation,
            "ventilation_status": house.ventilation_status,
            "lighting_status": house.lighting_status,
            "heating_status": house.heating_status,
            "active": house.active,
            "created_at": house.created_at,
            "updated_at": house.updated_at,
            "active_flock": {
                "id": active_flock.id,
                "name": active_flock.name,
                "quantity": active_flock.quantity,
                "age": active_flock.age,
                "average_weight": active_flock.average_weight,
                "status": active_flock.status
            } if active_flock else None
        })
    
    return result


# =========================
# GET POULTRY HOUSE WITH FLOCK
# =========================
@router.get("/poultry-houses/{house_id}", response_model=dict)
def get_poultry_house_details(
    house_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère une salle avec son lot actif"""
    house = FarmService.get_poultry_house_with_flock(db, house_id, current_user)
    
    if not house:
        raise HTTPException(status_code=404, detail="Salle non trouvée ou accès refusé")
    
    # Récupérer tout l'historique des lots de cette salle
    flocks = db.query(Flock).filter(
        Flock.poultry_house_id == house_id
    ).order_by(Flock.start_date.desc()).all()
    
    result = {
        "id": house.id,
        "name": house.name,
        "description": house.description,
        "farm_id": house.farm_id,
        "capacity": house.capacity,
        "current_occupancy": house.current_occupancy,
        "poultry_type": house.poultry_type,
        "has_automation": house.has_automation,
        "ventilation_status": house.ventilation_status,
        "lighting_status": house.lighting_status,
        "heating_status": house.heating_status,
        "active": house.active,
        "created_at": house.created_at,
        "updated_at": house.updated_at,
        "current_flock": {
            "id": house.current_flock.id,
            "name": house.current_flock.name,
            "quantity": house.current_flock.quantity,
            "age": house.current_flock.age,
            "start_date": house.current_flock.start_date.isoformat() if house.current_flock.start_date else None,
            "status": house.current_flock.status,
            "average_weight": house.current_flock.average_weight
        } if house.current_flock else None,
        "flocks_history": [
            {
                "id": f.id,
                "name": f.name,
                "quantity": f.quantity,
                "start_date": f.start_date.isoformat() if f.start_date else None,
                "end_date": f.end_date.isoformat() if f.end_date else None,
                "status": f.status
            }
            for f in flocks
        ]
    }
    
    return result


# =========================
# UPDATE
# =========================
@router.put("/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: UUID,
    payload: FarmUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Met à jour une ferme (manager ou admin uniquement)"""
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Ferme non trouvée")
    
    # Vérifier les droits (manager de la ferme ou admin)
    if current_user.role != "admin" and farm.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas le manager de cette ferme")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(farm, key, value)
    
    db.commit()
    db.refresh(farm)
    return farm


# =========================
# DELETE
# =========================
@router.delete("/{farm_id}")
def delete_farm(
    farm_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprime une ferme (admin uniquement)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul un admin peut supprimer une ferme")
    
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    
    if not farm:
        raise HTTPException(status_code=404, detail="Ferme non trouvée")
    
    db.delete(farm)
    db.commit()
    
    return {"message": "Ferme supprimée avec succès"}