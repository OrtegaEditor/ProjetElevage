from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.espece_service import EspeceService
from app.schemas.espece import (
    EspeceCreate,
    EspeceUpdate,
    EspeceResponse,
    EspeceListResponse
)

router = APIRouter(prefix="/api/v1/especes", tags=["Espèces"])


# ============ GET ALL ============
@router.get("/", response_model=EspeceListResponse)
def get_especes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None, description="Recherche par nom"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer la liste des espèces de volailles
    - Accessible à tous les utilisateurs authentifiés
    """
    items, total = EspeceService.get_all(
        db=db,
        skip=skip,
        limit=limit,
        search=search
    )
    
    return EspeceListResponse(
        items=items,
        total=total,
        skip=skip,
        limit=limit
    )


# ============ GET BY ID ============
@router.get("/{espece_id}", response_model=EspeceResponse)
def get_espece(
    espece_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupérer une espèce par son ID
    """
    espece = EspeceService.get_by_id(db, espece_id)
    if not espece:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espèce non trouvée"
        )
    return espece


# ============ CREATE ============
@router.post("/", response_model=EspeceResponse, status_code=status.HTTP_201_CREATED)
def create_espece(
    data: EspeceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Créer une nouvelle espèce
    - Réservé aux administrateurs et vétérinaires
    """
    if current_user.role not in ["admin", "veterinarian"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs et vétérinaires peuvent créer des espèces"
        )
    
    # Vérifier si une espèce avec ce nom existe déjà
    existing = EspeceService.get_by_name(db, data.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Une espèce avec le nom '{data.name}' existe déjà"
        )
    
    return EspeceService.create(db, data)


# ============ UPDATE ============
@router.put("/{espece_id}", response_model=EspeceResponse)
def update_espece(
    espece_id: UUID,
    data: EspeceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Mettre à jour une espèce
    - Réservé aux administrateurs et vétérinaires
    """
    if current_user.role not in ["admin", "veterinarian"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs et vétérinaires peuvent modifier des espèces"
        )
    
    espece = EspeceService.update(db, espece_id, data)
    if not espece:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espèce non trouvée"
        )
    return espece


# ============ DELETE ============
@router.delete("/{espece_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_espece(
    espece_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Supprimer une espèce
    - Réservé aux administrateurs uniquement
    - Ne peut pas supprimer une espèce utilisée par des bandes
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs peuvent supprimer des espèces"
        )
    
    deleted = EspeceService.delete(db, espece_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espèce non trouvée ou utilisée par des bandes"
        )
    return None