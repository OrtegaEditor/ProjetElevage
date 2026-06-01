# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth,users

# Créer l'application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="API pour gestion d'exploitation avicole",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuration sécurisée et explicite des CORS pour éliminer les blocages du navigateur
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3333",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3333",  # Autorise explicitement votre port Frontend actuel
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Utilise la liste explicite pour contourner le bug du .env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ INCLURE LES ROUTERS ============

# Ajout du préfixe global '/api/v1' requis par l'instance Axios du Frontend

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router)

# ============ ROUTES DE SANTÉ ============

@app.get("/health")
def health_check():
    """Endpoint pour vérifier que l'API est en ligne"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }

@app.get("/")
def root():
    """Endpoint racine"""
    return {
        "message": f"Bienvenue sur {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
