import sys
try:
    print("🔄 Chargement de la base de données et des modèles...")
    from app.core.database import Base
    from app.models import Base as ModelsBase
    from sqlalchemy.orm import configure_mappers
    
    # Force SQLAlchemy à valider toutes les relations d'un coup
    configure_mappers()
    print("✅ Félicitations ! Tous les modèles et relations sont valides.")
    
except Exception as e:
    print("\n❌ ERREUR TROUVÉE PAR SQLALCHEMY :")
    print(f"Type d'erreur : {type(e).__name__}")
    print(f"Message : {e}")
    import traceback
    traceback.print_exc()
