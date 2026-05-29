from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Date, func
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, date
from sqlalchemy.orm import relationship

import uuid
from app.core.database import Base


class Flock(Base):
    """
    Modèle lot de volailles
    
    Un lot appartient à une ferme et une salle
    Un lot peut avoir plusieurs traitements, vaccinations, pesées
    """
    __tablename__ = "flocks"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    band_id = Column(UUID(as_uuid=True), ForeignKey("bands.id"), nullable=True) #   nullable=False si un lot doit obligatoirement avoir une bande

    # Informations de base
    name = Column(String(255), nullable=False)  # Ex: "Lot P2024-03"
    
    # Liens
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    poultry_house_id = Column(UUID(as_uuid=True), ForeignKey("poultry_houses.id"), nullable=False)
    
    # Type de volailles
    poultry_type = Column(String(50), nullable=False)  # broiler, layer, turkey, duck, goose
    
    # Informations du lot
    quantity = Column(Integer, nullable=False)  # Nombre d'animaux
    cycle = Column(Integer, nullable=False)  # Numéro du cycle
    
    # Dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    
    # Statut
    status = Column(String(20), nullable=False, default="active")  # active, closed
    
    # Santé du lot
    average_weight = Column(Float, nullable=True)  # Poids moyen actuel (kg)
    mortality = Column(Float, nullable=True)  # Taux de mortalité (%)
    age = Column(Integer, nullable=True)  # Âge en jours
    
    # Métadonnées
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    # Relations (optionnel)
    farm = relationship("Farm", back_populates="flocks")
    poultry_house = relationship("PoultryHouse", back_populates="flocks")
    treatments = relationship("Treatment", back_populates="flock")
    vaccinations = relationship("Vaccination", back_populates="flock")
    weighings = relationship("Weighing", back_populates="flock")
    events = relationship("Event", back_populates="flock")
    band = relationship("Band", back_populates="flocks")
    sales = relationship("Sale", back_populates="flock", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="flock", cascade="all, delete-orphan")
    def __repr__(self):
        return f"<Flock(id={self.id}, name={self.name}, quantity={self.quantity}, status={self.status})>"