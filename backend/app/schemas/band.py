# app/schemas/band.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date,datetime

class BandCreate(BaseModel):
    """
    Champs exacts capturés par RestockingForm pour un lot d'animaux (flock)
    """
    name: str
    quantity: int
    notes: Optional[str] = None

    # Identifiants de liaisons
    farm_id: UUID = Field(..., alias="farmId")
    espece_id: UUID = Field(..., alias="especeId")

    # Mappages depuis l'état du formulaire React
    fournisseur: Optional[str] = Field(None, alias="supplier")
    prix_unitaire: Optional[float] = Field(0.0, alias="prixUnitaire")
    created_date: date = Field(..., alias="restockDate")

    class Config:
        populate_by_name = True

class BandResponse(BaseModel):
    id: UUID
    name: str
    farm_id: UUID
    espece_id: UUID
    quantity: int
    created_date: datetime
    fournisseur: Optional[str] = None
    prix_unitaire: Optional[float] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True