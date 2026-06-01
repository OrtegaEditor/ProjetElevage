# app/schemas/flock.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

class FlockBase(BaseModel):
    name: str
    quantity: int = Field(..., alias="quantity")  # Lié à "Effectif Initial"
    cycle: int                                    # Lié à "Cycle (jours)"
    age: int                                      # Lié à "Age (en jours)"
    notes: Optional[str] = None
    
    # Identifiants de liaisons
    poultry_house_id: UUID = Field(..., alias="poultryHouseId")
    band_id: UUID = Field(..., alias="bandId")
    espece_id: UUID = Field(..., alias="especeId")
    
    # Gestion de la date au format ISO
    start_date: datetime = Field(..., alias="startDate")

    class Config:
        populate_by_name = True


class FlockCreate(FlockBase):
    """
    Champs exacts reçus à la création du lot depuis le formulaire FlocksForm
    """
    pass


class FlockUpdate(FlockBase):
    """
    Champs modifiables lors de l'édition d'un lot (tous optionnels)
    """
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


class FlockResponse(FlockBase):
    """
    Structure complète renvoyée au frontend incluant les compteurs calculés du modèle
    """
    id: UUID
    farm_id: UUID = Field(..., alias="farmId")
    status: str  # active, closed
    average_weight: float = Field(..., alias="averageWeight")
    mortality: int
    end_date: Optional[datetime] = Field(None, alias="endDate")

    class Config:
        from_attributes = True
        populate_by_name = True
