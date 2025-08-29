"""
Router de autenticación - MIRIESGO v2
Manejo de login, logout y verificación de tokens con base de datos MySQL
"""

import sys
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

# Agregar path para importar database
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../..')

from database import get_db, User, Company, Session as UserSession, AuditLog, UserRole

# ===============================================
# CONFIGURACIÓN
# ===============================================

router = APIRouter()
security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuración JWT
SECRET_KEY = "miriesgo_v2_secret_key_change_in_production_2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas

# ===============================================
# MODELOS PYDANTIC
# ===============================================

from pydantic import BaseModel, EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict

class UserLoginResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    company_id: Optional[int]
    company_name: Optional[str]
    last_login: Optional[datetime]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ===============================================
# FUNCIONES AUXILIARES
# ===============================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    """Cifrar contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crear token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_user_session(db: Session, user_id: int, token: str, request: Request) -> UserSession:
    """Crear sesión de usuario"""
    # Cerrar sesiones anteriores del usuario
    db.query(UserSession).filter(UserSession.user_id == user_id).update({
        "is_active": False
    })
    
    # Crear nueva sesión
    session = UserSession(
        user_id=user_id,
        token_hash=hash_password(token),  # Hash del token para seguridad
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        expires_at=datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        is_active=True,
        created_user=f"user_{user_id}"
    )
    
    db.add(session)
    db.commit()
    return session

def log_auth_action(db: Session, action: str, user_id: int, ip_address: str = None, 
                   success: bool = True, details: str = None):
    """Registrar acción de autenticación"""
    try:
        audit_log = AuditLog(
            user_id=user_id if success else None,
            action=action,
            table_name="authentication",
            record_id=user_id,
            new_values={
                "success": success,
                "ip_address": ip_address,
                "details": details,
                "timestamp": datetime.utcnow().isoformat()
            },
            ip_address=ip_address,
            created_user=f"auth_system"
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        print(f"Error logging auth action: {e}")

# ===============================================
# DEPENDENCIAS
# ===============================================

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), 
                    db: Session = Depends(get_db)) -> dict:
    """Obtener usuario actual desde token JWT"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acceso requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Buscar usuario en base de datos
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar que el usuario esté activo
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inactivo",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar si la cuenta está bloqueada
    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cuenta temporalmente bloqueada",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Retornar datos del usuario
    return {
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "company_id": user.company_id,
        "is_active": user.is_active
    }

# ===============================================
# ENDPOINTS
# ===============================================

@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Endpoint de login con email y contraseña
    """
    try:
        print(f"🔑 Intento de login para: {form_data.username}")
        
        # Buscar usuario por email
        user = db.query(User).filter(User.email == form_data.username).first()
        
        if not user:
            log_auth_action(db, "LOGIN_FAILED", None, request.client.host if request.client else None, 
                          False, "Usuario no encontrado")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verificar que el usuario esté activo
        if not user.is_active:
            log_auth_action(db, "LOGIN_FAILED", user.id, request.client.host if request.client else None, 
                          False, "Usuario inactivo")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Cuenta de usuario inactiva"
            )
        
        # Verificar si la cuenta está bloqueada
        if user.locked_until and user.locked_until > datetime.utcnow():
            log_auth_action(db, "LOGIN_FAILED", user.id, request.client.host if request.client else None, 
                          False, "Cuenta bloqueada")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Cuenta temporalmente bloqueada. Intente más tarde."
            )
        
        # Verificar contraseña
        if not verify_password(form_data.password, user.password_hash):
            # Incrementar intentos fallidos
            user.login_attempts += 1
            
            # Bloquear cuenta después de 5 intentos fallidos
            if user.login_attempts >= 5:
                user.locked_until = datetime.utcnow() + timedelta(minutes=30)
                db.commit()
                log_auth_action(db, "ACCOUNT_LOCKED", user.id, request.client.host if request.client else None, 
                              False, "Demasiados intentos fallidos")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Cuenta bloqueada por demasiados intentos fallidos"
                )
            
            db.commit()
            log_auth_action(db, "LOGIN_FAILED", user.id, request.client.host if request.client else None, 
                          False, "Contraseña incorrecta")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Reset intentos fallidos en login exitoso
        user.login_attempts = 0
        user.locked_until = None
        user.last_login = datetime.utcnow()
        
        # Crear token JWT
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role.value, "user_id": user.id},
            expires_delta=access_token_expires
        )
        
        # Crear sesión de usuario
        create_user_session(db, user.id, access_token, request)
        
        # Obtener información de la empresa si aplica
        company_name = None
        if user.company_id:
            company = db.query(Company).filter(Company.id == user.company_id).first()
            if company:
                company_name = company.name
        
        db.commit()
        
        # Log de login exitoso
        log_auth_action(db, "LOGIN_SUCCESS", user.id, request.client.host if request.client else None, 
                       True, "Login exitoso")
        
        print(f"✅ Login exitoso para: {user.email}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Segundos
            user={
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role.value,
                "company_id": user.company_id,
                "company_name": company_name,
                "last_login": user.last_login.isoformat() if user.last_login else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error en login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@router.post("/logout")
async def logout(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint de logout - cerrar sesión actual
    """
    try:
        # Cerrar todas las sesiones activas del usuario
        db.query(UserSession).filter(
            UserSession.user_id == current_user["user_id"]
        ).update({"is_active": False})
        
        db.commit()
        
        # Log de logout
        log_auth_action(db, "LOGOUT", current_user["user_id"], 
                       request.client.host if request.client else None, True, "Logout exitoso")
        
        print(f"🚪 Logout exitoso para: {current_user['email']}")
        
        return {"message": "Sesión cerrada exitosamente"}
        
    except Exception as e:
        print(f"❌ Error en logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error cerrando sesión"
        )

@router.get("/me", response_model=UserLoginResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener información del usuario actual
    """
    try:
        # Buscar usuario completo
        user = db.query(User).filter(User.id == current_user["user_id"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Obtener información de la empresa
        company_name = None
        if user.company_id:
            company = db.query(Company).filter(Company.id == user.company_id).first()
            if company:
                company_name = company.name
        
        return UserLoginResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role.value,
            company_id=user.company_id,
            company_name=company_name,
            last_login=user.last_login
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo información del usuario"
        )

@router.post("/refresh")
async def refresh_token(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Refrescar token de acceso
    """
    try:
        # Crear nuevo token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": current_user["email"], 
                "role": current_user["role"], 
                "user_id": current_user["user_id"]
            },
            expires_delta=access_token_expires
        )
        
        # Actualizar sesión
        create_user_session(db, current_user["user_id"], access_token, request)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error refrescando token"
        )

@router.get("/sessions")
async def get_user_sessions(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtener sesiones activas del usuario actual
    """
    try:
        sessions = db.query(UserSession).filter(
            UserSession.user_id == current_user["user_id"],
            UserSession.is_active == True,
            UserSession.expires_at > datetime.utcnow()
        ).all()
        
        return {
            "active_sessions": len(sessions),
            "sessions": [
                {
                    "id": session.id,
                    "ip_address": session.ip_address,
                    "user_agent": session.user_agent,
                    "last_activity": session.last_activity,
                    "expires_at": session.expires_at,
                    "created_at": session.created_at
                }
                for session in sessions
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error obteniendo sesiones"
        )