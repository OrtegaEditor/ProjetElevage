from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
from app.core.database import Base


class Vaccination(Base):
    """
    Modèle vaccination
    
    Une vaccination appartient à un lot
    Pour une maladie spécifique
    Administrée par un vétérinaire
    """
    __tablename__ = "vaccinations"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Liens
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id"), nullable=False)
    veterinarian_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Informations du vaccin
    vaccine = Column(String(255), nullable=False)  # Ex: "Vaccin Newcastle"
    quantity = Column(Integer, nullable=False)  # Nombre de doses
    
    # Méthode d'administration
    method = Column(String(50), nullable=False)  # drinking_water, injection, spray, eye_drop
    
    # Dates
    administration_date = Column(Date, nullable=False)
    next_due_date = Column(Date, nullable=True)  # Rappel prévu
    
    # Notes/Observations
    notes = Column(String(1000), nullable=True)
    
    # Métadonnées
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations (optionnel)
    flock = relationship("Flock", back_populates="vaccinations")
    disease = relationship("Disease", back_populates="vaccinations")
    veterinarian = relationship("User", back_populates="vaccinations")
    
    def __repr__(self):
        return f"<Vaccination(id={self.id}, flock_id={self.flock_id}, vaccine={self.vaccine}, method={self.method})>"