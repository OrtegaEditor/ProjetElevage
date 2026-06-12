# app/models/__init__.py

from app.core.database import Base

# Importation explicite de chacun de vos 21 modèles existants
from app.models.alert import Alert
from app.models.band import Band
from app.models.client import Client
from app.models.disease import Disease
from app.models.espece import Espece
from app.models.event import Event
from app.models.farm import Farm
from app.models.farm_supplier import FarmSupplier
from app.models.flock import Flock
from app.models.poultry_house import PoultryHouse
from app.models.sale import Sale
from app.models.sensor import Sensor
from app.models.sensor_reading import SensorReading
from app.models.stock_item import StockItem
from app.models.stock_movement import StockMovement
from app.models.supplier import Supplier
from app.models.egg_collection import EggCollection
from app.models.task import Task
from app.models.treatment import Treatment
from app.models.user import User
from app.models.vaccination import Vaccination
from app.models.weighing import Weighing
from app.models.farm_member import FarmMember
from app.models.mortality import Mortality
# Exportation centralisée pour les modules externes
__all__ = [
    "Base",
    "Alert",
    "AutomationRule",
    "Band",
    "Client",
    "Disease",
    "Espece",
    "Event",
    "Farm",
    "FarmMember",
    "Flock",
    "PoultryHouse",
    "Sale",
    "Sensor",
    "SensorReading",
    "StockItem",
    "StockMovement",
    "Supplier",
    "Task",
    "Treatment",
    "User",
    "Vaccination",
    "Weighing",
    "Mortality",
]
