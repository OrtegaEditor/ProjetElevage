from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class Alert(Base):
    """
    Modèle Alerte Systèmes
    """
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(50), nullable=False)  # temperature, light, ammoniac
    status = Column(String(50), nullable=False, default="active")  # active, resolved_auto, resolved_manual, ignored
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)

    # Liens d'identifiants directs exigés par l'interface
    id_poultry_house = Column(String(255), nullable=False)
    poultry_house_id = Column(UUID(as_uuid=True), ForeignKey("poultry_houses.id"), nullable=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=True)
    
    # ─── AJOUTEZ CETTE LIGNE POUR LIER L'ID DE L'UTILISATEUR ───
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relations
    poultry_house = relationship("PoultryHouse", back_populates="alerts")
    farm = relationship("Farm", back_populates="alerts")
    
    # ─── AJOUTEZ CETTE LIGNE POUR CORRIGER L'ERREUR BACK_POPULATES ───
    user = relationship("User", back_populates="alerts")

    def __repr__(self):
        return f"<Alert(id={self.id}, type={self.type}, status={self.status})>"
