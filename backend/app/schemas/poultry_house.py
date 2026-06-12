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
    farm_id: UUID = Field(..., alias="farmId")

    class Config:
        populate_by_name = True


class PoultryHouseCreate(BaseModel):
    """
    Champs reçus à la soumission du formulaire PoultryHouseForm
    """
    name: str
    description: Optional[str] = None
    farm_id: UUID = Field(..., alias="farmId")
    capacity: int
    poultry_type: str = Field(..., alias="poultryType")
    has_automation: bool = Field(False, alias="hasAutomation")
    current_occupancy: Optional[int] = Field(0, alias="currentOccupancy")  # ← OPTIONNEL

    class Config:
        populate_by_name = True


class PoultryHouseUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    poultry_type: Optional[PoultryType] = Field(None, alias="poultryType")
    has_automation: Optional[bool] = Field(None, alias="hasAutomation")
    farm_id: Optional[UUID] = Field(None, alias="farmId")
    current_occupancy: Optional[int] = Field(None, alias="currentOccupancy")

    class Config:
        populate_by_name = True


class PoultryHouseResponse(PoultryHouseBase):
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