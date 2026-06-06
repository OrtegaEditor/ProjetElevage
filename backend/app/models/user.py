from sqlalchemy import Column, String, Boolean, DateTime,func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base


class User(Base):
    """
    Modèle utilisateur

    Un utilisateur peut avoir plusieurs fermes (farms)
    """
    __tablename__ = "users"

    # Identifiant unique
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Informations de base
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    refresh_token = Column(String, nullable=True)
    last_login = Column(DateTime, nullable=True)
    # Rôle de l'utilisateur
    role = Column(String(50), nullable=False, default="agent")  # admin, agent, veterinarian, commercial
    # Profil
    avatar = Column(String(255), nullable=True)  # URL de l'avatar
    telephone = Column(String(20), nullable=False)

    # Statut
    active = Column(Boolean, nullable=False, default=True)

    # Métadonnées
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow,server_default=func.now(), onupdate=func.now())
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    sales = relationship("Sale", back_populates="user", cascade="all, delete-orphan")
    treatments = relationship("Treatment", back_populates="user", cascade="all, delete-orphan")
    vaccinations = relationship("Vaccination", back_populates="veterinarian", cascade="all, delete-orphan")
    weighings = relationship("Weighing", back_populates="user", cascade="all, delete-orphan")
    managed_farms = relationship(
        "Farm", 
        secondary="farm_members", 
        back_populates="members",
        primaryjoin="and_(User.id == FarmMember.user_id, FarmMember.role.in_(['admin', 'manager']))"
    )
    
    accessible_farms = relationship(
        "Farm", 
        secondary="farm_members", 
        back_populates="members",
        viewonly=True
    )
    
    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, email={self.email}, role={self.role})>"
