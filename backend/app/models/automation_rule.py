from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class AutomationRule(Base):
    """
    Modèle Règle d'Automatisation
    """
    __tablename__ = "automation_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poultry_house_id = Column(UUID(as_uuid=True), ForeignKey("poultry_houses.id"), nullable=False)
    type = Column(String(50), nullable=False)  # ventilation, lighting, heating
    enabled = Column(Boolean, default=True, nullable=False)
    condition = Column(String(500), nullable=False)  # Ex: "temperature > 30"
    action = Column(String(500), nullable=False)     # Ex: "turn_on_ventilation"
    
    # Contient {startTime: "HH:MM", endTime: "HH:MM"}
    schedule = Column(JSON, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    poultry_house = relationship("PoultryHouse", back_populates="automation_rules")

    def __repr__(self):
        return f"<AutomationRule(id={self.id}, type={self.type}, enabled={self.enabled})>"
    