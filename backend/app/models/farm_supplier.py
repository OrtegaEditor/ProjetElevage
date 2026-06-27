# backend/app/models/farm_supplier.py
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class FarmSupplier(Base):
    """
    Table de liaison entre fermes et fournisseurs
    """
    __tablename__ = "farm_suppliers"

    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), primary_key=True)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), primary_key=True)

    # Relations
    farm = relationship("Farm", back_populates="farm_suppliers")
    supplier = relationship("Supplier", back_populates="farm_suppliers")

    def __repr__(self):
        return f"<FarmSupplier(farm_id={self.farm_id}, supplier_id={self.supplier_id})>"