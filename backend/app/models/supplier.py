from sqlalchemy import Column, String, Boolean, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base


class Supplier(Base):
    """
    Modèle Fournisseur (Supplier)
    """
    __tablename__ = "suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=False)
    address = Column(String(500), nullable=True)
    company = Column(String(255), nullable=True)
    
    # Types d'articles fournis (band, feed, vaccine, medication, equipment, other)
    supplied_categories = Column(ARRAY(String), nullable=False)
    
    # Associations manuelles avec les fermes sous forme d'identifiants
    farm_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=False)
    
    notes = Column(String(1000), nullable=True)
    active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Supplier(id={self.id}, name={self.name})>"
