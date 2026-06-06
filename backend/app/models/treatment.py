from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Date,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Treatment(Base):
    """
    Modèle Soins / Traitement (Treatment)
    
    Enregistre les soins administrés à un lot d'animaux pour une maladie.
    """
    __tablename__ = "treatments"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Liens d'identifiants
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id"), nullable=False)
    veterinarian_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Détails du traitement
    animals_count = Column(Integer, nullable=False)  # Nombre d'animaux traités
    medication = Column(String(255), nullable=False) # Ex: Amoxicilline
    dosage = Column(String(255), nullable=False)     # Ex: 1ml / litre
    
    # Dates de suivi
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Notes complémentaires
    notes = Column(String(1000), nullable=True)
    
    # Métadonnées
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relations
    flock = relationship("Flock", back_populates="treatments")
    disease = relationship("Disease", back_populates="treatments")
    veterinarian = relationship("User", back_populates="treatments")
    user = relationship("User", back_populates="treatments", overlaps="veterinarian")
    def __repr__(self):
        return f"<Treatment(id={self.id}, flock_id={self.flock_id}, medication={self.medication})>"
