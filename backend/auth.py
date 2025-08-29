from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

import crud, models, schemas
from config import settings
from database import get_db

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token-based authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña plana coincide con su hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token de acceso JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """
    Dependencia de FastAPI para obtener el usuario actual a partir del token JWT.
    Valida el token y recupera al usuario de la base de datos.
    """
    print(f"🔐 DEBUG: Received token: {token[:50]}...")  # Log para debug
    print(f"🔐 DEBUG: SECRET_KEY being used: {settings.SECRET_KEY[:20]}...")  # Log para debug
    print(f"🔐 DEBUG: ALGORITHM: {settings.ALGORITHM}")  # Log para debug
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        print(f"🔐 DEBUG: Decoded email: {email}")  # Log para debug
        print(f"🔐 DEBUG: Token payload: {payload}")  # Log para debug
        if email is None:
            print(f"🔐 DEBUG: Email is None in token payload")  # Log para debug
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError as e:
        print(f"🔐 DEBUG: JWT Error: {e}")  # Log para debug
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        print(f"🔐 DEBUG: User not found: {token_data.email}")  # Log para debug
        raise credentials_exception
    
    print(f"🔐 DEBUG: User authenticated: {user.email}")  # Log para debug
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    """
    Dependencia que verifica si el usuario obtenido de `get_current_user` está activo.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user