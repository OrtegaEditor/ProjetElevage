# backend/app/api/v1/suppliers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import List
from datetime import datetime
import json

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.supplier import Supplier
from app.models.farm_supplier import FarmSupplier
from app.models.farm import Farm
from app.schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse

router = APIRouter(prefix="/api/v1/suppliers", tags=["Suppliers"])


def check_supplier_access(supplier: Supplier, current_user: User, db: Session) -> bool:
    """Vérifie si l'utilisateur a accès au fournisseur"""
    if current_user.role in ["admin", "veterinarian"]:
        return True
    # Pour agent: vérifier si lié à une ferme gérée
    farm_suppliers = db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).all()
    for fs in farm_suppliers:
        farm = db.query(Farm).filter(Farm.id == fs.farm_id, Farm.manager_id == current_user.id).first()
        if farm:
            return True
    return False


@router.post("/", response_model=SupplierResponse)
def create_supplier(
    data: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un nouveau fournisseur - admin et vétérinaire"""
    if current_user.role not in ["admin", "veterinarian"]:
        raise HTTPException(status_code=403, detail="Permission refusée")
    
    # Vérification des accès
    for farm_id in data.farm_ids:
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        if not farm:
            raise HTTPException(status_code=404, detail=f"Ferme {farm_id} non trouvée")
        if current_user.role != "admin" and farm.manager_id != current_user.id:
            raise HTTPException(status_code=403, detail=f"Accès non autorisé à la ferme {farm_id}")
    
    now = datetime.utcnow()
    supplied_categories_str = json.dumps(data.supplied_categories) if data.supplied_categories else "[]"
    
    new_supplier = Supplier(
        name=data.name,
        email=data.email,
        phone=data.phone,
        address=data.address,
        company=data.company,
        supplied_categories=supplied_categories_str,
        notes=data.notes,
        active=data.active,
        created_at=now,
        updated_at=now
    )
    db.add(new_supplier)
    db.flush()
    
    if data.farm_ids and len(data.farm_ids) > 0:
        for farm_id in data.farm_ids:
            farm_supplier = FarmSupplier(farm_id=farm_id, supplier_id=new_supplier.id)
            db.add(farm_supplier)
    
    db.commit()
    db.refresh(new_supplier)
    
    saved_farm_ids = [fs.farm_id for fs in db.query(FarmSupplier).filter(FarmSupplier.supplier_id == new_supplier.id).all()]
    saved_categories = json.loads(new_supplier.supplied_categories) if new_supplier.supplied_categories else []
    
    return SupplierResponse(
        id=new_supplier.id,
        name=new_supplier.name,
        email=new_supplier.email,
        phone=new_supplier.phone,
        address=new_supplier.address,
        company=new_supplier.company,
        supplied_categories=saved_categories,
        notes=new_supplier.notes,
        active=new_supplier.active,
        farm_ids=saved_farm_ids,
        created_at=new_supplier.created_at,
        updated_at=new_supplier.updated_at
    )

# backend/app/api/v1/suppliers.py
# Version simplifiée

@router.get("/", response_model=List[SupplierResponse])
def get_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    active_only: bool = True
):
    """Récupérer les fournisseurs accessibles par l'utilisateur"""
    
    # Récupérer tous les fournisseurs actifs
    query = db.query(Supplier)
    if active_only:
        query = query.filter(Supplier.active == True)
    
    all_suppliers = query.all()
    
    # Si admin, retourner tout
    if current_user.role == "admin":
        result = []
        for supplier in all_suppliers:
            farm_ids = [fs.farm_id for fs in db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).all()]
            result.append(SupplierResponse(
                id=supplier.id,
                name=supplier.name,
                email=supplier.email,
                phone=supplier.phone,
                address=supplier.address,
                company=supplier.company,
                supplied_categories=json.loads(supplier.supplied_categories) if supplier.supplied_categories else [],
                notes=supplier.notes,
                active=supplier.active,
                farm_ids=farm_ids,
                created_at=supplier.created_at,
                updated_at=supplier.updated_at
            ))
        return result
    
    # Récupérer les fermes de l'utilisateur
    user_farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
    user_farm_ids = [f.id for f in user_farms]
    
    if not user_farm_ids:
        return []
    
    # Filtrer les fournisseurs liés aux fermes de l'utilisateur
    accessible_suppliers = []
    for supplier in all_suppliers:
        supplier_farm_ids = [fs.farm_id for fs in db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).all()]
        # Vérifier si au moins une ferme du fournisseur est dans les fermes de l'utilisateur
        if any(fid in user_farm_ids for fid in supplier_farm_ids):
            accessible_suppliers.append(supplier)
    
    result = []
    for supplier in accessible_suppliers:
        farm_ids = [fs.farm_id for fs in db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).all()]
        result.append(SupplierResponse(
            id=supplier.id,
            name=supplier.name,
            email=supplier.email,
            phone=supplier.phone,
            address=supplier.address,
            company=supplier.company,
            supplied_categories=json.loads(supplier.supplied_categories) if supplier.supplied_categories else [],
            notes=supplier.notes,
            active=supplier.active,
            farm_ids=farm_ids,
            created_at=supplier.created_at,
            updated_at=supplier.updated_at
        ))
    
    return result



@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer un fournisseur par son ID"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    if current_user.role not in ["admin", "veterinarian"] and not check_supplier_access(supplier, current_user, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    farm_ids = [fs.farm_id for fs in db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).all()]
    
    return SupplierResponse(
        id=supplier.id,
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        company=supplier.company,
        supplied_categories=json.loads(supplier.supplied_categories) if supplier.supplied_categories else [],
        notes=supplier.notes,
        active=supplier.active,
        farm_ids=farm_ids,
        created_at=supplier.created_at,
        updated_at=supplier.updated_at
    )


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: UUID,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour un fournisseur - admin et vétérinaire"""
    if current_user.role not in ["admin", "veterinarian"]:
        raise HTTPException(status_code=403, detail="Permission refusée")
    
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    update_data = data.model_dump(exclude_unset=True)
    
    if "name" in update_data:
        supplier.name = update_data["name"]
    if "email" in update_data:
        supplier.email = update_data["email"]
    if "phone" in update_data:
        supplier.phone = update_data["phone"]
    if "address" in update_data:
        supplier.address = update_data["address"]
    if "company" in update_data:
        supplier.company = update_data["company"]
    if "supplied_categories" in update_data:
        supplier.supplied_categories = json.dumps(update_data["supplied_categories"])
    if "notes" in update_data:
        supplier.notes = update_data["notes"]
    if "active" in update_data:
        supplier.active = update_data["active"]
    
    if "farm_ids" in update_data:
        db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).delete()
        for farm_id in update_data["farm_ids"]:
            farm_supplier = FarmSupplier(farm_id=farm_id, supplier_id=supplier.id)
            db.add(farm_supplier)
    
    db.commit()
    db.refresh(supplier)
    
    farm_ids = [fs.farm_id for fs in db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).all()]
    
    return SupplierResponse(
        id=supplier.id,
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        company=supplier.company,
        supplied_categories=json.loads(supplier.supplied_categories) if supplier.supplied_categories else [],
        notes=supplier.notes,
        active=supplier.active,
        farm_ids=farm_ids,
        created_at=supplier.created_at,
        updated_at=supplier.updated_at
    )


@router.delete("/{supplier_id}")
def delete_supplier(
    supplier_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Désactiver un fournisseur - admin uniquement"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul l'admin peut désactiver des fournisseurs")
    
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    supplier.active = False
    db.commit()
    
    return {"message": "Fournisseur désactivé avec succès"}