from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://elevage_user:elevage123@localhost:5432/elevage_db"

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Connexion OK :", result.fetchone())
except Exception as e:
    print("Erreur de connexion :", e)