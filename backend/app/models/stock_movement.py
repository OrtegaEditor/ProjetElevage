from sqlalchemy import Column, String, Float, DateTime, ForeignKey,func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class StockMovement(Base):
    """
    Modèle Mouvement de Stock (StockMovement)
    
    Enregistre l'historique de chaque entrée, sortie ou ajustement de stock.
    Ce modèle utilise une clé primaire composite (id, date) pour être 
    parfaitement compatible avec le partitionnement par défaut de TimescaleDB.
    """
    __tablename__ = "stock_movements"

    # Clé primaire composite obligatoire pour TimescaleDB
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(DateTime, primary_key=True, nullable=False,   server_default=func.now())
    
    # Liens et informations de l'article
    stock_item_id = Column(UUID(as_uuid=True), ForeignKey("stock_items.id"), nullable=False)
    stock_item_name = Column(String(255), nullable=False) # Pour affichage rapide historique
    
    # Détails du mouvement
    type = Column(String(50), nullable=False)  # entry, exit, adjustment, transfer
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)   # Ex: kg, l, doses
    
    # Références contextuelles optionnelles
    reference_id = Column(UUID(as_uuid=True), nullable=True)   # ID de la salle, du lot ou du fournisseur
    reference_name = Column(String(255), nullable=True)       # Ex: "Salle A1", "Fournisseur Sanders"
    
    # Utilisateur ayant réalisé l'action
    operator = Column(String(255), nullable=False)
    comment = Column(String(1000), nullable=True)

    # Relations
    stock_item = relationship("StockItem", back_populates="movements")

    def __repr__(self):
        return f"<StockMovement(id={self.id}, type={self.type}, quantity={self.quantity}, date={self.date})>"
    