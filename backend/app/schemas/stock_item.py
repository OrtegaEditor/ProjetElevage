# app/schemas/stock_item.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date
from enum import Enum

class StockCategory(str, Enum):
    feed = "feed"
    vaccine = "vaccine"
    medication = "medication"
    equipment = "equipment"
    other = "other"


class StockItemCreate(BaseModel):
    """
    Champs exacts capturés par RestockingForm pour un consommable
    """
    name: str
    category: StockCategory
    quantity: float
    unit: str
    notes: Optional[str] = None  # Capturé par le Textarea en fin de formulaire
    
    # Identifiants et seuils
    farm_id: UUID = Field(..., alias="farmId")
    min_threshold: float = Field(..., alias="minThreshold")
    
    # Mappages temporels du formulaire
    last_restocked: date = Field(..., alias="restockDate")
    expiry_date: Optional[date] = Field(None, alias="expiryDate")

    class Config:
        populate_by_name = True


class StockItemResponse(BaseModel):
    """
    Structure de retour d'un article en stock
    """
    id: UUID
    name: str
    category: StockCategory
    quantity: float
    unit: str
    min_threshold: float = Field(..., alias="minThreshold")
    farm_id: UUID = Field(..., alias="farmId")
    status: str
    last_restocked: date = Field(..., alias="lastRestocked")
    expiry_date: Optional[date] = Field(None, alias="expiryDate")

    class Config:
        from_attributes = True
        populate_by_name = True
