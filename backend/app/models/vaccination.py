from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import uuid


class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vaccine = Column(String, nullable=False)
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id"), nullable=True)
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    veterinarian_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  
    quantity = Column(Integer, nullable=False)
    method = Column(String, nullable=False)
    administration_date = Column(DateTime, nullable=False)
    next_due_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relations
    flock = relationship("Flock", back_populates="vaccinations")
    disease = relationship("Disease", back_populates="vaccinations", foreign_keys=[disease_id])
    veterinarian = relationship("User", back_populates="vaccinations")  