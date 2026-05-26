# app/schemas/auth.py

from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    """
    Champs exacts envoyés par le formulaire LoginPage
    """
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """
    Champs exacts envoyés par le formulaire RegisterPage
    """
    name: str
    email: EmailStr
    telephone: str
    password: str


class TokenResponse(BaseModel):
    """
    Structure de la réponse renvoyée au frontend après une connexion ou inscription réussie
    """
    access_token: str
    token_type: str = "bearer"
