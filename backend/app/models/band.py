from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Band(Base):
    """
    Modèle Bande (Band)
    
    Représente un arrivage global d'animaux pour une ferme.
    """
    __tablename__ = "bands"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    
    # Liens
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    espece_id = Column(UUID(as_uuid=True), ForeignKey("especes.id"), nullable=False)
    
    quantity = Column(Integer, nullable=False)
    created_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    fournisseur = Column(String(255), nullable=True)
    prix_unitaire = Column(Float, nullable=True)
    status = Column(String(20), nullable=False, default="active")  # active, closed
    notes = Column(String(1000), nullable=True)

    # Métadonnées
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relations
    farm = relationship("Farm", back_populates="bands")
    espece = relationship("Espece", back_populates="bands")
    flocks = relationship("Flock", back_populates="band", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Band(id={self.id}, name={self.name}, status={self.status})>"
