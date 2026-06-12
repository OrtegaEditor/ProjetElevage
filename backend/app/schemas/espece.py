from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

# ============ BASE ============
class EspeceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Nom de l'espèce (broiler, layer, turkey, etc.)")
    average_cycle: int = Field(..., gt=0, description="Durée moyenne du cycle en jours")

# ============ CREATE ============
class EspeceCreate(EspeceBase):
    pass

# ============ UPDATE ============
class EspeceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    average_cycle: Optional[int] = Field(None, gt=0)

# ============ RESPONSE ============
class EspeceResponse(EspeceBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============ LISTE AVEC PAGINATION ============
class EspeceListResponse(BaseModel):
    items: list[EspeceResponse]
    total: int
    skip: int
    limit: int