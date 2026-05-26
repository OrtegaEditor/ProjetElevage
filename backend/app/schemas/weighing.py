# app/schemas/weighing.py

from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import date

class WeighingBase(BaseModel):
    # Liste de nombres flottants capturés à la saisie
    weights: List[float]
    notes: Optional[str] = None
    
    # Identifiant du lot (Mappé depuis le camelCase)
    flock_id: UUID = Field(..., alias="flockId")
    
    # Statistiques calculées soumises par le formulaire React
    average_weight: float = Field(..., alias="averageWeight")
    min_weight: float = Field(..., alias="minWeight")
    max_weight: float = Field(..., alias="maxWeight")
    std_deviation: float = Field(..., alias="stdDeviation")

    class Config:
        populate_by_name = True


class WeighingCreate(WeighingBase):
    """
    Champs exacts envoyés à la soumission du formulaire WeighingForm
    """
    pass


class WeighingResponse(WeighingBase):
    """
    Structure complète d'une pesée renvoyée au frontend incluant la date et l'agent
    """
    id: UUID
    date: date
    agent_id: UUID = Field(..., alias="agentId")

    class Config:
        from_attributes = True
        populate_by_name = True
