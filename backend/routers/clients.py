from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import crud, schemas, auth, models
from database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.ClientSchema])
def read_all_clients(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Endpoint para obtener una lista de todos los clientes.
    Requiere autenticación.
    """
    clients_db = crud.get_all_clients(db)
    
    # Helper function to convert ClientDataHistory to HistoricEntry with proper dateModified
    def to_historic_entry(history_item):
        return schemas.HistoricEntry(
            value=history_item.value,
            dateModified=history_item.date_modified
        )

    # Convertir cada cliente de la DB al esquema Pydantic
    clients_schema = []
    for client in clients_db:
        addresses = sorted([h for h in client.data_history if h.data_type == 'address'], key=lambda x: x.date_modified, reverse=True)
        phones = sorted([h for h in client.data_history if h.data_type == 'phone'], key=lambda x: x.date_modified, reverse=True)
        emails = sorted([h for h in client.data_history if h.data_type == 'email'], key=lambda x: x.date_modified, reverse=True)
        
        clients_schema.append(schemas.ClientSchema(
            id=client.id,
            nationalIdentifier=client.national_identifier,
            fullName=client.full_name,
            birthDate=client.birth_date,
            addresses=[to_historic_entry(a) for a in addresses],
            phones=[to_historic_entry(p) for p in phones],
            emails=[to_historic_entry(e) for e in emails],
            flags=[f.flag for f in client.flags]
        ))
    
    return clients_schema


@router.put("/{client_id}", response_model=schemas.ClientSchema)
def update_client_info(
    client_id: int,
    update_data: schemas.ClientUpdateData,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Actualiza la información de un cliente.
    Requiere autenticación.
    """
    updated_client_db = crud.update_client(db=db, client_id=client_id, update_data=update_data)
    
    if not updated_client_db:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    # Recargar el cliente con sus relaciones para asegurar que la respuesta esté completa
    db.refresh(updated_client_db)
    
    # Helper function to convert ClientDataHistory to HistoricEntry with proper dateModified
    def to_historic_entry(history_item):
        return schemas.HistoricEntry(
            value=history_item.value,
            dateModified=history_item.date_modified
        )

    addresses = sorted([h for h in updated_client_db.data_history if h.data_type == 'address'], key=lambda x: x.date_modified, reverse=True)
    phones = sorted([h for h in updated_client_db.data_history if h.data_type == 'phone'], key=lambda x: x.date_modified, reverse=True)
    emails = sorted([h for h in updated_client_db.data_history if h.data_type == 'email'], key=lambda x: x.date_modified, reverse=True)

    return schemas.ClientSchema(
        id=updated_client_db.id,
        nationalIdentifier=updated_client_db.national_identifier,
        fullName=updated_client_db.full_name,
        birthDate=updated_client_db.birth_date,
        addresses=[to_historic_entry(a) for a in addresses],
        phones=[to_historic_entry(p) for p in phones],
        emails=[to_historic_entry(e) for e in emails],
        flags=[f.flag for f in updated_client_db.flags]
    )