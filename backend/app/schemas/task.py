from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class TaskBase(BaseModel):
    type: str
    title: str
    assigned_to: UUID = Field(..., alias="assignedTo")
    flock_id: UUID = Field(..., alias="flockId")
    poultry_house_id: Optional[UUID] = Field(None, alias="poultryHouseId") 
    time: datetime
    status: str = "pending"

    class Config:
        populate_by_name = True

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    assigned_to: Optional[UUID] = Field(None, alias="assignedTo")
    flock_id: Optional[UUID] = Field(None, alias="flockId")
    poultry_house_id: Optional[UUID] = Field(None, alias="poultryHouseId")
    time: Optional[datetime] = None
    status: Optional[str] = None

    class Config:
        populate_by_name = True

class TaskResponse(TaskBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True