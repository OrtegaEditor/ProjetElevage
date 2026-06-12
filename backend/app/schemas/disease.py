from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# ============ BASE ============
class DiseaseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Nom de la maladie")
    type: str = Field(..., description="Type: viral, bacterial, parasitic, nutritional")
    symptoms: Optional[List[str]] = Field(None, description="Liste des symptômes")
    severity: str = Field(..., description="Sévérité: low, medium, high")
    description: Optional[str] = Field(None, max_length=1000, description="Description détaillée")

# ============ CREATE ============
class DiseaseCreate(DiseaseBase):
    pass

# ============ UPDATE ============
class DiseaseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = None
    symptoms: Optional[List[str]] = None
    severity: Optional[str] = None
    description: Optional[str] = None

# ============ RESPONSE ============
class DiseaseResponse(DiseaseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============ LISTE AVEC PAGINATION ============
class DiseaseListResponse(BaseModel):
    items: List[DiseaseResponse]
    total: int
    skip: int
    limit: int