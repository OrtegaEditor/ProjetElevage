# backend/app/schemas/mortality.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from typing import Optional

class MortalityBase(BaseModel):
    quantity: int
    cause: Optional[str] = None

    class Config:
        from_attributes = True

class MortalityCreate(BaseModel):
    quantity: int
    cause: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class MortalityResponse(BaseModel):
    id: UUID
    flock_id: UUID
    quantity: int
    mortality_date: date
    cause: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True