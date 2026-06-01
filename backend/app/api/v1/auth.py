from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import TeamInviteSchema
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
    invite_team_member,
)
from app.services.email_service import send_real_invite_email

router = APIRouter(prefix="/auth", tags=["Auth"])


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


@router.post("/login", response_model=TokenResponse)
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


@router.post("/refresh", response_model=TokenResponse)
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
def invite_user(
    data: TeamInviteSchema, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Inviter un membre d'équipe (Admin uniquement)
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul l'administrateur peut inviter des membres.")
    
    # Correction de l'ID de ferme et conversion explicite en chaîne
    member, password = invite_team_member(db, data.dict(), str(data.farm_id),current_user.id)
    
    # Envoi de l'email en tâche de fond
    background_tasks.add_task(send_real_invite_email, member.email, password)
    
    return {"message": "Invitation réussie et email envoyé", "email": member.email}


@router.get("/me")
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
def logout(current_user: User = Depends(get_current_user)):
    """Se déconnecter"""
    return {
        "message": f"A bientot {current_user.name}!",
        "success": True,
    }