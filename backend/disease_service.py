from sqlalchemy.orm import Session
from sqlalchemy import or_
from uuid import UUID
from typing import Optional, List, Tuple

from app.models.disease import Disease
from app.schemas.disease import DiseaseCreate, DiseaseUpdate


class DiseaseService:
    
    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        disease_type: Optional[str] = None,
        severity: Optional[str] = None
    ) -> Tuple[List[Disease], int]:
        """Récupérer toutes les maladies avec filtres optionnels"""
        query = db.query(Disease)
        
        # Filtre par recherche (nom ou description)
        if search:
            query = query.filter(
                or_(
                    Disease.name.ilike(f"%{search}%"),
                    Disease.description.ilike(f"%{search}%")
                )
            )
        
        # Filtre par type
        if disease_type:
            query = query.filter(Disease.type == disease_type)
        
        # Filtre par sévérité
        if severity:
            query = query.filter(Disease.severity == severity)
        
        total = query.count()
        items = query.order_by(Disease.name).offset(skip).limit(limit).all()
        
        return items, total
    
    @staticmethod
    def get_by_id(db: Session, disease_id: UUID) -> Disease | None:
        """Récupérer une maladie par son ID"""
        return db.query(Disease).filter(Disease.id == disease_id).first()
    
    @staticmethod
    def get_by_name(db: Session, name: str) -> Disease | None:
        """Récupérer une maladie par son nom"""
        return db.query(Disease).filter(Disease.name == name).first()
    
    @staticmethod
    def create(db: Session, data: DiseaseCreate) -> Disease:
        """Créer une nouvelle maladie"""
        disease = Disease(
            name=data.name,
            type=data.type,
            symptoms=data.symptoms,
            severity=data.severity,
            description=data.description
        )
        db.add(disease)
        db.commit()
        db.refresh(disease)
        return disease
    
    @staticmethod
    def update(db: Session, disease_id: UUID, data: DiseaseUpdate) -> Disease | None:
        """Mettre à jour une maladie"""
        disease = DiseaseService.get_by_id(db, disease_id)
        if not disease:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(disease, key, value)
        
        db.commit()
        db.refresh(disease)
        return disease
    
    @staticmethod
    def delete(db: Session, disease_id: UUID) -> bool:
        """Supprimer une maladie"""
        disease = DiseaseService.get_by_id(db, disease_id)
        if not disease:
            return False
        
        db.delete(disease)
        db.commit()
        return True