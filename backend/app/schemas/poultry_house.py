from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from enum import Enum
from datetime import datetime
from app.schemas.farm import PoultryType


class StatusMode(str, Enum):
    auto = "auto"
    manual = "manual"
    off = "off"


class PoultryHouseBase(BaseModel):
    name: str
    capacity: int
    description: Optional[str] = None
    poultry_type: PoultryType = Field(..., alias="poultryType")
    has_automation: bool = Field(..., alias="hasAutomation")
    
    # Liens d'identifiants
    farm_id: UUID = Field(..., alias="farmId")
    
    # Pris en charge par le formulaire, mappé en snake_case
    current_occupancy: int = Field(..., alias="currentOccupancy")

    class Config:
        populate_by_name = True


class PoultryHouseCreate(PoultryHouseBase):
    """
    Champs reçus à la soumission du formulaire PoultryHouseForm
    """
    name: str
    description: str | None = None
    farm_id: UUID
    capacity: int
    current_occupancy: int = 0
    poultry_type: str
    has_automation: bool = False


class PoultryHouseUpdate(PoultryHouseBase):
    """
    Champs modifiables pour une salle d'élevage (tous optionnels)
    """
    name: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    poultry_type: Optional[PoultryType] = Field(None, alias="poultryType")
    has_automation: Optional[bool] = Field(None, alias="hasAutomation")
    farm_id: Optional[UUID] = Field(None, alias="farmId")
    current_occupancy: Optional[int] = Field(None, alias="currentOccupancy")


class PoultryHouseResponse(PoultryHouseBase):
    """
    Structure complète renvoyée au frontend (inclut les status par défaut du modèle)
    """
    id: UUID
    name: str
    description: Optional[str]
    farm_id: UUID
    capacity: int
    current_occupancy: int
    poultry_type: str
    has_automation: bool
    ventilation_status: str
    lighting_status: str
    heating_status: str
    active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True