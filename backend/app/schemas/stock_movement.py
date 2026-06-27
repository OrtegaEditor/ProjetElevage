# backend/app/schemas/stock_movement.py
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class StockMovementBase(BaseModel):
    stock_item_id: UUID = Field(..., alias="stockItemId")
    type: str  # entry, exit, adjustment, transfer
    quantity: float
    unit: str
    reference_id: Optional[UUID] = Field(None, alias="referenceId")
    reference_name: Optional[str] = Field(None, alias="referenceName")
    comment: Optional[str] = None
    movement_date: Optional[datetime] = None

    class Config:
        populate_by_name = True

class StockMovementCreate(StockMovementBase):
    pass

class StockMovementResponse(StockMovementBase):
    id: UUID
    operator_id: UUID = Field(..., alias="operatorId")
    operator_name: str = Field(..., alias="operatorName")
    movement_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True