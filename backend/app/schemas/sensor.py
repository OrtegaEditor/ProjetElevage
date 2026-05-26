# app/schemas/sensor.py

from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum

class SensorType(str, Enum):
    temperature = "temperature"
    light = "light"
    ammoniac = "ammoniac"

class SensorStatus(str, Enum):
    online = "online"
    offline = "offline"
    warning = "warning"
    error = "error"


class SensorBase(BaseModel):
    name: str
    type: SensorType
    unit: str
    status: SensorStatus = SensorStatus.online
    min_value: Optional[float] = Field(None, alias="minValue")
    max_value: Optional[float] = Field(None, alias="maxValue")
    calibration_offset: Optional[float] = Field(0.0, alias="calibrationOffset")
    
    # Lien d'identifiant de la salle
    poultry_house_id: UUID = Field(..., alias="poultryHouseId")

    class Config:
        populate_by_name = True


class SensorCreate(SensorBase):
    """
    Champs exacts reçus à la soumission du formulaire SensorFormModal
    """
    pass


class SensorUpdate(SensorBase):
    """
    Champs modifiables pour un capteur (tous optionnels)
    """
    name: Optional[str] = None
    type: Optional[SensorType] = None
    unit: Optional[str] = None
    status: Optional[SensorStatus] = None
    min_value: Optional[float] = Field(None, alias="minValue")
    max_value: Optional[float] = Field(None, alias="maxValue")
    calibration_offset: Optional[float] = Field(None, alias="calibrationOffset")
    poultry_house_id: Optional[UUID] = Field(None, alias="poultryHouseId")


class SensorResponse(SensorBase):
    """
    Structure complète d'un capteur renvoyée au frontend incluant la dernière valeur lue
    """
    id: UUID
    value: float = 0.0
    last_update: datetime = Field(..., alias="lastUpdate")

    class Config:
        from_attributes = True
        populate_by_name = True
