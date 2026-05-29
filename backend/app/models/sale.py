from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Sale(Base):
    """
    Modèle Vente (Sale)
    """
    __tablename__ = "sales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False) # L'agent commercial qui a réalisé la vente

    quantity = Column(Integer, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    total_weight = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    invoice_number = Column(String(100), unique=True, nullable=False)
    status = Column(String(50), nullable=False, default="pending")  # pending, paid, overdue

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    # Relations
    client = relationship("Client", back_populates="sales")
    flock = relationship("Flock", back_populates="sales")
    user = relationship("User", back_populates="sales")  # L'agent commercial qui a réalisé la vente
    def __repr__(self):
        return f"<Sale(id={self.id}, invoice={self.invoice_number}, amount={self.total_amount})>"
