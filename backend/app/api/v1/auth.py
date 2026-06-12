from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.schemas.user import TeamInviteSchema
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    RefreshTokenResponse, # Nouveau schéma nécessaire
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
    Inscription utilisateur et connexion automatique
    """
    print("=== DATA REÇUE ===")
    print(f"name: {data.name}")
    print(f"email: {data.email}")
    print(f"telephone: {data.telephone}")
    print(f"password length: {len(data.password)}")
    
    try:
        if not data.telephone:
            raise ValueError("Téléphone requis")
        
        # Vérifier si email existe déjà
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise ValueError("Email déjà utilisé")

        user = register_user(db, data)
        print(f" Utilisateur créé: {user.id}")
        
        tokens = login_user(
            db,
            LoginRequest(
                email=data.email,
                password=data.password,
            ),
        )
        print(f"Tokens générés")
        
        user_data = {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "telephone": user.telephone,
            "avatar": user.avatar
        }
        
        response_data = {
            **tokens,
            "user": user_data
        }
        print(f" Réponse préparée")
        return response_data
        
    except ValueError as e:
        print(f" Erreur ValueError: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
    except Exception as e:
        print(f" Erreur inattendue: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail=f"Erreur: {str(e)}",
        )
        
        
@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
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

@router.post("/refresh", response_model=RefreshTokenResponse)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Générer un nouvel access token
    """
    try:
        # refresh_access_token doit renvoyer un dict avec access_token et refresh_token
        return refresh_access_token(db, data.refresh_token)
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
    """Invite un collaborateur (admin uniquement)"""
    
    # Vérifier que l'utilisateur est admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Seul un administrateur peut inviter des membres"
        )
    
    # Vérifier que l'admin est bien le manager de la ferme
    farm = db.query(Farm).filter(
        Farm.id == data.farm_id,
        Farm.manager_id == current_user.id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=403,
            detail="Vous n'êtes pas le manager de cette ferme"
        )
    
    # Inviter le membre
    member, password = invite_team_member(db, data.dict(), str(data.farm_id), current_user.id)
    
    # Envoyer l'email en arrière-plan
    background_tasks.add_task(send_real_invite_email, member.email, password)
    
    return {
        "message": "Invitation envoyée avec succès",
        "email": member.email,
        "farm_name": farm.name
    }



# @router.post("/invite")
# def (
#     data: TeamInviteSchema, 
#     background_tasks: BackgroundTasks,
#     db: Session = Depends(get_db), 
#     current_user: User = Depends(get_current_user)
# ):
#     """
#     Inviter un membre d'équipe (Admin uniquement)
#     """
#     if current_user.role != "admin":
#         raise HTTPException(status_code=403, detail="Seul l'administrateur peut inviter des membres.")
    
#     member, password = invite_team_member(db, data.dict(), str(data.farm_id), current_user.id)
    
#     background_tasks.add_task(send_real_invite_email, member.email, password)
    
#     return {"message": "Invitation réussie et email envoyé", "email": member.email}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Récupérer les informations de l'utilisateur connecté
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
        "message": f"A bientôt {current_user.name}!",
        "success": True,
    }