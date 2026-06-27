# backend/app/models/stock_movement.py
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class StockMovement(Base):
    """
    Modèle Mouvement de Stock (StockMovement)
    
    Enregistre l'historique de chaque entrée, sortie ou ajustement de stock.
    """
    __tablename__ = "stock_movements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stock_item_id = Column(UUID(as_uuid=True), ForeignKey("stock_items.id"), nullable=False)
    type = Column(String(20), nullable=False)  # entry, exit, adjustment, transfer
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # ID de la salle, lot, fournisseur
    reference_name = Column(String(255), nullable=True)
    operator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    operator_name = Column(String(255), nullable=False)
    comment = Column(Text, nullable=True)
    movement_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    # Relations
    stock_item = relationship("StockItem", back_populates="movements")
    operator = relationship("User", foreign_keys=[operator_id])

    def __repr__(self):
        return f"<StockMovement(id={self.id}, type={self.type}, qty={self.quantity})>"