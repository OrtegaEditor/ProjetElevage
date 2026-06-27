# backend/app/schemas/egg_collection.py
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

class EggSize(str, Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"

class EggCollectionBase(BaseModel):
    egg_count: int = Field(..., alias="eggCount", ge=0)
    egg_size: EggSize = Field(EggSize.MEDIUM, alias="eggSize")
    notes: Optional[str] = None
    collection_date: Optional[datetime] = Field(None, alias="date")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True

class EggCollectionCreate(EggCollectionBase):
    flock_id: Optional[UUID] = Field(None, alias="flockId")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True

class EggCollectionResponse(EggCollectionBase):
    id: UUID
    flock_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
