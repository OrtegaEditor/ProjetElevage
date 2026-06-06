# backend/app/models/flock.py
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Date, Boolean, Text,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
from app.core.database import Base

class Flock(Base):
    __tablename__ = "flocks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    band_id = Column(UUID(as_uuid=True), ForeignKey("bands.id"), nullable=True)
    name = Column(String(255), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    poultry_house_id = Column(UUID(as_uuid=True), ForeignKey("poultry_houses.id"), nullable=False)
    poultry_type = Column(String(50), nullable=False)
    quantity = Column(Integer, nullable=False)
    cycle = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String(20), nullable=False, default="active")
    average_weight = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    sale_price = Column(Integer, nullable=True)
    
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    espece_id = Column(UUID(as_uuid=True), ForeignKey("especes.id"), nullable=True)
    # Nouvelles colonnes pour la division de lot
    parent_flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=True)
    is_quarantine = Column(Boolean, default=False)
    
    # Relations
    farm = relationship("Farm", back_populates="flocks")
    poultry_house = relationship("PoultryHouse", back_populates="flocks")
    treatments = relationship("Treatment", back_populates="flock")
    vaccinations = relationship("Vaccination", back_populates="flock")
    weighings = relationship("Weighing", back_populates="flock")
    events = relationship("Event", back_populates="flock")
    band = relationship("Band", back_populates="flocks")
    sales = relationship("Sale", back_populates="flock", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="flock", cascade="all, delete-orphan")
    mortalities = relationship("Mortality", back_populates="flock", cascade="all, delete-orphan")
    egg_collections = relationship("EggCollection", back_populates="flock", cascade="all, delete-orphan")
    
    # Nouvelle relation pour l'alimentation
    feeding_records = relationship("FeedingRecord", back_populates="flock", cascade="all, delete-orphan")
    
    # Relation parent-enfant pour la division
    parent_flock = relationship("Flock", remote_side=[id], backref="child_flocks")
    
    def __repr__(self):
        return f"<Flock(id={self.id}, name={self.name}, quantity={self.quantity}, status={self.status})>"