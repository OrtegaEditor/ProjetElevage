from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.crud.user import get_user_by_id, get_all_users, update_user_profile, deactivate_user, toggle_user_active
from app.schemas.user import UserResponse, UpdateUserRequest, TeamInviteSchema
from app.models.user import User
from app.models.farm import Farm
from app.services.auth_service import invite_team_member, get_collaborators_by_admin
from app.services.email_service import send_real_invite_email

router = APIRouter(prefix="/api/v1/users", tags=["Users"])


from fastapi import APIRouter, File, UploadFile, Depends
import shutil
import os

@router.post("/upload-avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Définir le chemin de stockage
    upload_dir = "static/avatars"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = f"{upload_dir}/{current_user.id}.jpg"
    
    # 2. Sauvegarder le fichier
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 3. Mettre à jour l'URL en BD
    avatar_url = f"http://127.0.0.1:8000/{file_path}"
    current_user.avatar = avatar_url
    db.commit()
    
    return {"url": avatar_url}

# 1. ROUTES STATIQUES (Ordre spécifique pour éviter les conflits)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Route pour récupérer l'utilisateur connecté."""
    return current_user

@router.get("/my-farms")
def get_my_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farms = db.query(Farm).filter(Farm.manager_id == current_user.id).all()
    return farms

@router.post("/invite")
def invite_member(
    data: TeamInviteSchema, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Seul l'admin peut inviter.")
        
    member, password = invite_team_member(db, data.dict(), str(data.farm_id))
    background_tasks.add_task(send_real_invite_email, member.email, password)
    return {"message": "Invitation réussie et email envoyé", "email": member.email}

@router.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    collaborators = get_collaborators_by_admin(db, current_user.id)
    return collaborators

# 2. ROUTES DYNAMIQUES (Contenant des paramètres)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if str(current_user.id) != str(user_id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    data: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.id) != str(user_id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")

    request_data = data.dict(exclude_unset=True)
    updated_fields = {}

    for field in ["name", "telephone", "avatar"]:
        if field in request_data:
            updated_fields[field] = request_data[field]

    if current_user.role == "admin":
        for field in ["role", "active"]:
            if field in request_data:
                updated_fields[field] = request_data[field]

    try:
        return update_user_profile(db, user_id, **updated_fields)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{user_id}/toggle-status", response_model=UserResponse)
def toggle_user_status(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    try:
        return toggle_user_active(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    