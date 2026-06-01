from sqlalchemy.orm import Session
import secrets
import string
from app.models.farm_member import FarmMember
from app.models.farm import Farm
from fastapi import HTTPException
from uuid import UUID

from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


def register_user(
    db: Session,
    user_data: RegisterRequest,
) -> User:
    """
    Créer un nouvel utilisateur
    """

    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise ValueError("Email déjà utilisé")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        telephone=user_data.telephone,
        hashed_password=hash_password(user_data.password),
        role="admin",
        active=True,
        email_verified=False,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(
    db: Session,
    login_data: LoginRequest,
) -> dict:
    """
    Authentifier un utilisateur et renvoyer ses données complètes
    """

    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user:
        raise ValueError("Identifiants invalides")

    if not user.active:
        raise ValueError("Compte désactivé")

    if not verify_password(
        login_data.password,
        user.hashed_password,
    ):
        raise ValueError("Identifiants invalides")

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
        }
    )

    refresh_token = create_refresh_token(
        data={
            "sub": str(user.id),
            "type": "refresh"
        }
    )

    user.refresh_token = refresh_token
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "telephone": user.telephone,
            "avatar": user.avatar
        }
    }


def refresh_access_token(
    db: Session,
    refresh_token: str,
) -> dict:
    """
    Générer un nouveau access token
    """

    payload = decode_token(refresh_token)

    if not payload:
        raise ValueError("Refresh token invalide")

    if payload.get("type") != "refresh":
        raise ValueError("Token invalide")

    user_id = payload.get("sub")

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise ValueError("Utilisateur introuvable")

    if user.refresh_token != refresh_token:
        raise ValueError("Refresh token expiré")

    new_access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
        }
    )

    return {
        "access_token": new_access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }



def invite_team_member(db: Session, member_data: dict, farm_id: str, current_admin_id: UUID):
    """
    Inviter un collaborateur à une ferme avec validation de sécurité.
    """
    
    # 1. VALIDATION DE SÉCURITÉ : L'admin est-il bien le manager de cette ferme ?
    farm = db.query(Farm).filter(
        Farm.id == UUID(farm_id),
        Farm.manager_id == current_admin_id
    ).first()

    if not farm:
        raise HTTPException(
            status_code=403, 
            detail="Accès refusé : Vous n'êtes pas le manager de cette ferme."
        )

    # 2. GÉNÉRATION DU PASSWORD
    alphabet = string.ascii_letters + string.digits
    generated_password = ''.join(secrets.choice(alphabet) for _ in range(12))
    
    # 3. CRÉATION DE L'UTILISATEUR
    new_member = User(
        name=member_data["name"],
        email=member_data["email"],
        telephone=member_data.get("telephone", ""),
        role=member_data["role"],
        hashed_password=hash_password(generated_password),
        active=True,
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    # 4. CRÉATION DE LA LIAISON (MEMBERSHIP)
    new_membership = FarmMember(
        user_id=new_member.id, 
        farm_id=UUID(farm_id), 
        role=member_data.get("role", "agent")
    )
    db.add(new_membership)
    db.commit()
    
    return new_member, generated_password

def get_collaborators_by_admin(db: Session, admin_id: UUID):
    # 1. On cherche uniquement les fermes dont l'utilisateur connecté EST le manager
    admin_farm_ids = db.query(Farm.id).filter(Farm.manager_id == admin_id).all()
    farm_ids = [f[0] for f in admin_farm_ids]
    
    # 2. Si l'admin ne gère aucune ferme, il ne voit personne
    if not farm_ids:
        return []

    # 3. On retourne uniquement les membres associés à ces fermes spécifiques
    return db.query(User).join(FarmMember).filter(
        FarmMember.farm_id.in_(farm_ids)
    ).distinct().all()