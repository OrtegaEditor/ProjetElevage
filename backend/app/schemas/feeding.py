# backend/app/schemas/feeding.py
from pydantic import BaseModel,Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class FeedingBase(BaseModel):
    feed_type: str = Field(..., alias="feedType")
    quantity_kg: float = Field(..., alias="quantityKg")
    date: Optional[datetime] = None

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True

class FeedingCreate(FeedingBase):
    flock_id: Optional[UUID] = Field(None, alias="flockId")

    class Config:
        populate_by_name = True
        allow_population_by_field_name = True

class FeedingResponse(FeedingBase):
    id: UUID
    flock_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True