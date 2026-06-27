from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.task_service import TaskService
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/v1/tasks", tags=["Tasks"])


@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = Query(None, description="pending, completed"),
    assigned_to: Optional[UUID] = Query(None, description="ID de l'utilisateur assigné"),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les tâches accessibles"""
    tasks = TaskService.get_tasks(
        db=db,
        user=current_user,
        status=status,
        assigned_to=assigned_to,
        limit=limit
    )
    return tasks


@router.get("/my-tasks", response_model=List[TaskResponse])
def get_my_tasks(
    status: Optional[str] = Query(None, description="pending, completed"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les tâches assignées à l'utilisateur connecté"""
    tasks = TaskService.get_user_tasks(db, current_user.id, status)
    return tasks


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer une nouvelle tâche"""
    # Permettre aux agents de créer des tâches (ils les créent pour eux-mêmes)
    if current_user.role not in ["admin", "manager", "agent"]:
        raise HTTPException(status_code=403, detail="Permission refusée")
    
    task = TaskService.create_task(db, data, current_user)
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour une tâche"""
    if current_user.role not in ["admin", "manager", "agent"]:
        raise HTTPException(status_code=403, detail="Permission refusée")
    
    task = TaskService.update_task(db, task_id, data)
    if not task:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return task


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marquer une tâche comme terminée"""
    # Vérifier que l'utilisateur a le droit de compléter cette tâche
    task = TaskService.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    
    # Seul l'assigné ou un admin/manager peut compléter
    if task.assigned_to != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Vous ne pouvez pas compléter cette tâche")
    
    updated_task = TaskService.complete_task(db, task_id)
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer une tâche"""
    task = TaskService.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    
    # Seul l'assigné, l'admin ou le manager peut supprimer
    if task.assigned_to != current_user.id and current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Permission refusée")
    
    deleted = TaskService.delete_task(db, task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return None