from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Créer l'application FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="API pour gestion d'exploitation avicole",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurer CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes de santé
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

# Les routes spécifiques seront importées ici
# from app.api.v1 import auth, users, farms, etc.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )