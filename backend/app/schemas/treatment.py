# backend/app/schemas/treatment.py
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class TreatmentBase(BaseModel):
    disease_id: Optional[UUID] = Field(None, alias="diseaseId")
    flock_id: UUID = Field(..., alias="flockId")
    veterinarian_id: Optional[UUID] = Field(..., alias="veterinarianId") 
    medication: str
    dosage: Optional[str] = None
    start_date: datetime = Field(..., alias="startDate")
    end_date: datetime = Field(..., alias="endDate")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True

class TreatmentCreate(TreatmentBase):
    pass

class TreatmentUpdate(BaseModel):
    """Schéma pour la mise à jour des traitements"""
    disease_id: Optional[UUID] = Field(None, alias="diseaseId")
    flock_id: Optional[UUID] = Field(None, alias="flockId")
    veterinarian_id: Optional[UUID] = Field(None, alias="veterinarianId") 
    medication: Optional[str] = None
    dosage: Optional[str] = None
    start_date: Optional[datetime] = Field(None, alias="startDate")
    end_date: Optional[datetime] = Field(None, alias="endDate")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True

class TreatmentResponse(TreatmentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True