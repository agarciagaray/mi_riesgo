from sqlalchemy.orm import Session
from ..db import models

def get_client_by_identifier(db: Session, identifier: str):
    return db.query(models.Client).filter(models.Client.national_identifier == identifier).first()