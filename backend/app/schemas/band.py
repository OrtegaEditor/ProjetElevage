# app/schemas/band.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date

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
    """
    Structure de réponse d'une bande créée ou lue
    """
    id: UUID
    name: str
    farm_id: UUID = Field(..., alias="farmId")
    espece_id: UUID = Field(..., alias="especeId")
    quantity: int
    created_date: date = Field(..., alias="createdDate")
    fournisseur: Optional[str] = None
    prix_unitaire: Optional[float] = Field(None, alias="prixUnitaire")
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
