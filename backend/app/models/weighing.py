# backend/app/models/weighing.py
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Date, Boolean, Text,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid
from app.core.database import Base
from sqlalchemy.dialects.postgresql import ARRAY

class Weighing(Base):
    __tablename__ = "weighings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    average_weight = Column(Float, nullable=False)
    sample_size = Column(Integer, nullable=False, default=1)
    weights = Column(Text, nullable=True)
    min_weight = Column(Float, nullable=True)
    max_weight = Column(Float, nullable=True)
    std_deviation = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    flock = relationship("Flock", back_populates="weighings")
    # Ajouter cette ligne si vous voulez la relation user
    user = relationship("User", foreign_keys=[user_id])