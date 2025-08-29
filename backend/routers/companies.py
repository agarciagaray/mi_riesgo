"""
Router para gestión de empresas - MIRIESGO v2
Operaciones CRUD completas con base de datos MySQL
"""

import sys
import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

# Agregar path para importar database
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../..')

from database import get_db, Company, User, CompanyStatus, AuditLog
from .auth import get_current_user

# ===============================================
# CONFIGURACIÓN
# ===============================================

router = APIRouter()
security = HTTPBearer()

# ===============================================
# MODELOS PYDANTIC PARA REQUESTS/RESPONSES
# ===============================================

from pydantic import BaseModel, validator
from typing import Union

class CompanyCreateRequest(BaseModel):
    name: str
    nit: str
    code: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None

class CompanyUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        if v and v not in ['active', 'inactive', 'suspended']:
            raise ValueError('Estado inválido')
        return v

class CompanyResponse(BaseModel):
    id: int
    name: str
    nit: str
    code: str
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    website: Optional[str]
    industry: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CompaniesListResponse(BaseModel):
    companies: List[CompanyResponse]
    total: int
    page: int
    pages: int

# ===============================================
# FUNCIONES AUXILIARES
# ===============================================

def log_company_action(db: Session, action: str, company_id: int, performed_by: str, 
                      old_values=None, new_values=None):
    """Registrar acción en logs de auditoría"""
    try:
        audit_log = AuditLog(
            action=action,
            table_name="companies",
            record_id=company_id,
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

@router.get("/", response_model=CompaniesListResponse)
async def get_all_companies(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    active_only: bool = Query(True)
):
    """
    Obtener lista de empresas con filtros y paginación
    Solo admins pueden ver todas las empresas
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para ver empresas"
            )

        # Construir query base
        query = db.query(Company)
        
        # Aplicar filtros
        if active_only:
            query = query.filter(Company.status == CompanyStatus.active)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Company.name.ilike(search_term),
                    Company.nit.ilike(search_term),
                    Company.code.ilike(search_term)
                )
            )
        
        if status_filter:
            query = query.filter(Company.status == CompanyStatus(status_filter))

        # Contar total
        total = query.count()
        
        # Aplicar paginación
        offset = (page - 1) * size
        companies = query.offset(offset).limit(size).all()
        
        # Calcular páginas
        pages = (total + size - 1) // size

        return CompaniesListResponse(
            companies=[CompanyResponse.from_orm(company) for company in companies],
            total=total,
            page=page,
            pages=pages
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo empresas: {str(e)}"
        )

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company_by_id(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener empresa por ID
    """
    try:
        # Verificar permisos
        user_role = current_user.get("role")
        user_company_id = current_user.get("company_id")
        
        if user_role != "admin" and user_company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para ver esta empresa"
            )

        company = db.query(Company).filter(Company.id == company_id).first()
        
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa no encontrada"
            )

        return CompanyResponse.from_orm(company)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo empresa: {str(e)}"
        )

@router.post("/", response_model=CompanyResponse)
async def create_company(
    company_data: CompanyCreateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Crear nueva empresa
    Solo admins pueden crear empresas
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para crear empresas"
            )

        # Verificar que no exista empresa con mismo NIT o código
        existing_company = db.query(Company).filter(
            or_(
                Company.nit == company_data.nit,
                Company.code == company_data.code
            )
        ).first()
        
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una empresa con ese NIT o código"
            )

        # Crear empresa
        new_company = Company(
            name=company_data.name,
            nit=company_data.nit,
            code=company_data.code,
            email=company_data.email,
            phone=company_data.phone,
            address=company_data.address,
            website=company_data.website,
            industry=company_data.industry,
            status=CompanyStatus.active,
            created_user=current_user.get("email", "system")
        )
        
        db.add(new_company)
        db.commit()
        db.refresh(new_company)

        # Log de auditoría
        log_company_action(
            db, "CREATE_COMPANY", new_company.id, 
            current_user.get("email", "system"),
            new_values={"name": new_company.name, "nit": company_data.nit}
        )

        return CompanyResponse.from_orm(new_company)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creando empresa: {str(e)}"
        )

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_data: CompanyUpdateRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Actualizar empresa existente
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para actualizar empresas"
            )

        # Buscar empresa
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa no encontrada"
            )

        # Guardar valores anteriores para auditoría
        old_values = {
            "name": company.name,
            "email": company.email,
            "phone": company.phone,
            "address": company.address,
            "website": company.website,
            "industry": company.industry,
            "status": company.status.value
        }

        # Actualizar campos
        update_data = company_data.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            if field == "status" and value:
                setattr(company, field, CompanyStatus(value))
            elif value is not None:
                setattr(company, field, value)

        company.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(company)

        # Log de auditoría
        new_values = {
            "name": company.name,
            "email": company.email,
            "phone": company.phone,
            "address": company.address,
            "website": company.website,
            "industry": company.industry,
            "status": company.status.value
        }
        
        log_company_action(
            db, "UPDATE_COMPANY", company.id,
            current_user.get("email", "system"),
            old_values=old_values,
            new_values=new_values
        )

        return CompanyResponse.from_orm(company)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error actualizando empresa: {str(e)}"
        )

@router.delete("/{company_id}")
async def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Eliminar empresa (cambiar estado a inactiva)
    """
    try:
        # Verificar permisos
        if current_user.get("role") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para eliminar empresas"
            )

        # Buscar empresa
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa no encontrada"
            )

        # Verificar que no tenga usuarios activos
        active_users = db.query(User).filter(
            and_(
                User.company_id == company_id,
                User.is_active == True
            )
        ).count()
        
        if active_users > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No se puede eliminar la empresa. Tiene {active_users} usuarios activos"
            )

        # Cambiar estado
        company.status = CompanyStatus.inactive
        company.updated_at = datetime.utcnow()
        
        db.commit()

        # Log de auditoría
        log_company_action(
            db, "DELETE_COMPANY", company.id,
            current_user.get("email", "system"),
            old_values={"status": "active"},
            new_values={"status": "inactive"}
        )

        return {"message": "Empresa eliminada exitosamente"}

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error eliminando empresa: {str(e)}"
        )

@router.get("/{company_id}/users")
async def get_company_users(
    company_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener usuarios de una empresa
    """
    try:
        # Verificar permisos
        user_role = current_user.get("role")
        user_company_id = current_user.get("company_id")
        
        if user_role != "admin" and user_company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para ver usuarios de esta empresa"
            )

        # Verificar que la empresa existe
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa no encontrada"
            )

        # Obtener usuarios
        users = db.query(User).filter(
            and_(
                User.company_id == company_id,
                User.is_active == True
            )
        ).all()

        return {
            "company_id": company_id,
            "company_name": company.name,
            "total_users": len(users),
            "users": [
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role.value,
                    "last_login": user.last_login,
                    "created_at": user.created_at
                }
                for user in users
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo usuarios: {str(e)}"
        )