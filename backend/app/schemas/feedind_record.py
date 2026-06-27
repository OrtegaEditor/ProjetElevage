from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime

class FeedingBase(BaseModel):
    feed_type: str
    quantity_kg: float
    stock_item_id: UUID = Field(..., alias="stockItemId") 

class FeedingCreate(FeedingBase):
    pass

class FeedingResponse(FeedingBase):
    id: UUID
    flock_id: UUID
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True