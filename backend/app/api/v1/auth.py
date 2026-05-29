# app/api/v1/auth.py

from fastapi import APIRouter, Depends, HTTPException,status
from sqlalchemy.orm import Session

from app.services.auth_service import invite_team_member
from app.core.security import get_current_user
from app.schemas.user import TeamInviteSchema
from app.models.user import User

from app.core.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
)
from app.services.auth_service import (
    register_user,
    login_user,
    refresh_access_token,
)

router = APIRouter(prefix="/auth",    tags=["Auth"],)


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Inscription utilisateur
    """

    try:
        if not data.telephone:
            raise ValueError("Téléphone requis")

        user = register_user(db, data)
        print(user.id)

        tokens = login_user(
            db,
            LoginRequest(
                email=data.email,
                password=data.password,
            ),
        )
        return tokens
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Connexion utilisateur
    """

    try:
        return login_user(db, data)

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )


@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh_token(
    data: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Générer un nouvel access token
    """

    try:
        return refresh_access_token(
            db,
            data.refresh_token,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )

@router.post("/invite")
def invite_user(data: TeamInviteSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Sécurité : Seul un admin peut inviter
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul l'administrateur peut inviter des membres.")
    member, password = invite_team_member(db, data.dict(), current_user.farm_id)
    return {"message": "Invitation réussie", "email": member.email, "temporary_password": password}

router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Récupérer les informations de l'utilisateur connecté via son token JWT
    """
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "telephone": current_user.telephone,
        "avatar": current_user.avatar
    }


@router.post("/logout")
def logout(current_user = Depends(get_current_user)):
    """Se déconnecter"""
    return {
        "message": f"A bientot {current_user.name}!",
        "success": True,
    }