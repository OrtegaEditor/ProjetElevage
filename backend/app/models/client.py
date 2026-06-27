from sqlalchemy import Column, String, Float, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Client(Base):
    """
    Modèle Client
    """
    __tablename__ = "clients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # restaurant, supermarket, wholesaler, individual
    email = Column(String(255), nullable=False, unique=True)
    phone = Column(String(50), nullable=False)
    address = Column(String(500), nullable=False)
    total_purchases = Column(Float, default=0.0, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relations
    sales = relationship("Sale", back_populates="client")

    def __repr__(self):
        return f"<Client(id={self.id}, name={self.name}, type={self.type})>"
