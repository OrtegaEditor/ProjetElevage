# backend/app/models/feeding_record.py
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class FeedingRecord(Base):
    __tablename__ = "feeding_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    feed_type = Column(String(50), nullable=False)  # starter, grower, finisher
    quantity_kg = Column(Float, nullable=False)
    stock_item_id = Column(UUID(as_uuid=True), ForeignKey("stock_items.id"), nullable=False)  
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 
    
    # Relations
    flock = relationship("Flock", back_populates="feeding_records")
    stock_item = relationship("StockItem", back_populates="feeding_records") 