# python -m MesModels

import sys
import os

# Ajoute le dossier courant au chemin Python
sys.path.append(os.getcwd())

from sqlalchemy import inspect
from app.core.database import engine  # Assurez-vous que le chemin est correct

def print_models_and_fields():
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if not tables:
            print("Aucune table trouvée. Vérifiez votre chaîne de connexion DATABASE_URL.")
            return

        for table_name in tables:
            print(f"\n--- Modèle : {table_name.upper()} ---")
            columns = inspector.get_columns(table_name)
            for column in columns:
                print(f"  - Champ: {column['name']:<20} | Type: {column['type']}")
    except Exception as e:
        print(f"Erreur lors de l'inspection : {e}")

if __name__ == "__main__":
    print_models_and_fields()