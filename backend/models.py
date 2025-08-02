from sqlalchemy import (
    Boolean, Column, ForeignKey, Integer, String, Date, DECIMAL, 
    TIMESTAMP, Enum, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    name = Column(String(255), nullable=False)
    nit = Column(String(20), nullable=False, unique=True)
    transunion_code = Column(String(10), nullable=False, unique=True)
    address = Column(String(255))
    phone = Column(String(20))
    email = Column(String(255))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    users = relationship("User", back_populates="company")
    loans = relationship("Loan", back_populates="company")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)
    full_name = Column(String(255), nullable=False)
    national_identifier = Column(String(20), nullable=False, unique=True)
    phone = Column(String(20), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("analyst", "manager", "admin"), nullable=False, default="analyst")
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="users")

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    national_identifier = Column(String(20), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    birth_date = Column(Date)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    data_history = relationship("ClientDataHistory", back_populates="client", cascade="all, delete-orphan")
    flags = relationship("ClientFlag", back_populates="client", cascade="all, delete-orphan")
    loans = relationship("Loan", back_populates="client")

class ClientDataHistory(Base):
    __tablename__ = "client_data_history"
    id = Column(Integer, primary_key=True, autoincrement=True, unique=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    data_type = Column(Enum("address", "phone", "email"), nullable=False)
    value = Column(String(255), nullable=False)
    date_modified = Column(TIMESTAMP, server_default=func.now())
    
    client = relationship("Client", back_populates="data_history")

class ClientFlag(Base):
    __tablename__ = "client_flags"
    id = Column(Integer, primary_key=True, autoincrement=True, unique=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    flag = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    client = relationship("Client", back_populates="flags")

class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True, unique=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    origination_date = Column(Date, nullable=False)
    original_amount = Column(DECIMAL(15, 2), nullable=False)
    current_balance = Column(DECIMAL(15, 2), nullable=False)
    status = Column(Enum('Vigente', 'En Mora', 'Pagado', 'Cancelado', 'Castigado', 'En Jurídica', 'Embargo', 'Fraudulento', 'Siniestrado'), nullable=False)
    modality = Column(Enum('Diario', 'Semanal', 'Quincenal', 'Mensual', 'Anual'), nullable=False)
    interest_rate = Column(DECIMAL(5, 2), nullable=False)
    installments = Column(Integer, nullable=False)
    last_report_date = Column(Date, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    client = relationship("Client", back_populates="loans")
    company = relationship("Company", back_populates="loans")
    payments = relationship("Payment", back_populates="loan", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, autoincrement=True, unique=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    installment_number = Column(Integer, nullable=False)
    expected_payment_date = Column(Date, nullable=False)
    actual_payment_date = Column(Date)
    amount_paid = Column(DECIMAL(15, 2))
    status = Column(Enum('Pendiente', 'Pagado', 'En Mora'), nullable=False)
    days_late = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    loan = relationship("Loan", back_populates="payments")