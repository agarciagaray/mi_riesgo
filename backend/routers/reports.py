from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud, schemas, auth, models
from database import get_db

router = APIRouter()

@router.get("/{identifier}", response_model=schemas.CreditReportSchema)
def get_credit_report(
    identifier: str, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Obtiene el reporte de crédito completo para un cliente por su identificador nacional.
    Este es un endpoint protegido que requiere autenticación.
    """
    report = crud.get_full_credit_report(db, identifier=identifier)
    if report is None:
        raise HTTPException(status_code=404, detail="Reporte no encontrado para el identificador proporcionado.")
    
    return report

@router.put("/loans/{loan_id}", response_model=schemas.LoanSchema)
def update_loan_details(
    loan_id: int,
    loan_update: schemas.LoanSchema, # Usar un schema flexible o un dict
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Actualiza los detalles de un préstamo.
    """
    # Convertir el schema Pydantic a un diccionario, excluyendo campos no establecidos
    update_data = loan_update.dict(exclude_unset=True)
    
    updated_loan = crud.update_loan(db, loan_id=loan_id, loan_update=update_data)
    if not updated_loan:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
        
    return schemas.LoanSchema.from_orm(updated_loan)