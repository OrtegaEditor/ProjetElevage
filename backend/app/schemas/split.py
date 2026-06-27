# backend/app/schemas/split.py
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class SplitFlockRequest(BaseModel):
    quantity: int
    new_flock_name: str
    is_quarantine: bool = True
    reason: Optional[str] = None

class SplitFlockResponse(BaseModel):
    message: str
    original_flock: dict
    new_flock: dict