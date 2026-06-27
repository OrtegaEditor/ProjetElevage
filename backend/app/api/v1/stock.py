# backend/app/api/v1/stock.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from uuid import UUID
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.models.stock_item import StockItem
from app.models.stock_movement import StockMovement
from app.models.supplier import Supplier
from app.schemas.stock_item import StockItemCreate, StockItemResponse
from app.schemas.stock_movement import StockMovementCreate, StockMovementResponse

router = APIRouter(prefix="/api/v1/stock", tags=["Stock"])


def check_farm_access(user: User, farm_id: UUID, db: Session) -> bool:
    """Vérifie si l'utilisateur a accès à la ferme"""
    if user.role == "admin":
        return True
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.manager_id == user.id).first()
    return farm is not None


def update_stock_status(stock_item: StockItem):
    """Met à jour le statut d'un article en fonction de la quantité"""
    if stock_item.quantity <= stock_item.min_threshold * 0.5:
        stock_item.status = "critical"
    elif stock_item.quantity <= stock_item.min_threshold:
        stock_item.status = "low"
    else:
        stock_item.status = "normal"


@router.get("/movements", response_model=List[dict])
def get_stock_movements(
    stock_item_id: Optional[str] = Query(None), 
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer l'historique des mouvements de stock"""
    query = db.query(StockMovement)
    
    if stock_item_id:
        try:
            stock_item_uuid = UUID(stock_item_id)
            item = db.query(StockItem).filter(StockItem.id == stock_item_uuid).first()
            if item and not check_farm_access(current_user, item.farm_id, db):
                raise HTTPException(status_code=403, detail="Accès non autorisé")
            query = query.filter(StockMovement.stock_item_id == stock_item_uuid)
        except ValueError:
            pass
    
    if current_user.role != "admin":
        farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
        farm_ids = [f.id for f in farms]
        if farm_ids:
            stock_items = db.query(StockItem.id).filter(StockItem.farm_id.in_(farm_ids)).all()
            stock_item_ids = [s[0] for s in stock_items]
            if stock_item_ids:
                query = query.filter(StockMovement.stock_item_id.in_(stock_item_ids))
            else:
                return []
    
    movements = query.order_by(StockMovement.movement_date.desc()).limit(limit).all()
    
    result = []
    for m in movements:
        result.append({
            "id": str(m.id),
            "stockItemId": str(m.stock_item_id),
            "type": m.type,
            "quantity": m.quantity,
            "unit": m.unit,
            "referenceId": str(m.reference_id) if m.reference_id else None,
            "referenceName": m.reference_name,
            "operatorId": str(m.operator_id) if m.operator_id else None,
            "operatorName": m.operator_name,
            "comment": m.comment,
            "movementDate": m.movement_date.isoformat() if m.movement_date else None,
            "createdAt": m.created_at.isoformat() if m.created_at else None
        })
    
    return result


@router.post("/movements", response_model=StockMovementResponse)
def create_stock_movement(
    data: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un mouvement de stock"""
    item = db.query(StockItem).filter(StockItem.id == data.stock_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if not check_farm_access(current_user, item.farm_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    if data.type == "entry":
        item.quantity += data.quantity
    elif data.type == "exit":
        if data.quantity > item.quantity:
            raise HTTPException(status_code=400, detail="Quantité insuffisante en stock")
        item.quantity -= data.quantity
    elif data.type == "adjustment":
        item.quantity = data.quantity
    
    update_stock_status(item)
    
    new_movement = StockMovement(
        stock_item_id=data.stock_item_id,
        type=data.type,
        quantity=data.quantity,
        unit=item.unit,
        reference_id=data.reference_id,
        reference_name=data.reference_name,
        operator_id=current_user.id,
        operator_name=current_user.name,
        comment=data.comment,
        movement_date=data.movement_date or datetime.utcnow()
    )
    db.add(new_movement)
    db.commit()
    db.refresh(new_movement)
    
    return new_movement



@router.get("/check")
def check_stock_availability(
    category: str = Query(..., description="vaccine, medication, feed, equipment"),
    product_name: str = Query(..., description="Nom du produit à vérifier"),
    quantity: float = Query(..., description="Quantité nécessaire"),
    farm_id: UUID = Query(..., description="ID de la ferme"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Vérifie si un produit est disponible en stock en quantité suffisante."""
    if not check_farm_access(current_user, farm_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    farm = db.query(Farm).filter(Farm.id == farm_id).first()
    
    # ✅ RECHERCHE AMÉLIORÉE
    stock_item = None
    
    # 1. Recherche exacte par nom
    stock_item = db.query(StockItem).filter(
        StockItem.farm_id == farm_id,
        StockItem.category == category,
        func.lower(StockItem.name) == func.lower(product_name)
    ).first()
    
    # 2. Recherche par feed_sub_type (pour les aliments)
    if not stock_item and category == "feed":
        stock_item = db.query(StockItem).filter(
            StockItem.farm_id == farm_id,
            StockItem.category == category,
            StockItem.feed_sub_type == product_name
        ).first()
    
    # 3. Recherche partielle (contient le texte)
    if not stock_item:
        stock_item = db.query(StockItem).filter(
            StockItem.farm_id == farm_id,
            StockItem.category == category,
            func.lower(StockItem.name).contains(func.lower(product_name))
        ).first()
    
    # 4. Recherche finale - n'importe quel produit contenant le nom
    if not stock_item:
        stock_item = db.query(StockItem).filter(
            StockItem.farm_id == farm_id,
            func.lower(StockItem.name).ilike(f"%{product_name.lower()}%")
        ).first()
    
    if not stock_item:
        return {
            "available": False,
            "stock_item": None,
            "message": f" Produit '{product_name}' introuvable dans votre stock. Veuillez d'abord l'ajouter via la page 'Stock'.",
            "shortage": quantity,
            "current_stock": 0,
            "unit": ""
        }
    
    # Conversion en float pour comparaison
    available_qty = float(stock_item.quantity)
    needed_qty = float(quantity)
    
    if available_qty >= needed_qty:
        return {
            "available": True,
            "stock_item": {
                "id": str(stock_item.id),
                "name": stock_item.name,
                "quantity": available_qty,
                "unit": stock_item.unit,
                "status": stock_item.status
            },
            "message": f" Stock suffisant: {available_qty} {stock_item.unit} disponible",
            "shortage": 0,
            "current_stock": available_qty,
            "unit": stock_item.unit
        }
    else:
        shortage = needed_qty - available_qty
        return {
            "available": False,
            "stock_item": {
                "id": str(stock_item.id),
                "name": stock_item.name,
                "quantity": available_qty,
                "unit": stock_item.unit,
                "status": stock_item.status
            },
            "message": f" Stock insuffisant: besoin de {needed_qty} {stock_item.unit}, disponible: {available_qty} {stock_item.unit}. Manque: {shortage} {stock_item.unit}",
            "shortage": shortage,
            "current_stock": available_qty,
            "unit": stock_item.unit
        }


@router.get("/", response_model=List[StockItemResponse])
def get_stock_items(
    farm_id: Optional[UUID] = Query(None),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer tous les articles en stock accessibles par l'utilisateur"""
    from app.models.farm_member import FarmMember
    
    query = db.query(StockItem)
    
    # Si un farm_id est spécifié, vérifier l'accès à cette ferme
    if farm_id:
        # Vérifier si l'utilisateur a accès à cette ferme
        has_access = False
        
        if current_user.role == "admin":
            has_access = True
        else:
            # Vérifier si l'utilisateur est manager de cette ferme
            farm = db.query(Farm).filter(Farm.id == farm_id, Farm.manager_id == current_user.id).first()
            if farm:
                has_access = True
            else:
                # Vérifier si l'utilisateur est membre via farm_members
                membership = db.query(FarmMember).filter(
                    FarmMember.user_id == current_user.id,
                    FarmMember.farm_id == farm_id
                ).first()
                if membership:
                    has_access = True
        
        if not has_access:
            raise HTTPException(status_code=403, detail="Accès non autorisé")
        
        query = query.filter(StockItem.farm_id == farm_id)
    
    # Si aucun farm_id spécifié, récupérer toutes les fermes accessibles
    elif current_user.role != "admin":
        farms_ids = set()
        
        # Fermes où l'utilisateur est manager
        manager_farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
        for farm in manager_farms:
            farms_ids.add(farm.id)
        
        # Fermes où l'utilisateur est membre via farm_members
        memberships = db.query(FarmMember).filter(FarmMember.user_id == current_user.id).all()
        for membership in memberships:
            farms_ids.add(membership.farm_id)
        
        if not farms_ids:
            return []
        
        query = query.filter(StockItem.farm_id.in_(farms_ids))
    
    # Appliquer les filtres supplémentaires
    if category:
        query = query.filter(StockItem.category == category)
    if status:
        query = query.filter(StockItem.status == status)
    if search:
        query = query.filter(StockItem.name.ilike(f"%{search}%"))
    
    items = query.all()
    return items


@router.post("/", response_model=StockItemResponse)
def create_stock_item(
    data: StockItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un nouvel article en stock"""
    if not check_farm_access(current_user, data.farm_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    status = "normal"
    if data.quantity <= data.min_threshold * 0.5:
        status = "critical"
    elif data.quantity <= data.min_threshold:
        status = "low"
    
    new_item = StockItem(
        name=data.name,
        category=data.category,
        quantity=data.quantity,
        unit=data.unit,
        min_threshold=data.min_threshold,
        farm_id=data.farm_id,
        supplier_id=data.supplier_id,
        status=status,
        last_restocked=data.last_restocked,
        expiry_date=data.expiry_date,
        notes=data.notes
    )
    db.add(new_item)
    db.flush()
    
    movement = StockMovement(
        stock_item_id=new_item.id,
        type="entry",
        quantity=data.quantity,
        unit=data.unit,
        operator_id=current_user.id,
        operator_name=current_user.name,
        comment=f"Création initiale du stock",
        movement_date=datetime.utcnow()
    )
    db.add(movement)
    
    db.commit()
    db.refresh(new_item)
    
    return new_item


@router.put("/{item_id}", response_model=StockItemResponse)
def update_stock_item(
    item_id: UUID,
    data: StockItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour un article en stock"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if not check_farm_access(current_user, item.farm_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    item.name = data.name
    item.category = data.category
    item.quantity = data.quantity
    item.unit = data.unit
    item.min_threshold = data.min_threshold
    item.last_restocked = data.last_restocked
    item.expiry_date = data.expiry_date
    item.notes = data.notes
    
    if hasattr(data, 'supplier_id'):
        item.supplier_id = data.supplier_id
    
    if hasattr(data, 'unit_price'):
        item.unit_price = data.unit_price
    
    if data.category == "feed" and hasattr(data, 'feed_sub_type'):
        item.feed_sub_type = data.feed_sub_type
    else:
        item.feed_sub_type = None
    
    update_stock_status(item)
    
    db.commit()
    db.refresh(item)
    
    return item


@router.delete("/{item_id}")
def delete_stock_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer un article en stock"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if not check_farm_access(current_user, item.farm_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Article supprimé avec succès"}


@router.post("/{item_id}/adjust-quantity")
def adjust_stock_quantity(
    item_id: UUID,
    quantity: float,
    type: str,
    comment: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ajuster la quantité d'un article (entrée/sortie/ajustement)"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if not check_farm_access(current_user, item.farm_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    if type == "entry":
        item.quantity += quantity
    elif type == "exit":
        if quantity > item.quantity:
            raise HTTPException(status_code=400, detail="Quantité insuffisante en stock")
        item.quantity -= quantity
    elif type == "adjustment":
        item.quantity = quantity
    else:
        raise HTTPException(status_code=400, detail="Type de mouvement invalide")
    
    update_stock_status(item)
    
    movement = StockMovement(
        stock_item_id=item.id,
        type=type,
        quantity=quantity,
        unit=item.unit,
        operator_id=current_user.id,
        operator_name=current_user.name,
        comment=comment,
        movement_date=datetime.utcnow()
    )
    db.add(movement)
    
    db.commit()
    db.refresh(item)
    
    return {"message": "Quantité ajustée avec succès", "new_quantity": item.quantity, "status": item.status}


@router.get("/{item_id}", response_model=StockItemResponse)
def get_stock_item(
    item_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer un article en stock par son ID"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    if not check_farm_access(current_user, item.farm_id, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    return item