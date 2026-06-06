# backend/app/models/egg_collection.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base

class EggSize(str, enum.Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"

class EggCollection(Base):
    __tablename__ = "egg_collections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flock_id = Column(UUID(as_uuid=True), ForeignKey("flocks.id"), nullable=False)
    egg_count = Column(Integer, nullable=False)
    egg_size = Column(SQLEnum(EggSize), nullable=False, default=EggSize.MEDIUM)
    notes = Column(Text, nullable=True)
    collection_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    flock = relationship("Flock", back_populates="egg_collections")

    def __repr__(self):
        return f"<EggCollection(id={self.id}, flock_id={self.flock_id}, egg_count={self.egg_count})>"