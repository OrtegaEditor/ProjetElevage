from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, ARRAY, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Farm(Base):
    """
    Modèle ferme d'élevage
    
    Une ferme appartient à un utilisateur (manager)
    Une ferme contient plusieurs salles (PoultryHouse)
    """
    __tablename__ = "farms"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Informations de base
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    description = Column(String(1000), nullable=True)
    
    # Types de volailles (array: broiler, layer, turkey, duck, goose)
    type = Column(ARRAY(String(50)), nullable=False)  # ["broiler", "layer"]
    
    # Gestionnaire de la ferme (lien avec User)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Capacité totale (calculée depuis les salles, mais stockée pour requêtes rapides)
    total_capacity = Column(Integer, nullable=True)
    
    # Statut
    active = Column(Boolean, nullable=False, default=True)
    
    # Métadonnées
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations (optionnel, pour accès facile depuis Python)
    poultry_houses = relationship("PoultryHouse", back_populates="farm")
    manager = relationship("User")
    
    def __repr__(self):
        return f"<Farm(id={self.id}, name={self.name}, address={self.address}, types={self.type})>"