from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class StockItem(Base):
    """
    Modèle Article en Stock
    """
    __tablename__ = "stock_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # feed, vaccine, medication, equipment, other
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String(20), nullable=False)  # kg, l, doses, etc.
    min_threshold = Column(Float, nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    status = Column(String(20), nullable=False, default="normal")  # normal, low, critical
    
    last_restocked = Column(DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    farm = relationship("Farm", back_populates="stock_items")
    movements = relationship("StockMovement", back_populates="stock_item")
    
    def __repr__(self):
        return f"<StockItem(id={self.id}, name={self.name}, qty={self.quantity})>"
