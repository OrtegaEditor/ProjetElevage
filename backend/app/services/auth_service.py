from sqlalchemy.orm import Session
import secrets
import string

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


def invite_team_member(db: Session, member_data: dict, farm_id: str):
    """
    Inviter un collaborateur depuis le Dashboard Admin avec mot de passe auto-généré
    """
    alphabet = string.ascii_letters + string.digits
    generated_password = ''.join(secrets.choice(alphabet) for _ in range(12))
    
    new_member = User(
        name=member_data["name"],
        email=member_data["email"],
        telephone=member_data["telephone"],
        role=member_data["role"],
        hashed_password=hash_password(generated_password),
        active=True,
    )
    
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    print(f"Membre invité ! Email: {new_member.email} | Mot de passe généré: {generated_password}")
    
    return new_member, generated_password