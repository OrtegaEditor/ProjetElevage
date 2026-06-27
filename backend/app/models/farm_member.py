from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.core.database import Base

class FarmMember(Base):
    __tablename__ = "farm_members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    role = Column(String(50), nullable=False)  # admin, agent, veterinarian, commercial
    joined_at = Column(DateTime, nullable=False, default=datetime.utcnow)