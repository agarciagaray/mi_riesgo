# app/schemas/client.py
from pydantic import BaseModel
from datetime import date
from typing import List

class LoanBase(BaseModel):
    original_amount: float
    current_balance: float
    # ...

class Loan(LoanBase):
    id: int
    class Config:
        orm_mode = True # En Pydantic v1, ahora es from_attributes=True en v2

class ClientBase(BaseModel):
    full_name: str
    national_identifier: str
    
class Client(ClientBase):
    id: int
    loans: List[Loan] = []
    class Config:
        orm_mode = True