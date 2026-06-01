from sqlalchemy import Column, String, DateTime, ARRAY, func
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import relationship

import uuid
from app.core.database import Base


class Disease(Base):
    """
    Modèle maladie
    
    Catalogue de maladies possibles
    Utilisé pour les traitements et vaccinations
    """
    __tablename__ = "diseases"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Informations de base
    name = Column(String(255), nullable=False, unique=True)  # Ex: "Maladie de Newcastle"
    
    # Caractéristiques
    type = Column(String(50), nullable=False)  # viral, bacterial, parasitic, nutritional
    
    # Symptômes (array de strings)
    symptoms = Column(ARRAY(String(255)), nullable=True)  # ["fièvre", "diarrhée", "léthargie"]
    
    # Sévérité
    severity = Column(String(20), nullable=False)  # low, medium, high
    
    # Description (optionnel)
    description = Column(String(1000), nullable=True)
    
    # Métadonnées
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relations (optionnel)
    treatments = relationship("Treatment", back_populates="disease")
    vaccinations = relationship("Vaccination", back_populates="disease")
    
    def __repr__(self):
        return f"<Disease(id={self.id}, name={self.name}, type={self.type}, severity={self.severity})>"