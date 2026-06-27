from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import uuid


class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    disease_id = Column(UUID(as_uuid=True), ForeignKey("diseases.id"), nullable=True)
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    veterinarian_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  
    medication = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relations
    flock = relationship("Flock", back_populates="treatments")
    disease = relationship("Disease", back_populates="treatments", foreign_keys=[disease_id])
    veterinarian = relationship("User", back_populates="treatments")