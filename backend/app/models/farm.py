# backend/app/models/farm.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, ARRAY, Float, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class Farm(Base):
    """
    Modèle ferme d'élevage
    """
    __tablename__ = "farms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(String(500), nullable=False)
    description = Column(String(1000), nullable=True)
    poultry_types = Column(ARRAY(String(50)), nullable=False)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    total_capacity = Column(Integer, nullable=True)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    poultry_houses = relationship("PoultryHouse", back_populates="farm")
    alerts = relationship("Alert", back_populates="farm")
    bands = relationship("Band", back_populates="farm", cascade="all, delete-orphan")
    flocks = relationship("Flock", back_populates="farm", cascade="all, delete-orphan")
    stock_items = relationship("StockItem", back_populates="farm", cascade="all, delete-orphan")
    members = relationship("User", secondary="farm_members", back_populates="managed_farms")
    
    # Correction: Utiliser la classe FarmSupplier directement
    farm_suppliers = relationship("FarmSupplier", back_populates="farm", cascade="all, delete-orphan")
    
    # Relation directe vers les fournisseurs via la table de liaison
    suppliers = relationship("Supplier", secondary="farm_suppliers", back_populates="farms",overlaps="farm_suppliers")

    def __repr__(self):
        return f"<Farm(id={self.id}, name={self.name})>"