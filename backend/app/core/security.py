from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# Configuration du hashing des passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hasher un password en utilisant bcrypt
    
    Args:
        password: Le password en clair
        
    Returns:
        Le password hashé
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifier qu'un password en clair correspond au hash
    
    Args:
        plain_password: Le password en clair
        hashed_password: Le password hashé
        
    Returns:
        True si le password est correct, False sinon
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Créer un JWT access token
    
    Args:
        data: Les données à encoder dans le token (ex: {"sub": "user_id"})
        expires_delta: Durée de validité du token (optionnel)
        
    Returns:
        Le JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Créer un JWT refresh token (durée de vie plus longue)
    
    Args:
        data: Les données à encoder
        
    Returns:
        Le JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    Décoder un JWT token et vérifier sa validité
    
    Args:
        token: Le JWT token
        
    Returns:
        Les données du token si valide, None sinon
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        return None