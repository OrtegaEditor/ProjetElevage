# app/schemas/treatment.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import date

class TreatmentBase(BaseModel):
    medication: str
    dosage: str
    notes: Optional[str] = None
    
    # Liens d'identifiants (Mappés depuis le camelCase du formulaire React)
    flock_id: UUID = Field(..., alias="flockId")
    disease_id: UUID = Field(..., alias="diseaseId")
    
    # Pris en charge par le formulaire, mappé en snake_case
    animals_count: int = Field(..., alias="animalsCount")
    
    # Dates de traitement au format date simple
    start_date: date = Field(..., alias="startDate")
    end_date: date = Field(..., alias="endDate")

    class Config:
        populate_by_name = True


class TreatmentCreate(TreatmentBase):
    """
    Champs exacts envoyés à la soumission du formulaire TreatmentForm
    """
    pass


class TreatmentUpdate(TreatmentBase):
    """
    Champs éditables pour la modification d'un traitement (tous optionnels)
    """
    medication: Optional[str] = None
    dosage: Optional[str] = None
    notes: Optional[str] = None
    flock_id: Optional[UUID] = Field(None, alias="flockId")
    disease_id: Optional[UUID] = Field(None, alias="diseaseId")
    animals_count: Optional[int] = Field(None, alias="animalsCount")
    start_date: Optional[date] = Field(None, alias="startDate")
    end_date: Optional[date] = Field(None, alias="endDate")


class TreatmentResponse(TreatmentBase):
    """
    Structure complète d'un soin médical renvoyée au frontend incluant le vétérinaire référent
    """
    id: UUID
    veterinarian_id: UUID = Field(..., alias="veterinarianId")

    class Config:
        from_attributes = True
        populate_by_name = True
