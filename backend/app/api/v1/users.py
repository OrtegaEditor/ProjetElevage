from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile, Request
from sqlalchemy.orm import Session
from uuid import UUID
import os
import shutil
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.user import get_user_by_id, update_user_profile, deactivate_user, toggle_user_active
from app.schemas.user import UserResponse, UpdateUserRequest, TeamInviteSchema, UserProfileResponse
from app.models.user import User
from app.models.farm import Farm
from app.services.auth_service import invite_team_member, get_collaborators_by_admin
from app.services.email_service import send_real_invite_email
from app.schemas.farm import FarmResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

# Configuration avatar (décidée par moi comme demandé)
UPLOAD_DIR = "static/avatars"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
BASE_URL = "/static/avatars"


def get_avatar_url(filename: str, request: Request) -> str:
    """Génère l'URL complète pour l'avatar"""
    return f"{BASE_URL}/{filename}"


@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Upload l'avatar de l'utilisateur connecté"""
    
    # 1. Vérifier l'extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extension non autorisée. Utilisez: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 2. Vérifier la taille
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Fichier trop volumineux. Maximum {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # 3. Créer le dossier
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # 4. Sauvegarder le fichier
    filename = f"{current_user.id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Erreur sauvegarde avatar: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la sauvegarde")
    
    # 5. Mettre à jour l'URL en BD
    avatar_url = get_avatar_url(filename, request)
    current_user.avatar = avatar_url
    db.commit()
    
    return {"url": avatar_url, "message": "Avatar mis à jour avec succès"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Récupère l'utilisateur connecté"""
    return current_user


@router.get("/me/farms-managed")
def get_my_managed_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les fermes où l'utilisateur est manager (Farm.manager_id)"""
    farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
    return farms

@router.get("/my-farms")  # sans response_model
def get_my_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les fermes où l'utilisateur est manager"""
    farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
    
    result = []
    for farm in farms:
        # Convertir poultry_types
        poultry_types = []
        if farm.poultry_types:
            if isinstance(farm.poultry_types, str):
                if farm.poultry_types.startswith('{'):
                    cleaned = farm.poultry_types.strip('{}')
                    poultry_types = cleaned.split(',') if cleaned else []
                else:
                    poultry_types = [farm.poultry_types]
            else:
                poultry_types = farm.poultry_types
        
        result.append({
            "id": str(farm.id),
            "name": farm.name,
            "address": farm.address,
            "description": farm.description,
            "poultry_types": poultry_types,
            "manager_id": str(farm.manager_id) if farm.manager_id else None,
            "totalCapacity": farm.total_capacity,
            "active": farm.active,
            "createdAt": farm.created_at.isoformat() if farm.created_at else None,
            "updatedAt": farm.updated_at.isoformat() if farm.updated_at else None,
        })
    
    return result



@router.get("/collaborators", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Liste les collaborateurs de l'admin (membres de ses fermes)"""
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, 
            detail="Accès réservé aux administrateurs"
        )
    
    collaborators = get_collaborators_by_admin(db, current_user.id)
    return collaborators


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Récupère un utilisateur spécifique"""
    
    # Un utilisateur non-admin ne peut voir que lui-même
    if current_user.role != "admin" and str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    # Un admin ne peut voir que lui-même ou ses collaborateurs
    if current_user.role == "admin" and str(current_user.id) != str(user_id):
        collaborators = get_collaborators_by_admin(db, current_user.id)
        collaborator_ids = [str(c.id) for c in collaborators]
        if str(user_id) not in collaborator_ids:
            raise HTTPException(status_code=403, detail="Cet utilisateur n'est pas votre collaborateur")
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return user



@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    data: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Met à jour un utilisateur"""
    
    # Un utilisateur non-admin ne peut modifier que lui-même
    if current_user.role != "admin" and str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    # Un admin ne peut modifier que lui-même ou ses collaborateurs
    if current_user.role == "admin" and str(current_user.id) != str(user_id):
        collaborators = get_collaborators_by_admin(db, current_user.id)
        collaborator_ids = [str(c.id) for c in collaborators]
        if str(user_id) not in collaborator_ids:
            raise HTTPException(status_code=403, detail="Cet utilisateur n'est pas votre collaborateur")
    
    # Récupérer l'utilisateur cible
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Un admin ne peut PAS modifier un autre admin (même ses collaborateurs)
    if target_user.role == "admin" and current_user.role == "admin" and str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas modifier un autre administrateur")
    
    request_data = data.dict(exclude_unset=True)
    updated_fields = {}
    
    # Champs que tout le monde peut modifier
    for field in ["name", "telephone", "avatar"]:
        if field in request_data:
            updated_fields[field] = request_data[field]
    
    # Champs réservés à l'admin (et seulement si la cible n'est pas admin)
    if current_user.role == "admin" and target_user.role != "admin":
        for field in ["role"]:
            if field in request_data:
                updated_fields[field] = request_data[field]
    
    # L'admin ne peut pas désactiver quelqu'un via cette route (utiliser toggle-status)
    if "active" in request_data:
        raise HTTPException(
            status_code=400,
            detail="Utilisez la route /{user_id}/toggle-status pour modifier le statut actif/inactif"
        )
    
    try:
        return update_user_profile(db, user_id, **updated_fields)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{user_id}/toggle-status", response_model=UserResponse)
def toggle_user_status(
    user_id: UUID, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Active/Désactive un utilisateur (admin uniquement)"""
    
    # Seul un admin peut modifier le statut
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Action réservée aux administrateurs")
    
    # Un admin ne peut pas se désactiver lui-même
    if str(current_user.id) == str(user_id):
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous désactiver vous-même")
    
    # Vérifier que l'utilisateur cible est un collaborateur
    collaborators = get_collaborators_by_admin(db, current_user.id)
    collaborator_ids = [str(c.id) for c in collaborators]
    if str(user_id) not in collaborator_ids:
        raise HTTPException(status_code=403, detail="Cet utilisateur n'est pas votre collaborateur")
    
    # Récupérer l'utilisateur cible
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Un admin ne peut pas désactiver un autre admin
    if target_user.role == "admin":
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas désactiver un autre administrateur")
    
    try:
        return toggle_user_active(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{user_id}", response_model=dict)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Désactive un utilisateur (soft delete) - Admin uniquement"""
    
    # Seul un admin peut désactiver
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Action réservée aux administrateurs")
    
    # Un admin ne peut pas se désactiver lui-même
    if str(current_user.id) == str(user_id):
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous désactiver vous-même")
    
    # Vérifier que l'utilisateur cible est un collaborateur
    collaborators = get_collaborators_by_admin(db, current_user.id)
    collaborator_ids = [str(c.id) for c in collaborators]
    if str(user_id) not in collaborator_ids:
        raise HTTPException(status_code=403, detail="Cet utilisateur n'est pas votre collaborateur")
    
    # Récupérer l'utilisateur cible
    target_user = get_user_by_id(db, user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Un admin ne peut pas désactiver un autre admin
    if target_user.role == "admin":
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas désactiver un autre administrateur")
    
    try:
        deactivate_user(db, user_id)
        return {"message": "Utilisateur désactivé avec succès"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{user_id}/profile", response_model=UserProfileResponse)
def get_user_profile(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère le profil complet d'un utilisateur avec ses fermes"""
    
    # Mêmes règles d'accès que get_user
    if current_user.role != "admin" and str(current_user.id) != str(user_id):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    if current_user.role == "admin" and str(current_user.id) != str(user_id):
        collaborators = get_collaborators_by_admin(db, current_user.id)
        collaborator_ids = [str(c.id) for c in collaborators]
        if str(user_id) not in collaborator_ids:
            raise HTTPException(status_code=403, detail="Cet utilisateur n'est pas votre collaborateur")
    
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Récupérer les fermes où l'utilisateur est membre via farm_members
    farms = db.query(Farm).join(Farm.members).filter(Farm.members.any(id=user.id)).all()
    
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        telephone=user.telephone,
        role=user.role,
        active=user.active,
        farms=[FarmResponse.model_validate(farm) for farm in farms]
    )

