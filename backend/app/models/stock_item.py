# backend/app/models/stock_item.py
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func, Text
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
    category = Column(String(50), nullable=False)
    feed_sub_type = Column(String(50), nullable=True)  
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String(20), nullable=False)
    min_threshold = Column(Float, nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=True)
    status = Column(String(20), nullable=False, default="normal")
    
    last_restocked = Column(DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    unit_price = Column(Float, nullable=True) 
    notes = Column(Text, nullable=True)  

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relations
    farm = relationship("Farm", back_populates="stock_items")
    supplier = relationship("Supplier", back_populates="stock_items")
    movements = relationship("StockMovement", back_populates="stock_item", cascade="all, delete-orphan")
    feeding_records = relationship("FeedingRecord", back_populates="stock_item")
    def __repr__(self):
        return f"<StockItem(id={self.id}, name={self.name}, qty={self.quantity})>"