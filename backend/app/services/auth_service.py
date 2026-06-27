from sqlalchemy.orm import Session
import secrets
import string
from typing import Tuple
from app.models.farm_member import FarmMember
from app.models.farm import Farm
from fastapi import HTTPException
from uuid import UUID

from app.models.user import User
from app.models.farm import Farm
from app.models.farm_member import FarmMember

from app.core.security import hash_password
from app.schemas.auth import ( RegisterRequest, LoginRequest,)
from app.core.security import (hash_password,verify_password,create_access_token,create_refresh_token,decode_token,)


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

def invite_team_member(db: Session,member_data: dict,farm_id: str,current_admin_id: UUID) -> Tuple[User, str]:
    """
    Invite un collaborateur à une ferme
    
    Args:
        db: Session de base de données
        member_data: Dictionnaire contenant les clés: name, email, telephone, role
        farm_id: ID de la ferme (au format string)
        current_admin_id: ID de l'admin qui invite
    
    Returns:
        Tuple[User, str]: (L'utilisateur créé, Le mot de passe généré)
    
    Raises:
        HTTPException: Si l'admin n'est pas manager de la ferme
        HTTPException: Si l'email existe déjà
    """
    
    # 1. Valider que l'admin est bien le manager de cette ferme
    try:
        farm_uuid = UUID(farm_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="ID de ferme invalide"
        )
    
    farm = db.query(Farm).filter(
        Farm.id == farm_uuid,
        Farm.manager_id == current_admin_id
    ).first()
    
    if not farm:
        raise HTTPException(
            status_code=403,
            detail="Accès refusé: Vous n'êtes pas le manager de cette ferme"
        )
    
    # 2. Vérifier si l'email existe déjà
    existing_user = db.query(User).filter(User.email == member_data["email"]).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail=f"L'email {member_data['email']} est déjà utilisé"
        )
    
    # 3. Générer un mot de passe sécurisé
    alphabet = string.ascii_letters + string.digits
    generated_password = ''.join(secrets.choice(alphabet) for _ in range(12))
    
    # 4. Créer l'utilisateur
    new_member = User(
        name=member_data["name"],
        email=member_data["email"],
        telephone=member_data.get("telephone", ""),
        role=member_data["role"],
        hashed_password=hash_password(generated_password),
        active=True,
    )
    db.add(new_member)
    db.flush()  # Pour obtenir l'ID sans commit
    
    # 5. Créer la liaison (membership) dans farm_members
    new_membership = FarmMember(
        user_id=new_member.id,
        farm_id=farm_uuid,
        role=member_data["role"]
    )
    db.add(new_membership)
    
    # 6. Commit la transaction
    db.commit()
    db.refresh(new_member)
    
    return new_member, generated_password


def get_collaborators_by_admin(db: Session, admin_id: UUID):
    """Récupère tous les collaborateurs + l'admin lui-même (y compris les désactivés)"""
    
    # Récupérer les fermes de l'admin
    admin_farms = db.query(Farm).filter(Farm.manager_id == admin_id).all()
    farm_ids = [farm.id for farm in admin_farms]
    
    # Récupérer l'admin lui-même
    admin_user = db.query(User).filter(User.id == admin_id).first()
    
    if not farm_ids:
        # Si pas de fermes, retourner seulement l'admin
        return [admin_user] if admin_user else []
    
    from app.models.farm_member import FarmMember
    
    # SUPPRIMER LE FILTRE User.active == True pour avoir TOUS les utilisateurs
    collaborators = db.query(User).join(FarmMember).filter(
        FarmMember.farm_id.in_(farm_ids)
    ).distinct().all()
    
    # Ajouter l'admin s'il n'est pas déjà dans la liste
    if admin_user and admin_user not in collaborators:
        collaborators.insert(0, admin_user)
    
    return collaborators