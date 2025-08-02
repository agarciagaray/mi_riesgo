from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import crud, schemas, auth, models
from database import get_db

router = APIRouter()

@router.get("", response_model=List[schemas.CompanySchema])
def get_all_active_companies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Obtiene una lista de todas las empresas activas.
    Útil para poblar selectores en el frontend.
    """
    companies = crud.get_all_companies(db)
    return companies