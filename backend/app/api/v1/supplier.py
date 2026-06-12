# backend/app/api/v1/suppliers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import List
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
    if current_user.role == "admin":
        return True
    # Vérifier si l'utilisateur est manager d'une ferme liée à ce fournisseur
    farm_suppliers = db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).all()
    for fs in farm_suppliers:
        farm = db.query(Farm).filter(Farm.id == fs.farm_id, Farm.manager_id == current_user.id).first()
        if farm:
            return True
    return False


@router.get("/", response_model=List[SupplierResponse])
def get_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    farm_id: UUID = None,
    active_only: bool = True
):
    """Récupérer tous les fournisseurs"""
    query = db.query(Supplier)
    
    if farm_id:
        # Filtrer par ferme
        query = query.join(FarmSupplier).filter(FarmSupplier.farm_id == farm_id)
    
    if active_only:
        query = query.filter(Supplier.active == True)
    
    suppliers = query.all()
    
    # Filtrer par accès
    if current_user.role != "admin":
        accessible = []
        for supplier in suppliers:
            if check_supplier_access(supplier, current_user, db):
                accessible.append(supplier)
        suppliers = accessible
    
    # Ajouter les farm_ids à la réponse
    result = []
    for supplier in suppliers:
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
    
    if not check_supplier_access(supplier, current_user, db):
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


# backend/app/api/v1/suppliers.py - Version corrigée

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
    if current_user.role == "admin":
        return True
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
    """Créer un nouveau fournisseur"""
    print("=== DEBUG CREATE SUPPLIER ===")
    print(f"Données reçues: {data}")
    print(f"Type de data.farm_ids: {type(data.farm_ids)}")
    print(f"Valeur de data.farm_ids: {data.farm_ids}")
    print(f"Type de data.supplied_categories: {type(data.supplied_categories)}")
    print(f"Valeur de data.supplied_categories: {data.supplied_categories}")
    
    # Vérification des accès
    if current_user.role != "admin":
        for farm_id in data.farm_ids:
            farm = db.query(Farm).filter(Farm.id == farm_id, Farm.manager_id == current_user.id).first()
            if not farm:
                raise HTTPException(status_code=403, detail=f"Accès non autorisé à la ferme {farm_id}")
    
    # Date actuelle
    now = datetime.utcnow()
    
    # Convertir les catégories en JSON string - IMPORTANT
    supplied_categories_str = json.dumps(data.supplied_categories) if data.supplied_categories else "[]"
    print(f"supplied_categories_str: {supplied_categories_str}")
    
    # Création du fournisseur
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
    
    print(f"Fournisseur créé avec ID: {new_supplier.id}")
    
    # Ajouter les liaisons avec les fermes - Vérifier que farm_ids n'est pas vide
    if data.farm_ids and len(data.farm_ids) > 0:
        for farm_id in data.farm_ids:
            print(f"Tentative d'ajout liaison: farm_id={farm_id}, supplier_id={new_supplier.id}")
            # Vérifier que la ferme existe
            farm_exists = db.query(Farm).filter(Farm.id == farm_id).first()
            if farm_exists:
                farm_supplier = FarmSupplier(farm_id=farm_id, supplier_id=new_supplier.id)
                db.add(farm_supplier)
                print(f"Liaison ajoutée avec succès")
            else:
                print(f"ERREUR: Ferme {farm_id} n'existe pas")
    else:
        print("AUCUNE ferme à lier - farm_ids est vide")
    
    db.commit()
    db.refresh(new_supplier)
    
    # Récupérer les données enregistrées
    saved_farm_ids = [fs.farm_id for fs in db.query(FarmSupplier).filter(FarmSupplier.supplier_id == new_supplier.id).all()]
    saved_categories = json.loads(new_supplier.supplied_categories) if new_supplier.supplied_categories else []
    
    print(f"=== RÉSULTAT FINAL ===")
    print(f"farm_ids enregistrés: {saved_farm_ids}")
    print(f"categories enregistrées: {saved_categories}")
    
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

@router.get("/", response_model=List[SupplierResponse])
def get_suppliers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    farm_id: UUID = None,
    active_only: bool = True
):
    """Récupérer tous les fournisseurs"""
    print(f"=== DEBUG GET SUPPLIERS ===")
    print(f"current_user.id: {current_user.id}")
    print(f"active_only: {active_only}")
    
    query = db.query(Supplier)
    
    if farm_id:
        query = query.join(FarmSupplier).filter(FarmSupplier.farm_id == farm_id)
    
    if active_only:
        query = query.filter(Supplier.active == True)
    
    suppliers = query.all()
    print(f"Nombre de fournisseurs trouvés: {len(suppliers)}")
    
    # Filtrer par accès
    if current_user.role != "admin":
        accessible = []
        for supplier in suppliers:
            if check_supplier_access(supplier, current_user, db):
                accessible.append(supplier)
        suppliers = accessible
        print(f"Fournisseurs accessibles: {len(suppliers)}")
    
    # Ajouter les farm_ids à la réponse
    result = []
    for supplier in suppliers:
        farm_ids = [fs.farm_id for fs in db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).all()]
        print(f"Fournisseur {supplier.name}: farm_ids={farm_ids}")
        
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

@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: UUID,
    data: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour un fournisseur"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    if not check_supplier_access(supplier, current_user, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
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
    
    # Mettre à jour les liaisons avec les fermes
    if "farm_ids" in update_data:
        # Supprimer les anciennes liaisons
        db.query(FarmSupplier).filter(FarmSupplier.supplier_id == supplier.id).delete()
        # Ajouter les nouvelles
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
    """Supprimer un fournisseur (soft delete)"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    if not check_supplier_access(supplier, current_user, db):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    supplier.active = False
    db.commit()
    
    return {"message": "Fournisseur désactivé avec succès"}