# backend/app/schemas/weighing.py
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date
from typing import Optional, List

class WeighingBase(BaseModel):
    average_weight: float = Field(..., alias="averageWeight")
    sample_size: int = Field(1, alias="sampleSize")
    weights: Optional[List[float]] = None
    min_weight: Optional[float] = Field(None, alias="minWeight")
    max_weight: Optional[float] = Field(None, alias="maxWeight")
    std_deviation: Optional[float] = Field(None, alias="stdDeviation")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class WeighingCreate(BaseModel):
    average_weight: float = Field(..., alias="averageWeight")
    sample_size: int = Field(1, alias="sampleSize")
    weights: Optional[List[float]] = None

    class Config:
        populate_by_name = True
        from_attributes = True

class WeighingResponse(WeighingBase):
    id: UUID
    flock_id: UUID
    date: date
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True