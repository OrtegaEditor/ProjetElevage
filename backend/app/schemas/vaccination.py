# backend/app/schemas/vaccination.py
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class VaccinationBase(BaseModel):
    vaccine: str
    disease_id: Optional[UUID] = Field(None, alias="diseaseId")
    flock_id: UUID = Field(..., alias="flockId")
    quantity: int
    method: str
    administration_date: datetime = Field(..., alias="administrationDate")
    next_due_date: Optional[datetime] = Field(None, alias="nextDueDate")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True

class VaccinationCreate(VaccinationBase):
    pass

class VaccinationUpdate(BaseModel):
    """Schéma pour la mise à jour des vaccinations"""
    vaccine: Optional[str] = None
    disease_id: Optional[UUID] = Field(None, alias="diseaseId")
    flock_id: Optional[UUID] = Field(None, alias="flockId")
    quantity: Optional[int] = None
    method: Optional[str] = None
    administration_date: Optional[datetime] = Field(None, alias="administrationDate")
    next_due_date: Optional[datetime] = Field(None, alias="nextDueDate")
    notes: Optional[str] = None

    class Config:
        populate_by_name = True

class VaccinationResponse(VaccinationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True