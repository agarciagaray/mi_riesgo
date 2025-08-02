from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import date, datetime

# --- Base Schemas ---
# Schemas para datos que se reciben o envían a través de la API.
# Proporcionan validación y serialización automática.

# -- User & Auth Schemas --
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    national_identifier: str
    phone: str

class UserCreate(UserBase):
    password: str
    role: str = 'analyst'
    company_id: Optional[int] = None

class UserSchema(UserBase):
    id: int
    company_id: Optional[int] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserSchema

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# -- Company Schemas --
class CompanyBase(BaseModel):
    name: str
    nit: str
    transunion_code: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class CompanyCreate(CompanyBase):
    pass

class CompanySchema(CompanyBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# -- Client & Credit Report Schemas --
class HistoricEntry(BaseModel):
    value: str
    dateModified: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class ClientUpdateData(BaseModel):
    fullName: str
    address: str
    phone: str
    email: str
    flags: List[str]


class ClientSchema(BaseModel):
    id: int
    nationalIdentifier: str
    fullName: str
    birthDate: date
    addresses: List[HistoricEntry]
    phones: List[HistoricEntry]
    emails: List[HistoricEntry]
    flags: Optional[List[str]] = []

    class Config:
        from_attributes = True
        populate_by_name = True


class PaymentSchema(BaseModel):
    id: int
    loan_id: int
    installment_number: int
    expected_payment_date: date
    actual_payment_date: Optional[date]
    amount_paid: Optional[float]
    status: str
    days_late: int

    class Config:
        from_attributes = True


class LoanSchema(BaseModel):
    id: int
    client_id: int
    origination_date: date
    original_amount: float
    modality: str
    interest_rate: float
    installments: int
    current_balance: float
    status: str
    last_report_date: date
    payments: List[PaymentSchema]

    class Config:
        from_attributes = True

class DebtSummary(BaseModel):
    totalCredits: int
    activeCredits: int
    paidCredits: int
    totalOriginalAmount: float
    totalCurrentBalance: float

    class Config:
        populate_by_name = True

class CreditReportSchema(BaseModel):
    client: ClientSchema
    loans: List[LoanSchema]
    debtSummary: DebtSummary

    class Config:
        populate_by_name = True

# -- Gemini & Risk Score Schemas --
class RiskScoreRequest(BaseModel):
    report: Any # Se deja Any por flexibilidad con el formato que envía el frontend

class RiskScore(BaseModel):
    score: int
    assessment: str
    reasoning: str

# -- Dashboard Schemas --
class GeneralDashboardData(BaseModel):
    total_clients: int
    active_clients_up_to_date: int
    clients_with_arrears: int
    clients_in_legal: int
    mora_distribution: dict

class CompanyAnalyticsData(BaseModel):
    company: CompanySchema
    total_clients: int
    active_clients_up_to_date: int
    clients_with_arrears: int
    clients_in_legal: int
    mora_distribution: dict

class DashboardResponse(BaseModel):
    general: GeneralDashboardData
    company: List[CompanyAnalyticsData]

# -- File Upload Schemas --
class ProcessResult(BaseModel):
    status: str # 'success' or 'error'
    message: str
    file_name: str
    total_records: int
    processed_records: int
    new_clients: int
    new_loans: int
    updated_loans: int
    errors: List[str]