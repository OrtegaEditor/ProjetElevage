from sqlalchemy import Column, String, DateTime, ForeignKey,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Task(Base):
    """
    Modèle Tâche Planifiée
    """
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(50), nullable=False)  # feeding, weighing, ventilation, mortality, etc.
    title = Column(String(255), nullable=False)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False) # ID de l'utilisateur assigné

    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    poultry_house_id = Column(UUID(as_uuid=True), ForeignKey("poultry_houses.id"), nullable=False)
    
    time = Column(DateTime, nullable=False)  # Date/Heure prévue d'exécution
    status = Column(String(20), nullable=False, default="pending")  # pending, completed

    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relations
    flock = relationship("Flock", back_populates="tasks")
    poultry_house = relationship("PoultryHouse", back_populates="tasks")
    user = relationship("User", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status})>"
