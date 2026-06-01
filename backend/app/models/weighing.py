from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Date, ARRAY,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
from app.core.database import Base


class Weighing(Base):
    """
    Modèle pesée
    
    Enregistrement des pesées d'un lot
    Contient l'historique complet avec statistiques calculées
    """
    __tablename__ = "weighings"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Liens
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Date de la pesée
    date = Column(Date, nullable=False)
    
    # Poids individuels (array de floats)
    weights = Column(ARRAY(Float), nullable=False)  # [2.3, 2.1, 2.5, 2.4, ...]
    
    # Statistiques (calculées automatiquement)
    average_weight = Column(Float, nullable=False)  # Poids moyen
    min_weight = Column(Float, nullable=False)      # Poids minimum
    max_weight = Column(Float, nullable=False)      # Poids maximum
    std_deviation = Column(Float, nullable=False)   # Écart-type
    
    # Notes/Observations
    notes = Column(String(1000), nullable=True)
    
    # Métadonnées
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relations (optionnel)
    flock = relationship("Flock", back_populates="weighings")
    user = relationship("User", back_populates="weighings")
    
    def __repr__(self):
        return f"<Weighing(id={self.id}, flock_id={self.flock_id}, date={self.date}, avg_weight={self.average_weight})>"
