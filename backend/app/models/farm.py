from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, ARRAY, Float, func
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
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    # Relations (optionnel, pour accès facile depuis Python)
    poultry_houses = relationship("PoultryHouse", back_populates="farm")
    alerts = relationship("Alert", back_populates="farm")
    bands = relationship("Band", back_populates="farm", cascade="all, delete-orphan")
    flocks = relationship("Flock", back_populates="farm", cascade="all, delete-orphan")
    stock_items = relationship("StockItem", back_populates="farm", cascade="all, delete-orphan")
    manager = relationship("User", back_populates="managed_farms", foreign_keys=[manager_id])
    members = relationship("User", secondary="farm_members", back_populates="managed_farms")
    def __repr__(self):
        return f"<Farm(id={self.id}, name={self.name}, address={self.address}, types={self.type})>"