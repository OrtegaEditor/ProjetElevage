from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import List, Optional
from datetime import datetime

from app.models.task import Task
from app.models.user import User
from app.models.farm_member import FarmMember
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    
    @staticmethod
    def get_accessible_farm_ids(user: User, db: Session) -> set:
        """Récupère les IDs des fermes accessibles par l'utilisateur"""
        from app.models.farm import Farm
        
        farm_ids = set()
        
        # Fermes où l'utilisateur est manager
        manager_farms = db.query(Farm).filter(Farm.manager_id == user.id).all()
        for farm in manager_farms:
            farm_ids.add(farm.id)
        
        # Fermes où l'utilisateur est membre via farm_members
        memberships = db.query(FarmMember).filter(FarmMember.user_id == user.id).all()
        for membership in memberships:
            farm_ids.add(membership.farm_id)
        
        return farm_ids
    
    @staticmethod
    def get_tasks(
        db: Session,
        user: User,
        status: Optional[str] = None,
        assigned_to: Optional[UUID] = None,
        limit: int = 100
    ) -> List[Task]:
        """Récupère les tâches accessibles par l'utilisateur"""
        from app.models.flock import Flock
        from app.models.farm import Farm
        
        query = db.query(Task)
        
        if user.role == "admin":
            if assigned_to:
                query = query.filter(Task.assigned_to == assigned_to)
        else:
            farm_ids = TaskService.get_accessible_farm_ids(user, db)
            
            if not farm_ids:
                return []
            
            flocks = db.query(Flock.id).filter(Flock.farm_id.in_(farm_ids)).all()
            flock_ids = [f[0] for f in flocks]
            
            if not flock_ids:
                return []
            
            query = query.filter(Task.flock_id.in_(flock_ids))
            
            if assigned_to:
                query = query.filter(Task.assigned_to == assigned_to)
        
        if status:
            query = query.filter(Task.status == status)
        
        return query.order_by(Task.time.asc()).limit(limit).all()
    
    @staticmethod
    def get_user_tasks(db: Session, user_id: UUID, status: Optional[str] = None) -> List[Task]:
        """Récupère les tâches assignées à un utilisateur spécifique"""
        query = db.query(Task).filter(Task.assigned_to == user_id)
        if status:
            query = query.filter(Task.status == status)
        return query.order_by(Task.time.asc()).all()
    
    @staticmethod
    def get_task_by_id(db: Session, task_id: UUID) -> Optional[Task]:
        """Récupère une tâche par son ID"""
        return db.query(Task).filter(Task.id == task_id).first()
    
    @staticmethod
    def create_task(db: Session, data: TaskCreate, current_user: User) -> Task:
        """Crée une nouvelle tâche"""
        new_task = Task(
            type=data.type,
            title=data.title,
            assigned_to=data.assigned_to,
            flock_id=data.flock_id,
            poultry_house_id=data.poultry_house_id,
            time=data.time,
            status=data.status
        )
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        return new_task
    
    @staticmethod
    def update_task(db: Session, task_id: UUID, data: TaskUpdate) -> Optional[Task]:
        """Met à jour une tâche"""
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(task, key, value)
        
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def complete_task(db: Session, task_id: UUID) -> Optional[Task]:
        """Marque une tâche comme terminée"""
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            return None
        task.status = "completed"
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def delete_task(db: Session, task_id: UUID) -> bool:
        """Supprime une tâche"""
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            return False
        db.delete(task)
        db.commit()
        return True