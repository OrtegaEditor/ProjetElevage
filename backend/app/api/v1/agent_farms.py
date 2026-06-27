from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.models.flock import Flock
from app.services.farm_service import FarmService

router = APIRouter(prefix="/api/v1/agent", tags=["Agent"])


@router.get("/my-farms")
def get_my_accessible_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Un agent voit les fermes où il travaille"""
    farms = FarmService.get_user_farms(db, current_user)
    return farms


@router.get("/my-flocks")
def get_my_flocks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Un agent voit tous les lots des fermes où il travaille"""
    farms = FarmService.get_user_farms(db, current_user)
    farm_ids = [farm.id for farm in farms]
    
    flocks = db.query(Flock).filter(Flock.farm_id.in_(farm_ids)).all()
    return flocks