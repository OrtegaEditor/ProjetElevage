# C:\ProjetElevage\backend\app\crud\user.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.schemas.user import UserRegister
from uuid import UUID
from typing import Optional


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Récupérer un utilisateur par email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: UUID) -> Optional[User]:
    """Récupérer un utilisateur par ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    """Récupérer tous les utilisateurs (avec pagination)"""
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user_data: UserRegister) -> User:
    """
    Créer un nouvel utilisateur
    
    - Hash le password
    - Crée l'utilisateur dans la DB
    """
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise ValueError(f"L'email {user_data.email} est déjà utilisé")
    
    hashed_password = hash_password(user_data.password)
    
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password,
        telephone=user_data.telephone,
        role="agent",
        active=True,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authentifier un utilisateur
    """
    user = get_user_by_email(db, email)
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    if not user.active:
        raise ValueError("Le compte est désactivé")
    
    return user


def update_password(db: Session, user_id: UUID, old_password: str, new_password: str) -> User:
    """
    Changer le password d'un utilisateur
    """
    user = get_user_by_id(db, user_id)
    
    if not user:
        raise ValueError("Utilisateur non trouvé")
    
    if not verify_password(old_password, user.hashed_password):
        raise ValueError("Ancien password incorrect")
    
    if verify_password(new_password, user.hashed_password):
        raise ValueError("Le nouveau password doit être différent de l'ancien")
    
    user.hashed_password = hash_password(new_password)
    db.commit()
    db.refresh(user)
    
    return user


def activate_user(db: Session, user_id: UUID) -> User:
    """Activer un utilisateur"""
    user = get_user_by_id(db, user_id)
    
    if not user:
        raise ValueError("Utilisateur non trouvé")
    
    user.active = True
    db.commit()
    db.refresh(user)
    
    return user


def deactivate_user(db: Session, user_id: UUID) -> User:
    """Désactiver un utilisateur"""
    user = get_user_by_id(db, user_id)
    
    if not user:
        raise ValueError("Utilisateur non trouvé")
    
    user.active = False
    db.commit()
    db.refresh(user)
    
    return user


def update_user_profile(db: Session, user_id: UUID, **kwargs) -> User:
    """Mettre à jour le profil d'un utilisateur"""
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("Utilisateur non trouvé")

    # Ajout de "active" dans la liste blanche
    allowed_fields = ["name", "telephone", "avatar", "role", "farm_id", "active"]

    for field in allowed_fields:
        if field in kwargs:
            setattr(user, field, kwargs[field])

    db.commit()
    db.refresh(user)
    return user


def count_users(db: Session) -> int:
    """Compter le nombre d'utilisateurs"""
    return db.query(func.count(User.id)).scalar()

def toggle_user_active(db: Session, user_id: UUID) -> User:
    """Bascule l'état actif/inactif d'un utilisateur"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise ValueError("Utilisateur non trouvé")
    
    user.active = not user.active
    db.commit()
    db.refresh(user)
    return user