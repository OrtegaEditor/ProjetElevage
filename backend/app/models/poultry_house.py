from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base


class PoultryHouse(Base):
    """
    Modèle salle d'élevage
    
    Une salle appartient à une ferme
    Une salle contient plusieurs capteurs (Sensor)
    Une salle peut contenir plusieurs lots (Flock)
    """
    __tablename__ = "poultry_houses"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Informations de base
    name = Column(String(255), nullable=False)  # Ex: "Salle A1", "Bâtiment 2"
    description = Column(String(1000), nullable=True)
    
    # Lien vers la ferme
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    
    # Capacité
    capacity = Column(Integer, nullable=False)  # Nombre max d'animaux
    current_occupancy = Column(Integer, nullable=False, default=0)  # Nombre actuel
    
    # Type de volailles dans cette salle
    poultry_type = Column(String(50), nullable=False)  # broiler, layer, turkey, duck, goose
    
    # Automation
    has_automation = Column(Boolean, nullable=False, default=False)
    
    # Statuts des systèmes
    ventilation_status = Column(String(20), nullable=False, default="off")  # auto, manual, off
    lighting_status = Column(String(20), nullable=False, default="off")  # auto, manual, off
    heating_status = Column(String(20), nullable=False, default="off")  # auto, manual, off
    
    # Statut de la salle
    active = Column(Boolean, nullable=False, default=True)  # Salle active ou désaffectée
    
    # Métadonnées
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations (optionnel)
    farm = relationship("Farm", back_populates="poultry_houses")
    sensors = relationship("Sensor", back_populates="poultry_house")
    flocks = relationship("Flock", back_populates="poultry_house")
    
    def __repr__(self):
        return f"<PoultryHouse(id={self.id}, name={self.name}, farm_id={self.farm_id}, capacity={self.capacity})>"