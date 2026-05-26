# app/schemas/task.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

class TaskType(str, Enum):
    feeding = "feeding"
    weighing = "weighing"
    ventilation = "ventilation"
    mortality = "mortality"
    egg_collection = "egg_collection"
    cleaning = "cleaning"
    vaccination = "vaccination"

class TaskStatus(str, Enum):
    pending = "pending"
    completed = "completed"


class TaskBase(BaseModel):
    title: str
    type: TaskType
    
    # Liens d'identifiants (Mappés depuis le camelCase du formulaire React)
    flock_id: UUID = Field(..., alias="flockId")
    poultry_house_id: UUID = Field(..., alias="poultryHouseId")
    
    # Date et heure d'exécution
    time: datetime

    class Config:
        populate_by_name = True


class TaskCreate(TaskBase):
    """
    Champs exacts envoyés à la soumission du formulaire TaskPlanningForm
    """
    pass


class TaskUpdate(TaskBase):
    """
    Champs éditables d'une tâche planifiée (tous optionnels)
    """
    title: Optional[str] = None
    type: Optional[TaskType] = None
    flock_id: Optional[UUID] = Field(None, alias="flockId")
    poultry_house_id: Optional[UUID] = Field(None, alias="poultryHouseId")
    time: Optional[datetime] = None
    status: Optional[TaskStatus] = None


class TaskResponse(TaskBase):
    """
    Structure complète d'une tâche renvoyée au frontend
    """
    id: UUID
    status: TaskStatus = TaskStatus.pending

    class Config:
        from_attributes = True
        populate_by_name = True
