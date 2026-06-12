from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from uuid import UUID
from typing import List, Optional
from datetime import date, datetime
import statistics
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.stock_movement import StockMovement
from app.models.stock_item import StockItem
from app.models.farm import Farm
from app.models.flock import Flock
from app.models.band import Band
from app.models.poultry_house import PoultryHouse
from app.models.mortality import Mortality
from app.models.weighing import Weighing
from app.models.feeding_record import FeedingRecord
from app.schemas.flock import FlockResponse, FlockCreate, FlockUpdate
from app.schemas.mortality import MortalityCreate, MortalityResponse
from app.schemas.weighing import WeighingResponse, WeighingCreate
from app.schemas.feeding import FeedingCreate, FeedingResponse
from app.schemas.split import SplitFlockRequest, SplitFlockResponse

from app.models.egg_collection import EggCollection, EggSize
from app.schemas.egg_collection import EggCollectionCreate, EggCollectionResponse


router = APIRouter(prefix="/api/v1/flocks", tags=["Flocks"])


# ============================================================
# ROUTES STATIQUES (sans paramètres dynamiques)
# ============================================================


@router.post("/", response_model=FlockResponse)
def create_flock(
    data: FlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un nouveau lot"""
    # Vérifier que la ferme existe
    farm = db.query(Farm).filter(Farm.id == data.farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Ferme non trouvée")
    
    # Vérifier l'accès (admin ou manager de la ferme)
    if current_user.role != "admin":
        if farm.manager_id != current_user.id:
            raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    # Vérifier que la salle existe
    poultry_house = db.query(PoultryHouse).filter(PoultryHouse.id == data.poultry_house_id).first()
    if not poultry_house:
        raise HTTPException(status_code=404, detail="Salle non trouvée")
    
    # Vérifier que la bande existe
    band = db.query(Band).filter(Band.id == data.band_id).first()
    if not band:
        raise HTTPException(status_code=404, detail="Bande non trouvée")
    
    # Créer le lot
    new_flock = Flock(
        name=data.name,
        quantity=data.quantity,
        cycle=data.cycle,
        age=data.age or 0,
        notes=data.notes,
        start_date=data.start_date,
        farm_id=data.farm_id,
        poultry_house_id=data.poultry_house_id,
        band_id=data.band_id,
        espece_id=data.espece_id,
        poultry_type=poultry_house.poultry_type,
        status="active"
    )
    db.add(new_flock)
    db.commit()
    db.refresh(new_flock)
    
    # Retourner la réponse selon FlockResponse
    return {
        "id": new_flock.id,
        "name": new_flock.name,
        "quantity": new_flock.quantity,
        "cycle": new_flock.cycle,
        "age": new_flock.age or 0,
        "notes": new_flock.notes,
        "startDate": new_flock.start_date.isoformat() if new_flock.start_date else None,
        "endDate": new_flock.end_date.isoformat() if new_flock.end_date else None,
        "status": new_flock.status,
        "farmId": str(new_flock.farm_id),
        "farmName": farm.name,
        "poultryHouseId": str(new_flock.poultry_house_id),
        "poultryHouseName": poultry_house.name,
        "bandId": str(new_flock.band_id) if new_flock.band_id else None,
        "bandName": band.name if band else None,
        "averageWeight": new_flock.average_weight or 0.0,
        "mortality": [],
        "created_at": new_flock.created_at,
        "updated_at": new_flock.updated_at,
        "current_quantity": new_flock.quantity,
        "total_mortality": 0,
        "salePrice": None
    }


@router.get("/", response_model=List[FlockResponse])
def get_flocks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer tous les lots accessibles par l'utilisateur"""
    from app.models.farm_member import FarmMember
    
    farms_ids = set()
    
    # 1. ADMIN : voit tous les lots
    if current_user.role == "admin":
        flocks = db.query(Flock).all()
    
    else:
        # 2. Fermes où l'utilisateur est manager
        manager_farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
        for farm in manager_farms:
            farms_ids.add(farm.id)
        
        # 3. Fermes où l'utilisateur est membre via farm_members
        memberships = db.query(FarmMember).filter(FarmMember.user_id == current_user.id).all()
        for membership in memberships:
            farms_ids.add(membership.farm_id)
        
        if not farms_ids:
            return []
        
        # Récupérer les lots des fermes accessibles
        flocks = db.query(Flock).filter(Flock.farm_id.in_(farms_ids)).all()
    
    result = []
    for flock in flocks:
        farm = db.query(Farm).filter(Farm.id == flock.farm_id).first()
        poultry_house = db.query(PoultryHouse).filter(PoultryHouse.id == flock.poultry_house_id).first()
        band = db.query(Band).filter(Band.id == flock.band_id).first() if flock.band_id else None
        mortalities = db.query(Mortality).filter(Mortality.flock_id == flock.id).all()
        
        total_mortality = sum(m.quantity for m in mortalities) if mortalities else 0
        current_quantity = flock.quantity - total_mortality
        
        mortality_list = []
        for m in mortalities:
            mortality_list.append({
                "id": m.id,
                "flock_id": m.flock_id,
                "quantity": m.quantity,
                "mortality_date": m.mortality_date.isoformat() if m.mortality_date else None,
                "cause": m.cause,
                "created_at": m.created_at.isoformat() if m.created_at else None
            })
        
        start_date_value = flock.start_date
        if hasattr(start_date_value, 'date'):
            start_date_value = start_date_value.date()
        
        end_date_value = flock.end_date
        if hasattr(end_date_value, 'date'):
            end_date_value = end_date_value.date()
        
        result.append({
            "id": flock.id,
            "name": flock.name,
            "quantity": flock.quantity,
            "cycle": flock.cycle,
            "age": flock.age or 0,
            "notes": flock.notes,
            "startDate": start_date_value.isoformat() if start_date_value else None,
            "endDate": end_date_value.isoformat() if end_date_value else None,
            "status": flock.status,
            "farmId": str(flock.farm_id),
            "farmName": farm.name if farm else "Ferme non trouvée",
            "poultryHouseId": str(flock.poultry_house_id),
            "poultryHouseName": poultry_house.name if poultry_house else "Salle non trouvée",
            "bandId": str(flock.band_id) if flock.band_id else None,
            "bandName": band.name if band else None,
            "averageWeight": flock.average_weight or 0.0,
            "mortality": mortality_list,
            "created_at": flock.created_at.isoformat() if flock.created_at else None,
            "updated_at": flock.updated_at.isoformat() if flock.updated_at else None,
            "current_quantity": current_quantity,
            "total_mortality": total_mortality,
            "salePrice": flock.sale_price
        })
    
    return result


@router.post("/mortalities", response_model=dict)
def create_mortality(
    data: MortalityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enregistrer une mortalité pour un lot (sans ID dans l'URL)"""
    flock = db.query(Flock).filter(Flock.id == data.flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    if data.quantity > flock.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Le nombre de morts ({data.quantity}) ne peut pas dépasser l'effectif actuel ({flock.quantity})"
        )
    
    new_mortality = Mortality(
        flock_id=data.flock_id,
        quantity=data.quantity,
        mortality_date=data.mortality_date or date.today(),
        cause=data.cause
    )
    db.add(new_mortality)
    db.commit()
    db.refresh(new_mortality)
    
    flock.quantity = flock.quantity - data.quantity
    db.commit()
    
    total_mortality = db.query(func.sum(Mortality.quantity)).filter(
        Mortality.flock_id == data.flock_id
    ).scalar() or 0
    
    return {
        "message": "Mortalité enregistrée avec succès",
        "mortality": {
            "id": str(new_mortality.id),
            "quantity": new_mortality.quantity,
            "cause": new_mortality.cause
        },
        "flock": {
            "id": str(flock.id),
            "name": flock.name,
            "current_quantity": flock.quantity,
            "total_mortality": total_mortality
        }
    }


# ============================================================
# ROUTES SPÉCIFIQUES (AVEC PARAMÈTRES flock_id)
# DOIVENT ÊTRE PLACÉES AVANT LES ROUTES GÉNÉRIQUES /{flock_id}
# ============================================================

# ============ PESÉES ============

@router.get("/{flock_id}/weighings", response_model=List[dict])
def get_flock_weighings(
    flock_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer toutes les pesées d'un lot"""
    from app.models.farm_member import FarmMember
    
    # 1. Vérifier que le lot existe
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    # 2. Vérifier l'accès à la ferme du lot
    has_access = False
    
    if current_user.role == "admin":
        has_access = True
    else:
        # Vérifier si l'utilisateur est manager de la ferme
        farm = db.query(Farm).filter(
            Farm.id == flock.farm_id,
            Farm.manager_id == current_user.id
        ).first()
        if farm:
            has_access = True
        else:
            # Vérifier si l'utilisateur est membre via farm_members
            membership = db.query(FarmMember).filter(
                FarmMember.user_id == current_user.id,
                FarmMember.farm_id == flock.farm_id
            ).first()
            if membership:
                has_access = True
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Accès non autorisé à ce lot")
    
    # 3. Récupérer les pesées
    weighings = db.query(Weighing).filter(
        Weighing.flock_id == flock_id
    ).order_by(Weighing.date.desc()).all()
    
    # 4. Construire la réponse
    result = []
    for w in weighings:
        result.append({
            "id": w.id,
            "flockId": w.flock_id,
            "userId": w.user_id,
            "date": w.date.isoformat() if w.date else None,
            "averageWeight": w.average_weight,
            "sampleSize": getattr(w, 'sample_size', 1),
            "notes": w.notes,
            "created_at": w.created_at.isoformat() if w.created_at else None
        })
    
    return result


@router.post("/{flock_id}/weighings", response_model=WeighingResponse)
def create_weighing(
    flock_id: UUID,
    data: WeighingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer une pesée pour un lot avec calcul automatique des statistiques"""
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    # Initialiser les valeurs
    weights_array = []
    min_weight = 0
    max_weight = 0
    std_deviation = 0
    avg_weight = data.average_weight
    
    # Récupérer les poids individuels si fournis
    if data.weights and len(data.weights) > 0:
        weights_array = data.weights
        min_weight = float(min(weights_array))
        max_weight = float(max(weights_array))
        avg_weight = sum(weights_array) / len(weights_array)
        if len(weights_array) > 1:
            std_deviation = float(statistics.stdev(weights_array))
    
    # Arrondir les valeurs
    min_weight = round(min_weight, 2)
    max_weight = round(max_weight, 2)
    avg_weight = round(avg_weight, 2)
    std_deviation = round(std_deviation, 3)
    
    new_weighing = Weighing(
        flock_id=flock_id,
        average_weight=avg_weight,
        sample_size=data.sample_size,
        user_id=current_user.id,
        date=date.today(),
        weights=json.dumps(weights_array) if weights_array else None,
        min_weight=min_weight,
        max_weight=max_weight,
        std_deviation=std_deviation
    )
    db.add(new_weighing)
    db.commit()
    db.refresh(new_weighing)
    
    # Mettre à jour le poids moyen du lot
    flock.average_weight = avg_weight
    db.commit()
    
    # Retourner l'objet directement - Pydantic utilisera from_attributes
    return new_weighing


# ============ ALIMENTATION ============

@router.get("/{flock_id}/feeding-history", response_model=List[FeedingResponse])
def get_feeding_history(
    flock_id: UUID,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer l'historique des alimentations d'un lot"""
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    feedings = db.query(FeedingRecord).filter(
        FeedingRecord.flock_id == flock_id
    ).order_by(FeedingRecord.date.desc()).limit(limit).all()
    
    return feedings


@router.post("/{flock_id}/feeding", response_model=FeedingResponse)
def record_feeding(
    flock_id: UUID,
    data: FeedingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enregistrer une alimentation pour un lot et déduire du stock"""
    
    print(f"=== REQUÊTE REÇUE ===")
    print(f"flock_id: {flock_id}")
    print(f"data: {data}")
    print(f"current_user: {current_user.id if current_user else 'None'}")
    
    # 1. Vérifier que le lot existe
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    # 2. Vérifier que le stock_item_id est fourni
    if not data.stock_item_id:
        raise HTTPException(status_code=400, detail="ID de l'article en stock requis")
    
    # 3. Récupérer l'article en stock
    stock_item = db.query(StockItem).filter(
        StockItem.id == data.stock_item_id,
        StockItem.farm_id == flock.farm_id
    ).first()
    
    if not stock_item:
        raise HTTPException(status_code=404, detail="Article en stock non trouvé")
    
    # 4. Vérifier que la quantité est suffisante
    if stock_item.quantity < data.quantity_kg:
        raise HTTPException(
            status_code=400, 
            detail=f"Stock insuffisant. Disponible: {stock_item.quantity} {stock_item.unit}, Demandé: {data.quantity_kg}"
        )
    
    # 5. DÉDUIRE LA QUANTITÉ DU STOCK
    stock_item.quantity -= data.quantity_kg
    
    # 6. Mettre à jour le statut du stock si nécessaire
    if stock_item.quantity <= 0:
        stock_item.status = "out_of_stock"
    elif stock_item.quantity <= stock_item.min_threshold:
        stock_item.status = "low"
    else:
        stock_item.status = "normal"
    
    # 7. Enregistrer le mouvement de stock (sortie)
    stock_movement = StockMovement(
        stock_item_id=stock_item.id,
        type="exit",
        quantity=data.quantity_kg,
        unit=stock_item.unit,
        reference_id=flock_id,
        reference_name=f"Alimentation du lot {flock.name}",
        operator_id=current_user.id,
        operator_name=current_user.name,
        comment=f"Distribution alimentaire - {data.feed_type} - Lot: {flock.name}",
        movement_date=datetime.utcnow()
    )
    db.add(stock_movement)
    
    # 8. Enregistrer l'alimentation
    feeding_record = FeedingRecord(
        flock_id=flock_id,
        feed_type=data.feed_type,
        quantity_kg=data.quantity_kg,
        stock_item_id=data.stock_item_id,
        date=datetime.utcnow()
    )
    db.add(feeding_record)
    
    # 9. Commit toutes les modifications
    db.commit()
    db.refresh(feeding_record)
    
    return feeding_record


# ============ MORTALITÉ ============

@router.post("/{flock_id}/mortality", response_model=dict)
def record_mortality_by_flock_id(
    flock_id: UUID,
    data: MortalityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enregistrer une mortalité pour un lot"""
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    if data.quantity > flock.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Le nombre de morts ({data.quantity}) ne peut pas dépasser l'effectif actuel ({flock.quantity})"
        )
    
    new_mortality = Mortality(
        flock_id=flock_id,
        quantity=data.quantity,
        mortality_date=date.today(),
        cause=data.cause
    )
    db.add(new_mortality)
    db.commit()
    db.refresh(new_mortality)
    
    flock.quantity -= data.quantity
    db.commit()
    
    return {"message": "Mortalité enregistrée", "quantity": data.quantity}


# ============ DIVISION DE LOT (QUARANTAINE) ============

@router.post("/{flock_id}/split", response_model=SplitFlockResponse)
def split_flock(
    flock_id: UUID,
    split_request: SplitFlockRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Diviser un lot en deux (pour quarantaine)"""
    original_flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not original_flock:
        raise HTTPException(status_code=404, detail="Lot original non trouvé")
    
    if split_request.quantity > original_flock.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Quantité insuffisante. Disponible: {original_flock.quantity}, Demandé: {split_request.quantity}"
        )
    
    if split_request.quantity == original_flock.quantity:
        raise HTTPException(
            status_code=400,
            detail="Impossible de tout déplacer, le lot original doit garder au moins un sujet"
        )
    
    new_flock = Flock(
        name=split_request.new_flock_name,
        quantity=split_request.quantity,
        cycle=original_flock.cycle,
        age=original_flock.age,
        start_date=original_flock.start_date,
        status="quarantine" if split_request.is_quarantine else "active",
        farm_id=original_flock.farm_id,
        poultry_house_id=original_flock.poultry_house_id,
        poultry_type=original_flock.poultry_type,
        average_weight=original_flock.average_weight,
        notes=f"Lot issu de la division de {original_flock.name}. Raison: {split_request.reason or 'Non spécifiée'}",
        parent_flock_id=original_flock.id,
        is_quarantine=split_request.is_quarantine,
        band_id=original_flock.band_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_flock)
    db.flush()
    
    original_flock.quantity -= split_request.quantity
    db.commit()
    db.refresh(original_flock)
    db.refresh(new_flock)
    
    return SplitFlockResponse(
        message=f"Lot divisé avec succès. {split_request.quantity} sujets déplacés vers {new_flock.name}",
        original_flock={
            "id": str(original_flock.id),
            "name": original_flock.name,
            "quantity": original_flock.quantity
        },
        new_flock={
            "id": str(new_flock.id),
            "name": new_flock.name,
            "quantity": new_flock.quantity,
            "is_quarantine": new_flock.is_quarantine
        }
    )


# ============ COLLECTE D'ŒUFS ============

@router.get("/{flock_id}/egg-collections", response_model=List[EggCollectionResponse])
def get_egg_collections(
    flock_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer l'historique des collectes d'œufs"""
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    collections = db.query(EggCollection).filter(
        EggCollection.flock_id == flock_id
    ).order_by(EggCollection.collection_date.desc()).offset(skip).limit(limit).all()
    
    return collections


@router.post("/{flock_id}/egg-collections", response_model=EggCollectionResponse)
def create_egg_collection(
    flock_id: UUID,
    data: EggCollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enregistrer une collecte d'œufs pour un lot"""
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    egg_collection = EggCollection(
        flock_id=flock_id,
        egg_count=data.egg_count,
        egg_size=data.egg_size,
        notes=data.notes,
        collection_date=datetime.utcnow()
    )
    db.add(egg_collection)
    db.commit()
    db.refresh(egg_collection)
    
    return egg_collection


@router.get("/{flock_id}/egg-collections/stats")
def get_egg_collection_stats(
    flock_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les statistiques des collectes d'œufs"""
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    collections = db.query(EggCollection).filter(EggCollection.flock_id == flock_id).all()
    
    total_eggs = sum(c.egg_count for c in collections)
    total_small = sum(c.egg_count for c in collections if c.egg_size == EggSize.SMALL)
    total_medium = sum(c.egg_count for c in collections if c.egg_size == EggSize.MEDIUM)
    total_large = sum(c.egg_count for c in collections if c.egg_size == EggSize.LARGE)
    
    return {
        "total_eggs": total_eggs,
        "by_size": {
            "small": total_small,
            "medium": total_medium,
            "large": total_large
        },
        "collection_count": len(collections)
    }


# ============================================================
# ROUTES GÉNÉRIQUES (À PLACER À LA FIN)
# ============================================================

@router.get("/{flock_id}", response_model=dict)
def get_flock_by_id(
    flock_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer un lot par son ID avec tous les détails"""
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    farm = db.query(Farm).filter(Farm.id == flock.farm_id).first()
    poultry_house = db.query(PoultryHouse).filter(PoultryHouse.id == flock.poultry_house_id).first()
    band = db.query(Band).filter(Band.id == flock.band_id).first() if flock.band_id else None
    mortalities = db.query(Mortality).filter(Mortality.flock_id == flock_id).all()
    
    total_mortality = sum(m.quantity for m in mortalities) if mortalities else 0
    current_quantity = flock.quantity - total_mortality
    
    mortality_list = []
    for m in mortalities:
        mortality_list.append({
            "id": str(m.id),
            "quantity": m.quantity,
            "mortality_date": m.mortality_date.isoformat() if m.mortality_date else None,
            "cause": m.cause
        })
    
    return {
        "id": str(flock.id),
        "name": flock.name,
        "quantity": flock.quantity,
        "cycle": flock.cycle,
        "age": flock.age or 0,
        "notes": flock.notes,
        "startDate": flock.start_date.isoformat() if flock.start_date else None,
        "endDate": flock.end_date.isoformat() if flock.end_date else None,
        "status": flock.status,
        "farmId": str(flock.farm_id),
        "farmName": farm.name if farm else "N/A",
        "poultryHouseId": str(flock.poultry_house_id),
        "poultryHouseName": poultry_house.name if poultry_house else "N/A",
        "bandId": str(flock.band_id) if flock.band_id else None,
        "bandName": band.name if band else None,
        "averageWeight": flock.average_weight or 0.0,
        "mortality": mortality_list,
        "current_quantity": current_quantity,
        "total_mortality": total_mortality,
        "salePrice": flock.sale_price
    }


@router.put("/{flock_id}", response_model=FlockResponse)
@router.patch("/{flock_id}", response_model=FlockResponse)
def update_flock(
    flock_id: UUID,
    data: FlockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour un lot (PUT et PATCH)"""
    flock = db.query(Flock).filter(Flock.id == flock_id).first()
    if not flock:
        raise HTTPException(status_code=404, detail="Lot non trouvé")
    
    if current_user.role != "admin":
        farm = db.query(Farm).filter(Farm.id == flock.farm_id, Farm.manager_id == current_user.id).first()
        if not farm:
            raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(flock, key, value)
    
    db.commit()
    db.refresh(flock)
    
    farm = db.query(Farm).filter(Farm.id == flock.farm_id).first()
    poultry_house = db.query(PoultryHouse).filter(PoultryHouse.id == flock.poultry_house_id).first()
    
    return {
        "id": flock.id,
        "name": flock.name,
        "quantity": flock.quantity,
        "cycle": flock.cycle,
        "age": flock.age or 0,
        "notes": flock.notes,
        "startDate": flock.start_date.isoformat() if flock.start_date else None,
        "endDate": flock.end_date.isoformat() if flock.end_date else None,
        "status": flock.status,
        "farmId": str(flock.farm_id),
        "farmName": farm.name if farm else "N/A",
        "poultryHouseId": str(flock.poultry_house_id),
        "poultryHouseName": poultry_house.name if poultry_house else "N/A",
        "averageWeight": flock.average_weight or 0.0,
        "salePrice": flock.sale_price
    }