# C:\ProjetElevage\backend\app\schemas\flock.py

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime,date
from enum import Enum
from app.schemas.mortality import MortalityResponse


class FlockBase(BaseModel):
    name: str
    quantity: int = Field(..., alias="quantity")
    cycle: int
    age: Optional[int] = None
    notes: Optional[str] = None
    farm_id: UUID = Field(..., alias="farmId")
    poultry_house_id: UUID = Field(..., alias="poultryHouseId")
    band_id: UUID = Field(..., alias="bandId")
    espece_id: UUID = Field(..., alias="especeId")
    start_date: datetime = Field(..., alias="startDate")

    class Config:
        populate_by_name = True


class FlockCreate(FlockBase):
    pass


class FlockUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = Field(None, alias="quantity")
    cycle: Optional[int] = None
    age: Optional[int] = None
    notes: Optional[str] = None
    poultry_house_id: Optional[UUID] = Field(None, alias="poultryHouseId")
    band_id: Optional[UUID] = Field(None, alias="bandId")
    espece_id: Optional[UUID] = Field(None, alias="especeId")
    start_date: Optional[datetime] = Field(None, alias="startDate")
    status: Optional[str] = None
    average_weight: Optional[float] = Field(None, alias="averageWeight")
    sale_price: Optional[int] = Field(None, alias="salePrice")  # ← Important

    class Config:
        populate_by_name = True


class PoultryHouseSimple(BaseModel):
    """Schéma simplifié pour la salle d'élevage"""
    id: UUID
    name: str
    capacity: int
    current_occupancy: int
    poultry_type: str
    
    class Config:
        from_attributes = True


class BandSimple(BaseModel):
    """Schéma simplifié pour la bande"""
    id: UUID
    name: str
    fournisseur: Optional[str] = None
    prix_unitaire: Optional[float] = None
    
    class Config:
        from_attributes = True


class EspeceSimple(BaseModel):
    """Schéma simplifié pour l'espèce"""
    id: UUID
    name: str
    average_cycle: Optional[int] = None
    
    class Config:
        from_attributes = True

class FlockResponse(BaseModel):
    id: UUID
    name: str
    quantity: int
    cycle: int
    age: Optional[int] = 0
    notes: Optional[str] = None
    start_date: Optional[date] = Field(None, alias="startDate")  # Alias pour camelCase
    end_date: Optional[date] = Field(None, alias="endDate")
    status: str
    farm_id: UUID = Field(..., alias="farmId")
    farm_name: Optional[str] = Field(None, alias="farmName")
    poultry_house_id: UUID = Field(..., alias="poultryHouseId")
    poultry_house_name: Optional[str] = Field(None, alias="poultryHouseName")
    band_id: Optional[UUID] = Field(None, alias="bandId")
    band_name: Optional[str] = Field(None, alias="bandName")
    average_weight: float = Field(0.0, alias="averageWeight")
    mortality: Optional[List] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    current_quantity: Optional[int] = None
    total_mortality: Optional[int] = None
    sale_price: Optional[int] = Field(None, alias="salePrice") 

    class Config:
        from_attributes = True
        populate_by_name = True

