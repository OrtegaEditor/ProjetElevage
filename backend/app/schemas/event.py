# app/schemas/event.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    egg_collection = "egg_collection"
    mortality = "mortality"
    feeding = "feeding"
    weighing = "weighing"
    vaccination = "vaccination"


class EggCollectionCreate(BaseModel):
    """
    Champs exacts envoyés par le formulaire eggCollectionForm
    """
    flock_id: UUID = Field(..., alias="flockId")
    poultry_house_id: UUID = Field(..., alias="poultryHouseId")
    quantity: int = Field(..., alias="quantity")

    class Config:
        populate_by_name = True


class EventResponse(BaseModel):
    """
    Structure de la réponse renvoyée au frontend après l'enregistrement
    """
    id: UUID
    type: EventType
    flock_id: UUID = Field(..., alias="flockId")
    poultry_house_id: UUID = Field(..., alias="poultryHouseId")
    created_by: UUID = Field(..., alias="createdBy")
    created_at: datetime = Field(..., alias="createdAt")
    notes: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
class FeedingCreate(BaseModel):
    """
    Champs exacts capturés par le formulaire feedingForm
    """
    flock_id: UUID = Field(..., alias="flockId")
    feed_type: str = Field(..., alias="feedType")  # Capturé via l'input "Type d'aliment"
    quantity: float = Field(..., alias="quantity")   # Capturé via l'input "Quantité"

    class Config:
        populate_by_name = True

class MortalityCreate(BaseModel):
    """
    Champs exacts capturés par le formulaire MortalityForm
    """
    flock_id: UUID = Field(..., alias="flockId")
    poultry_house_id: UUID = Field(..., alias="poultryHouseId")
    quantity: int = Field(..., alias="quantity") # Nombre de morts
    cause: Optional[str] = None # Cause (optionnel)

    class Config:
        populate_by_name = True