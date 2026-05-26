from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class SensorReading(Base):
    """
    Modèle Mouvement de Stock (Optimisé TimescaleDB pour historique complet)
    """
    __tablename__ = "sensor_reading"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(DateTime, primary_key=True, nullable=False, default=datetime.utcnow)
    
    stock_item_id = Column(UUID(as_uuid=True), ForeignKey("stock_items.id"), nullable=False)
    stock_item_name = Column(String(255), nullable=False)
    
    type = Column(String(50), nullable=False)  # entry, exit, adjustment, transfer
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # ID de la salle, du lot, etc.
    reference_name = Column(String(255), nullable=True)        # Ex: "Salle A1"
    operator = Column(String(255), nullable=False)
    comment = Column(String(1000), nullable=True)

    # Relation
    stock_item = relationship("StockItem", back_populates="movements")

    def __repr__(self):
        return f"<SensorReading(id={self.id}, type={self.type}, qty={self.quantity})>"
