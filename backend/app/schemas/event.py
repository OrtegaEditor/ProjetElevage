from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum




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
