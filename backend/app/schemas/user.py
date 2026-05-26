# app/schemas/user.py

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import UUID
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    agent = "agent"
    veterinaire = "veterinaire"  # Adapté d'après la valeur exacte de l'option du formulaire
    veterinarian = "veterinarian"
    commercial = "commercial"


class InviteCollaboratorCreate(BaseModel):
    """
    Champs exacts envoyés par le formulaire InviteCollaboratorForm
    """
    email: EmailStr
    role: UserRole


class UserResponse(BaseModel):
    """
    Structure de retour sécurisée pour l'affichage d'un collaborateur/utilisateur
    """
    id: UUID
    name: str
    email: EmailStr
    role: UserRole
    telephone: str
    avatar: Optional[str] = None
    active: bool
    farms: List[UUID] = []

    class Config:
        from_attributes = True
