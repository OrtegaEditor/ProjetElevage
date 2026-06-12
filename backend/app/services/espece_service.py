from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID
from typing import Optional, Tuple, List

from app.models.espece import Espece
from app.schemas.espece import EspeceCreate, EspeceUpdate


class EspeceService:
    
    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> Tuple[List[Espece], int]:
        """Récupérer toutes les espèces avec recherche optionnelle"""
        query = db.query(Espece)
        
        if search:
            query = query.filter(Espece.name.ilike(f"%{search}%"))
        
        total = query.count()
        items = query.order_by(Espece.name).offset(skip).limit(limit).all()
        
        return items, total
    
    @staticmethod
    def get_by_id(db: Session, espece_id: UUID) -> Espece | None:
        """Récupérer une espèce par son ID"""
        return db.query(Espece).filter(Espece.id == espece_id).first()
    
    @staticmethod
    def get_by_name(db: Session, name: str) -> Espece | None:
        """Récupérer une espèce par son nom"""
        return db.query(Espece).filter(Espece.name == name).first()
    
    @staticmethod
    def create(db: Session, data: EspeceCreate) -> Espece:
        """Créer une nouvelle espèce"""
        espece = Espece(
            name=data.name,
            average_cycle=data.average_cycle
        )
        db.add(espece)
        db.commit()
        db.refresh(espece)
        return espece
    
    @staticmethod
    def update(db: Session, espece_id: UUID, data: EspeceUpdate) -> Espece | None:
        """Mettre à jour une espèce"""
        espece = EspeceService.get_by_id(db, espece_id)
        if not espece:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(espece, key, value)
        
        db.commit()
        db.refresh(espece)
        return espece
    
    @staticmethod
    def delete(db: Session, espece_id: UUID) -> bool:
        """Supprimer une espèce"""
        espece = EspeceService.get_by_id(db, espece_id)
        if not espece:
            return False
        
        # Vérifier si des bandes utilisent cette espèce
        if espece.bands:
            return False
        
        db.delete(espece)
        db.commit()
        return True