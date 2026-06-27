from pydantic import BaseModel, Field, ConfigDict
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


# =========================
# BASE
# =========================
class FarmBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    address: str
    poultry_types: List[PoultryType]
    description: str
    active: bool = True

    total_capacity: int = Field(..., validation_alias="totalCapacity")


# =========================
# CREATE
# =========================
class FarmCreate(FarmBase):
    pass


# =========================
# UPDATE
# =========================
class FarmUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    address: Optional[str] = None
    poultry_types: Optional[List[PoultryType]] = None
    description: Optional[str] = None
    total_capacity: Optional[int] = Field(
        None, validation_alias="totalCapacity")
    active: Optional[bool] = None


# =========================
# RESPONSE
# =========================
class FarmResponse(FarmBase):
    id: UUID
    created_at: datetime = Field(..., serialization_alias="createdAt")
    manager_id: Optional[UUID] = Field(None, serialization_alias="managerId")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
