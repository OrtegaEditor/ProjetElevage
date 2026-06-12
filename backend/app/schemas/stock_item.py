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

class FeedSubType(str, Enum):
    starter = "starter"
    grower = "grower"
    finisher = "finisher"

class StockItemCreate(BaseModel):
    """
    Champs exacts capturés par RestockingForm pour un consommable
    """
    name: str
    category: StockCategory
    feed_sub_type: Optional[FeedSubType] = Field(None, alias="feedSubType")
    quantity: float
    unit: str
    notes: Optional[str] = None
    
    # Identifiants et seuils
    supplier_id: Optional[UUID] = Field(None, alias="supplierId")
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
    feed_sub_type: Optional[FeedSubType] = Field(None, alias="feedSubType")  # ← AJOUTER
    quantity: float
    unit: str
    min_threshold: float = Field(..., alias="minThreshold")
    farm_id: UUID = Field(..., alias="farmId")
    supplier_id: Optional[UUID] = Field(None, alias="supplierId")
    status: str
    last_restocked: date = Field(..., alias="lastRestocked")
    expiry_date: Optional[date] = Field(None, alias="expiryDate")
    unit_price: Optional[float] = Field(None, alias="unitPrice")  # ← AJOUTER aussi
    notes: Optional[str] = None  # ← AJOUTER aussi

    class Config:
        from_attributes = True
        populate_by_name = True