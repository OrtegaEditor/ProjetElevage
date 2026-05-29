from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Float, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base


class Sensor(Base):
    """
    Modèle capteur IoT
    
    Un capteur appartient à une salle (PoultryHouse)
    Un capteur génère plusieurs mesures (SensorReading) stockées dans TimescaleDB
    """
    __tablename__ = "sensors"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Informations de base
    name = Column(String(255), nullable=False)  # Ex: "Capteur température 1"
    type = Column(String(50), nullable=False)  # temperature, light, ammoniac
    
    # Lien vers la salle
    poultry_house_id = Column(UUID(as_uuid=True), ForeignKey("poultry_houses.id"), nullable=False)
    
    # Configuration
    unit = Column(String(20), nullable=False)  # °C, %, ppm, lux, etc.
    calibration_offset = Column(Float, nullable=True, default=0.0)  # Décalage de calibrage
    
    # Limites (pour les alertes)
    min_value = Column(Float, nullable=True)  # Valeur min acceptable
    max_value = Column(Float, nullable=True)  # Valeur max acceptable
    
    # Statut actuel
    status = Column(String(20), nullable=False, default="online")  # online, offline, warning, error
    
    # Dernière valeur reçue (cache pour requêtes rapides)
    value = Column(Float, nullable=True)
    last_update = Column(DateTime, nullable=True)
    
    # Métadonnées
    created_at = Column(DateTime, nullable=False,  server_default=func.now())
    updated_at = Column(DateTime, nullable=False,  server_default=func.now(), onupdate=datetime.utcnow)
    
    # Relations (optionnel)
    poultry_house = relationship("PoultryHouse", back_populates="sensors")
    readings = relationship("SensorReading", back_populates="sensor")
    
    def __repr__(self):
        return f"<Sensor(id={self.id}, name={self.name}, type={self.type}, status={self.status})>"