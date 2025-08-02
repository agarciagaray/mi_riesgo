from sqlalchemy.orm import Session, joinedload, subqueryload
from sqlalchemy import func
import models, schemas
from auth import get_password_hash
from datetime import datetime

# --- User CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        national_identifier=user.national_identifier,
        phone=user.phone,
        role=user.role,
        company_id=user.company_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Company CRUD ---
def get_all_companies(db: Session):
    return db.query(models.Company).filter(models.Company.is_active == True).all()

# --- Client CRUD ---
def get_client_by_identifier(db: Session, identifier: str):
    return db.query(models.Client).filter(models.Client.national_identifier == identifier).first()

def get_all_clients(db: Session):
    return (
        db.query(models.Client)
        .options(
            subqueryload(models.Client.data_history),
            subqueryload(models.Client.flags)
        )
        .order_by(models.Client.full_name)
        .all()
    )

def update_client(db: Session, client_id: int, update_data: schemas.ClientUpdateData):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        return None

    now = datetime.utcnow()

    # Update simple fields
    db_client.full_name = update_data.fullName
    
    # Obtener el dato más reciente de cada tipo para comparar
    latest_address = db.query(models.ClientDataHistory).filter_by(client_id=client_id, data_type='address').order_by(models.ClientDataHistory.date_modified.desc()).first()
    latest_phone = db.query(models.ClientDataHistory).filter_by(client_id=client_id, data_type='phone').order_by(models.ClientDataHistory.date_modified.desc()).first()
    latest_email = db.query(models.ClientDataHistory).filter_by(client_id=client_id, data_type='email').order_by(models.ClientDataHistory.date_modified.desc()).first()

    # Update historical data if changed
    if not latest_address or latest_address.value != update_data.address:
        new_address = models.ClientDataHistory(client_id=client_id, data_type='address', value=update_data.address, date_modified=now)
        db.add(new_address)
    
    if not latest_phone or latest_phone.value != update_data.phone:
        new_phone = models.ClientDataHistory(client_id=client_id, data_type='phone', value=update_data.phone, date_modified=now)
        db.add(new_phone)
        
    if not latest_email or latest_email.value != update_data.email:
        new_email = models.ClientDataHistory(client_id=client_id, data_type='email', value=update_data.email, date_modified=now)
        db.add(new_email)

    # Update flags
    current_flags = {f.flag for f in db_client.flags}
    flags_to_remove = current_flags - set(update_data.flags)
    for flag_val in flags_to_remove:
        db.query(models.ClientFlag).filter_by(client_id=client_id, flag=flag_val).delete()

    flags_to_add = set(update_data.flags) - current_flags
    for flag_val in flags_to_add:
        new_flag = models.ClientFlag(client_id=client_id, flag=flag_val)
        db.add(new_flag)
        
    db.commit()
    db.refresh(db_client)
    return db_client


# --- Loan CRUD ---
def update_loan(db: Session, loan_id: int, loan_update: dict):
    db_loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not db_loan:
        return None
    
    # Update only the fields provided in the dictionary
    for key, value in loan_update.items():
        if hasattr(db_loan, key):
            setattr(db_loan, key, value)
            
    db_loan.last_report_date = datetime.utcnow().date()
    
    db.commit()
    db.refresh(db_loan)
    return db_loan


# --- Credit Report Logic ---
def get_full_credit_report(db: Session, identifier: str):
    client = (
        db.query(models.Client)
        .options(
            joinedload(models.Client.data_history),
            joinedload(models.Client.flags),
            joinedload(models.Client.loans).subqueryload(models.Loan.payments)
        )
        .filter(models.Client.national_identifier == identifier)
        .first()
    )

    if not client:
        return None

    addresses = sorted([h for h in client.data_history if h.data_type == 'address'], key=lambda x: x.date_modified, reverse=True)
    phones = sorted([h for h in client.data_history if h.data_type == 'phone'], key=lambda x: x.date_modified, reverse=True)
    emails = sorted([h for h in client.data_history if h.data_type == 'email'], key=lambda x: x.date_modified, reverse=True)
    
    # Calculate debt summary
    total_credits = len(client.loans)
    active_credits = sum(1 for loan in client.loans if loan.status not in ['Pagado', 'Cancelado'])
    paid_credits = total_credits - active_credits
    total_original_amount = sum(loan.original_amount for loan in client.loans)
    total_current_balance = sum(loan.current_balance for loan in client.loans)

    debt_summary = schemas.DebtSummary(
        totalCredits=total_credits,
        activeCredits=active_credits,
        paidCredits=paid_credits,
        totalOriginalAmount=float(total_original_amount),
        totalCurrentBalance=float(total_current_balance)
    )

    # Helper function to convert ClientDataHistory to HistoricEntry with proper dateModified
    def to_historic_entry(history_item):
        return schemas.HistoricEntry(
            value=history_item.value,
            dateModified=history_item.date_modified
        )

    client_schema = schemas.ClientSchema(
        id=client.id,
        nationalIdentifier=client.national_identifier,
        fullName=client.full_name,
        birthDate=client.birth_date,
        addresses=[to_historic_entry(a) for a in addresses],
        phones=[to_historic_entry(p) for p in phones],
        emails=[to_historic_entry(e) for e in emails],
        flags=[f.flag for f in client.flags]
    )

    report = schemas.CreditReportSchema(
        client=client_schema,
        loans=[schemas.LoanSchema.from_orm(loan) for loan in client.loans],
        debtSummary=debt_summary
    )
    
    return report