# app/schemas/vaccination.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date
from enum import Enum

class VaccinationMethod(str, Enum):
    drinking_water = "drinking_water"
    injection = "injection"
    spray = "spray"
    eye_drop = "eye_drop"


class VaccinationBase(BaseModel):
    vaccine: str
    quantity: int
    method: VaccinationMethod
    notes: Optional[str] = None
    
    # Liens d'identifiants (Mappés depuis le camelCase du formulaire React)
    flock_id: UUID = Field(..., alias="flockId")
    disease_id: UUID = Field(..., alias="diseaseId")
    
    # Dates de suivi au format date simple (Mappées depuis le camelCase)
    administration_date: date = Field(..., alias="administrationDate")
    next_due_date: Optional[date] = Field(None, alias="nextDueDate")

    class Config:
        populate_by_name = True


class VaccinationCreate(VaccinationBase):
    """
    Champs exacts envoyés à la soumission du formulaire VaccinationForm
    """
    pass


class VaccinationUpdate(VaccinationBase):
    """
    Champs éditables pour la modification d'une vaccination (tous optionnels)
    """
    vaccine: Optional[str] = None
    quantity: Optional[int] = None
    method: Optional[VaccinationMethod] = None
    notes: Optional[str] = None
    flock_id: Optional[UUID] = Field(None, alias="flockId")
    disease_id: Optional[UUID] = Field(None, alias="diseaseId")
    administration_date: Optional[date] = Field(None, alias="administrationDate")
    next_due_date: Optional[date] = Field(None, alias="nextDueDate")


class VaccinationResponse(VaccinationBase):
    """
    Structure complète d'une vaccination renvoyée au frontend incluant le vétérinaire référent
    """
    id: UUID
    veterinarian_id: UUID = Field(..., alias="veterinarianId")

    class Config:
        from_attributes = True
        populate_by_name = True
