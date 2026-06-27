# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Configuration de l'application (Unified Pydantic v2)"""

    # Application
    APP_NAME: str = "SYCGEA"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Configuration des Emails
    EMAIL_SENDER: str
    EMAIL_APP_PASSWORD: str

    # Database
    DATABASE_URL: str = "postgresql://elevage_user:elevage123@localhost:5432/elevage_db"
    DATABASE_ECHO: bool = True

    # JWT & Security
    SECRET_KEY: str = ""
    JWT_SECRET_KEY: str  # Aligné sur les variables requises du .env
    ALGORITHM: str = "HS256"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:9000",
    ]

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Logging
    LOG_LEVEL: str = "INFO"

    # Configuration centralisée Pydantic v2
    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True,
        extra="ignore"  # Filtre et ignore silencieusement les variables Front-end (VITE_...)
    )

# Instance globale des paramètres
settings = Settings()