from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Date, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Mortality(Base):
    __tablename__ = "mortalities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    flock_id = Column(
        UUID(as_uuid=True),
        ForeignKey("flocks.id", ondelete="CASCADE"),
        nullable=False
    )

    quantity = Column(Integer, nullable=False)

    mortality_date = Column(Date, nullable=False)

    cause = Column(String(255), nullable=True)

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False
    )

    flock = relationship("Flock", back_populates="mortalities")
    
    