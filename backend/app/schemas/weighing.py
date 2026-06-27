# backend/app/schemas/weighing.py
from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from datetime import datetime, date
from typing import Optional, List, Any

class WeighingBase(BaseModel):
    average_weight: float
    sample_size: int = 1
    weights: Optional[List[float]] = None
    min_weight: Optional[float] = None
    max_weight: Optional[float] = None
    std_deviation: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class WeighingCreate(BaseModel):
    average_weight: float
    sample_size: int = 1
    weights: Optional[List[float]] = None

    class Config:
        from_attributes = True

class WeighingResponse(BaseModel):
    id: UUID
    flock_id: UUID
    average_weight: float
    sample_size: int
    weights: Optional[List[float]] = None
    min_weight: Optional[float] = None
    max_weight: Optional[float] = None
    std_deviation: Optional[float] = None
    notes: Optional[str] = None
    user_id: Optional[UUID] = None
    date: date
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('weights', mode='before')
    @classmethod
    def parse_weights(cls, v: Any) -> Optional[List[float]]:
        """Convertir le format JSON string en liste Python"""
        if v is None:
            return None
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                import json
                return json.loads(v)
            except:
                return None
        return None

    class Config:
        from_attributes = True