# C:\ProjetElevage\backend\app\services\farm_service.py
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
from typing import List, Optional
from app.models.user import User
from app.models.farm import Farm
from app.models.poultry_house import PoultryHouse
from app.models.flock import Flock
from app.models.farm_member import FarmMember


class FarmService:
    """Service de gestion des fermes avec droits et restrictions"""
    
    @staticmethod
    def get_user_farms(db: Session, user: User) -> List[Farm]:
        """Récupère toutes les fermes accessibles par l'utilisateur"""
        if user.role == "admin":
            # Admin voit toutes les fermes
            return db.query(Farm).filter(Farm.active == True).all()
        
        # Récupérer les fermes où l'utilisateur est manager
        manager_farms = db.query(Farm).filter(
            Farm.manager_id == user.id,
            Farm.active == True
        ).all()
        
        # Récupérer les fermes où l'utilisateur est membre via farm_members
        member_farms = db.query(Farm).join(FarmMember).filter(
            FarmMember.user_id == user.id,
            Farm.active == True
        ).all()
        
        # Combiner et supprimer les doublons
        all_farms = {farm.id: farm for farm in manager_farms + member_farms}
        return list(all_farms.values())
    
    
    @staticmethod
    def get_farm_with_details(db: Session, farm_id: UUID, user: User) -> Optional[Farm]:
        """Récupère une ferme avec ses salles et vérifie les droits"""
        farm = db.query(Farm).filter(Farm.id == farm_id).first()
        
        if not farm:
            return None
        
        # Vérifier les droits d'accès
        if not FarmService.can_access_farm(db, user, farm_id):
            return None
        
        # Charger les salles avec leurs lots
        farm.poultry_houses = db.query(PoultryHouse).filter(
            PoultryHouse.farm_id == farm_id,
            PoultryHouse.active == True
        ).all()
        
        # Charger les lots pour chaque salle
        for house in farm.poultry_houses:
            house.current_flock = db.query(Flock).filter(
                Flock.poultry_house_id == house.id,
                Flock.status == "active"
            ).first()
        
        return farm
    
    @staticmethod
    def can_access_farm(db: Session, user: User, farm_id: UUID) -> bool:
        """Vérifie si l'utilisateur peut accéder à une ferme"""
        if user.role == "admin":
            return True
        
        # Vérifier dans farm_members
        member = db.query(FarmMember).filter(
            FarmMember.user_id == user.id,
            FarmMember.farm_id == farm_id
        ).first()
        
        return member is not None
    
    @staticmethod
    def get_poultry_house_with_flock(db: Session, house_id: UUID, user: User) -> Optional[PoultryHouse]:
        """Récupère une salle avec son lot actif"""
        house = db.query(PoultryHouse).filter(PoultryHouse.id == house_id).first()
        
        if not house:
            return None
        
        # Vérifier l'accès à la ferme
        if not FarmService.can_access_farm(db, user, house.farm_id):
            return None
        
        # Charger le lot actif
        house.current_flock = db.query(Flock).filter(
            Flock.poultry_house_id == house_id,
            Flock.status == "active"
        ).first()
        
        return house