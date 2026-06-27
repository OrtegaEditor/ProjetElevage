# backend/app/schemas/supplier.py
from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from enum import Enum

class SupplierCategory(str, Enum):
    feed = "feed"
    vaccine = "vaccine"
    medication = "medication"
    equipment = "equipment"
    other = "other"

class SupplierBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    address: Optional[str] = None
    company: Optional[str] = None
    supplied_categories: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    active: bool = True

class SupplierCreate(SupplierBase):
    farm_ids: List[UUID] = Field(default_factory=list)

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    supplied_categories: Optional[List[str]] = None
    notes: Optional[str] = None
    active: Optional[bool] = None
    farm_ids: Optional[List[UUID]] = None

class SupplierResponse(SupplierBase):
    id: UUID
    farm_ids: List[UUID] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True