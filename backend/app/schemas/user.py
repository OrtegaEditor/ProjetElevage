# C:\ProjetElevage\backend\app\schemas\user.py

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import UUID
from enum import Enum
from datetime import datetime
from typing import Literal
from app.schemas.farm import FarmResponse



# ============ ENUMS ============

class UserRole(str, Enum):
    admin = "admin"
    agent = "agent"
    veterinarian = "veterinarian"
    commercial = "commercial"


# ============ SCHEMAS DE REQUÊTE (INPUT) ============

class UserRegister(BaseModel):
    """Schéma pour l'inscription"""
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=255)
    telephone: str = Field(..., min_length=10, max_length=20)
    
    class Config:
        examples = [{
            "name": "Herve kouam",
            "email": "herve@example.com",
            "password": "SecurePassword123!",
            "telephone": "+33612345678"
        }]


class UserLogin(BaseModel):
    """Schéma pour la connexion"""
    email: EmailStr
    password: str


class ChangePassword(BaseModel):
    """Schéma pour changer le password"""
    old_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str


class RefreshTokenRequest(BaseModel):
    """Requête pour rafraîchir le token"""
    refresh_token: str


class InviteCollaboratorCreate(BaseModel):
    """
    Inviter un collaborateur (existant dans le schéma original)
    """
    email: EmailStr
    role: UserRole


# ============ SCHEMAS DE RÉPONSE (OUTPUT) ============

class UserResponse(BaseModel):
    """Réponse utilisateur (compatible avec l'original)"""
    id: UUID
    name: str
    email: EmailStr
    role: UserRole
    telephone: str
    avatar: Optional[str] = None
    active: bool
    farms: List[UUID] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    """Infos de base d'un utilisateur"""
    id: UUID
    name: str
    email: str
    telephone: str
    role: UserRole
    avatar: Optional[str] = None
    active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Réponse de connexion avec tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class PasswordChangeResponse(BaseModel):
    """Réponse après changement de password"""
    message: str
    success: bool


class LogoutResponse(BaseModel):
    """Réponse de déconnexion"""
    message: str
    success: bool

class TeamInviteSchema(BaseModel):
    name: str
    email: EmailStr
    telephone: str
    role: Literal["agent", "veterinarian", "commercial"]
    farm_id: UUID

    class Config:
        from_attributes = True

class UpdateUserRequest(BaseModel):
    name: Optional[str] = None
    telephone: Optional[str] = None
    avatar: Optional[str] = None
    role: Optional[UserRole] = None
    active: Optional[bool] = None
    

class UserProfileResponse(BaseModel):
    id: UUID
    name: str
    email: str
    telephone: str
    role: str
    active: bool
    farms: List[FarmResponse] = [] # Liste d'objets complets

    class Config:
        from_attributes = True