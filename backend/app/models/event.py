from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base
from sqlalchemy.orm import relationship



class Event(Base):
    """
    Modèle d'Événements Journalisés (Optimisé TimescaleDB)
    """
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(DateTime,primary_key=True, server_default=func.now(), nullable=False)

    
    type = Column(String(50), nullable=False)  # egg_collection, mortality, feeding, weighing, vaccination
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    poultry_house_id = Column(UUID(as_uuid=True), ForeignKey("poultry_houses.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=False)  # ID utilisateur
    notes = Column(String(1000), nullable=True)

    # Relations
    flock = relationship("Flock", back_populates="events")

    def __repr__(self):
        return f"<Event(id={self.id}, type={self.type}, time={self.created_at})>"
