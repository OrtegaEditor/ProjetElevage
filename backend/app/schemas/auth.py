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

class RefreshTokenRequest(BaseModel):
    """
    Payload utilisé pour refresh un access token
    """

    refresh_token: str|None


class UserResponse(BaseModel):
    """
    Schéma de réponse pour les données utilisateur
    """

    id: str
    name: str
    email: EmailStr
    role: str
    telephone: str
    avatar :str|None



class TokenResponse(BaseModel):
    """
    Réponse JWT envoyée au frontend
    """ 
 
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenResponse(BaseModel):
    """
    Réponse spécifique pour le refresh (sans l'objet user complet)
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"