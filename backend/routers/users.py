"""
Router para gestión de usuarios - MIRIESGO v2
Operaciones CRUD completas con base de datos MySQL
"""

import sys
import os
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from passlib.context import CryptContext

# Agregar path para importar database
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../..')

from database import get_db, User, Company, Session as UserSession, AuditLog, UserRole
from .auth import get_current_user

# ===============================================
# CONFIGURACIÓN
# ===============================================

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ===============================================
# MODELOS PYDANTIC PARA REQUESTS/RESPONSES
# ===============================================

from pydantic import BaseModel, EmailStr, validator
from typing import Union

class UserCreateRequest(BaseModel):
    full_name: str
    national_identifier: str
    email: EmailStr
    phone: str
    password: str
    role: str = "analyst"
    company_id: Optional[int] = None

    @validator('role')
    def validate_role(cls, v):
        if v not in ['admin', 'manager', 'analyst']:
            raise ValueError('Rol inválido')
        return v

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[int] = None
    is_active: Optional[bool] = None

    @validator('role')
    def validate_role(cls, v):
        if v and v not in ['admin', 'manager', 'analyst']:
            raise ValueError('Rol inválido')
        return v

class UserResponse(BaseModel):
    id: int
    full_name: str
    national_identifier: str
    email: str
    phone: str
    role: str
    company_id: Optional[int]
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UsersListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    pages: int

# ===============================================
# FUNCIONES AUXILIARES
# ===============================================

def hash_password(password: str) -> str:
    """Cifrar contraseña"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)

def log_user_action(db: Session, action: str, user_id: int, performed_by: str, 
                   old_values=None, new_values=None, record_id=None):
    """Registrar acción en logs de auditoría"""
    try:
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            table_name="users",
            record_id=record_id or user_id,
            old_values=old_values,
            new_values=new_values,
            created_user=performed_by
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        print(f"Error logging action: {e}")

# ===============================================
# ENDPOINTS
# ===============================================

@router.get("/", response_model=UsersListResponse)
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    role_filter: Optional[str] = Query(None),
    company_filter: Optional[int] = Query(None),
    active_only: bool = Query(True)
):
    """
    Obtener lista de usuarios con filtros y paginación
    Solo admins pueden ver todos los usuarios
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para ver usuarios"
            )

        # Construir query base
        query = db.query(User)
        
        # Aplicar filtros
        if active_only:
            query = query.filter(User.is_active == True)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.full_name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.national_identifier.ilike(search_term)
                )
            )
        
        if role_filter:
            query = query.filter(User.role == UserRole(role_filter))
            
        if company_filter:
            query = query.filter(User.company_id == company_filter)

        # Contar total
        total = query.count()
        
        # Aplicar paginación
        offset = (page - 1) * size
        users = query.offset(offset).limit(size).all()
        
        # Calcular páginas
        pages = (total + size - 1) // size

        return UsersListResponse(
            users=[UserResponse.from_orm(user) for user in users],
            total=total,
            page=page,
            pages=pages
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo usuarios: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener usuario por ID
    """
    try:
        # Solo admins pueden ver cualquier usuario, otros solo pueden verse a sí mismos
        if current_user.get("role") != "admin" and current_user.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para ver este usuario"
            )

        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        return UserResponse.from_orm(user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo usuario: {str(e)}"
        )

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Crear nuevo usuario
    Solo admins pueden crear usuarios
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para crear usuarios"
            )

        # Verificar que no exista usuario con mismo email o cédula
        existing_user = db.query(User).filter(
            or_(
                User.email == user_data.email,
                User.national_identifier == user_data.national_identifier
            )
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un usuario con ese email o cédula"
            )

        # Validar empresa si no es admin
        if user_data.role != "admin":
            if not user_data.company_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Los usuarios no-admin deben tener una empresa asignada"
                )
            
            company = db.query(Company).filter(Company.id == user_data.company_id).first()
            if not company:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Empresa no encontrada"
                )

        # Crear usuario
        hashed_password = hash_password(user_data.password)
        
        new_user = User(
            full_name=user_data.full_name,
            national_identifier=user_data.national_identifier,
            email=user_data.email,
            phone=user_data.phone,
            password_hash=hashed_password,
            role=UserRole(user_data.role),
            company_id=user_data.company_id if user_data.role != "admin" else None,
            created_user=current_user.get("email", "system")
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Log de auditoría
        log_user_action(
            db, "CREATE_USER", new_user.id, 
            current_user.get("email", "system"),
            new_values={"full_name": new_user.full_name, "role": user_data.role},
            record_id=new_user.id
        )

        return UserResponse.from_orm(new_user)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creando usuario: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Actualizar usuario existente
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para actualizar usuarios"
            )

        # Buscar usuario
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        # Guardar valores anteriores para auditoría
        old_values = {
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role.value,
            "company_id": user.company_id,
            "is_active": user.is_active
        }

        # Actualizar campos
        update_data = user_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if field == "role" and value:
                setattr(user, field, UserRole(value))
            elif field == "company_id" and value:
                # Verificar que la empresa existe
                company = db.query(Company).filter(Company.id == value).first()
                if not company:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Empresa no encontrada"
                    )
                setattr(user, field, value)
            elif value is not None:
                setattr(user, field, value)

        user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user)

        # Log de auditoría
        new_values = {
            "full_name": user.full_name,
            "phone": user.phone,
            "role": user.role.value,
            "company_id": user.company_id,
            "is_active": user.is_active
        }
        
        log_user_action(
            db, "UPDATE_USER", user.id,
            current_user.get("email", "system"),
            old_values=old_values,
            new_values=new_values
        )

        return UserResponse.from_orm(user)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error actualizando usuario: {str(e)}"
        )

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Eliminar usuario (soft delete)
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para eliminar usuarios"
            )

        # No permitir auto-eliminación
        if current_user.get("user_id") == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puede eliminar su propio usuario"
            )

        # Buscar usuario
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        # Soft delete
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        # Cerrar todas las sesiones del usuario
        db.query(UserSession).filter(UserSession.user_id == user_id).update({
            "is_active": False
        })
        
        db.commit()

        # Log de auditoría
        log_user_action(
            db, "DELETE_USER", user.id,
            current_user.get("email", "system"),
            old_values={"is_active": True},
            new_values={"is_active": False}
        )

        return {"message": "Usuario eliminado exitosamente"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando usuario: {str(e)}"
        )

@router.get("/{user_id}/sessions")
async def get_user_sessions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener sesiones activas de un usuario
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin" and current_user.get("user_id") != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para ver estas sesiones"
            )

        sessions = db.query(UserSession).filter(
            and_(
                UserSession.user_id == user_id,
                UserSession.is_active == True,
                UserSession.expires_at > datetime.utcnow()
            )
        ).all()

        return {
            "user_id": user_id,
            "active_sessions": len(sessions),
            "sessions": [
                {
                    "id": session.id,
                    "ip_address": session.ip_address,
                    "last_activity": session.last_activity,
                    "expires_at": session.expires_at,
                    "created_at": session.created_at
                }
                for session in sessions
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo sesiones: {str(e)}"
        )

@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Resetear contraseña de usuario
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para resetear contraseñas"
            )

        # Buscar usuario
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )

        # Actualizar contraseña
        user.password_hash = hash_password(new_password)
        user.updated_at = datetime.utcnow()
        
        # Cerrar todas las sesiones del usuario
        db.query(UserSession).filter(UserSession.user_id == user_id).update({
            "is_active": False
        })
        
        db.commit()

        # Log de auditoría
        log_user_action(
            db, "RESET_PASSWORD", user.id,
            current_user.get("email", "system")
        )

        return {"message": "Contraseña actualizada exitosamente"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reseteando contraseña: {str(e)}"
        )