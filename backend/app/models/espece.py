from sqlalchemy import Column, String, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Espece(Base):
    """
    Modèle Espece
    
    Représente un type de volaille de référence (broiler, layer, turkey, etc.)
    """
    __tablename__ = "especes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)  # broiler, layer, turkey, duck, goose
    average_cycle = Column(Integer, nullable=False)  # En jours

    # Métadonnées
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relations
    bands = relationship("Band", back_populates="espece")

    def __repr__(self):
        return f"<Espece(id={self.id}, name={self.name})>"
