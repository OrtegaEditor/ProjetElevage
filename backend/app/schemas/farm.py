# app/schemas/farm.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from enum import Enum

class PoultryType(str, Enum):
    broiler = "broiler"
    layer = "layer"
    turkey = "turkey"
    duck = "duck"
    goose = "goose"


class FarmBase(BaseModel):
    name: str
    address: str
    type: List[PoultryType]
    description: str
    active: bool = True
    
    # Gère l'envoi en camelCase depuis le formulaire React
    total_capacity: int = Field(..., alias="totalCapacity")

    class Config:
        # Permet de lire et d'écrire aussi bien en camelCase (frontend) qu'en snake_case (backend)
        populate_by_name = True


class FarmCreate(FarmBase):
    """
    Champs reçus à la soumission du formulaire de création d'une ferme
    """
    pass


class FarmUpdate(FarmBase):
    """
    Champs reçus pour la modification d'une ferme (tous optionnels)
    """
    name: Optional[str] = None
    address: Optional[str] = None
    type: Optional[List[PoultryType]] = None
    description: Optional[str] = None
    total_capacity: Optional[int] = Field(None, alias="totalCapacity")
    active: Optional[bool] = None


class FarmResponse(FarmBase):
    """
    Structure de la réponse renvoyée au frontend
    """
    id: UUID
    created_at: datetime = Field(..., alias="createdAt")
    manager_id: Optional[UUID] = Field(None, alias="managerId")

    class Config:
        from_attributes = True
        populate_by_name = True
