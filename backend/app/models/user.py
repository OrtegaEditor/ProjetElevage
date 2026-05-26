from sqlalchemy import Column, String, Boolean, DateTime, ARRAY
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
    password = Column(String(255), nullable=False)  # Hashé avec bcrypt

    # Rôle de l'utilisateur
    role = Column(String(50), nullable=False, default="agent")  # admin, agent, veterinarian, commercial

    # Profil
    avatar = Column(String(255), nullable=True)  # URL de l'avatar
    telephone = Column(String(20), nullable=False)

    # Statut
    active = Column(Boolean, nullable=False, default=True)

    # Métadonnées
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, email={self.email}, role={self.role})>"
