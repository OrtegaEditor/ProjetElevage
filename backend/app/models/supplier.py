# backend/app/models/supplier.py
from sqlalchemy import Column, String, Boolean, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class Supplier(Base):
    """
    Modèle Fournisseur
    """
    __tablename__ = "suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=False)
    address = Column(Text, nullable=True)
    company = Column(String(255), nullable=True)
    supplied_categories = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relations
    farm_suppliers = relationship("FarmSupplier", back_populates="supplier", cascade="all, delete-orphan")
    farms = relationship("Farm", secondary="farm_suppliers", back_populates="suppliers")
    stock_items = relationship("StockItem", back_populates="supplier")

    def __repr__(self):
        return f"<Supplier(id={self.id}, name={self.name})>"