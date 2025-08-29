"""
Modelos SQLAlchemy para MIRIESGO v2
Definición de todas las entidades de la base de datos
"""

from sqlalchemy import (
    Column, Integer, String, Text, Date, DateTime, Boolean, 
    ForeignKey, Enum, JSON, BigInteger, TIMESTAMP, DECIMAL
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.config import Base, AuditMixin
from datetime import datetime
import enum

# ===============================================
# ENUMS PARA CAMPOS ESPECÍFICOS
# ===============================================

class CompanyStatus(enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"

class UserRole(enum.Enum):
    admin = "admin"
    manager = "manager"
    analyst = "analyst"

class LoanType(enum.Enum):
    mortgage = "mortgage"
    vehicle = "vehicle"
    personal = "personal"
    commercial = "commercial"
    credit_card = "credit_card"

class LoanStatus(enum.Enum):
    active = "active"
    paid = "paid"
    defaulted = "defaulted"
    restructured = "restructured"
    cancelled = "cancelled"

class PaymentBehavior(enum.Enum):
    excellent = "excellent"
    good = "good"
    regular = "regular"
    poor = "poor"
    critical = "critical"

class ReportType(enum.Enum):
    basic = "basic"
    detailed = "detailed"
    commercial = "commercial"

class RiskLevel(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class FileUploadStatus(enum.Enum):
    uploaded = "uploaded"
    processing = "processing"
    completed = "completed"
    failed = "failed"

# ===============================================
# MODELO: Company (Empresas)
# ===============================================

class Company(Base, AuditMixin):
    __tablename__ = "companies"
    
    # Campos principales
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, comment="Nombre de la empresa")
    nit = Column(String(20), unique=True, nullable=False, comment="NIT de la empresa")
    code = Column(String(10), unique=True, nullable=False, comment="Código de entidad TransUnion")
    email = Column(String(255), nullable=True, comment="Email de contacto")
    phone = Column(String(20), nullable=True, comment="Teléfono de contacto")
    address = Column(Text, nullable=True, comment="Dirección de la empresa")
    website = Column(String(255), nullable=True, comment="Sitio web")
    industry = Column(String(100), nullable=True, comment="Sector industrial")
    status = Column(Enum(CompanyStatus), default=CompanyStatus.active, comment="Estado de la empresa")
    
    # Campos de auditoría
    created_user = Column(String(100), nullable=False, comment="Usuario que creó el registro")
    created_at = Column(TIMESTAMP, default=func.current_timestamp(), comment="Fecha de creación")
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="Fecha de última actualización")
    
    # Relaciones
    users = relationship("User", back_populates="company")
    loans = relationship("Loan", back_populates="company")
    credit_reports = relationship("CreditReport", back_populates="requested_by_company")
    file_uploads = relationship("FileUpload", back_populates="company")
    
    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.name}', nit='{self.nit}')>"

# ===============================================
# MODELO: User (Usuarios del sistema)
# ===============================================

class User(Base, AuditMixin):
    __tablename__ = "users"
    
    # Campos principales
    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(255), nullable=False, comment="Nombre completo del usuario")
    national_identifier = Column(String(20), unique=True, nullable=False, comment="Cédula de ciudadanía")
    email = Column(String(255), unique=True, nullable=False, comment="Email del usuario")
    phone = Column(String(20), nullable=False, comment="Teléfono del usuario")
    password_hash = Column(String(255), nullable=False, comment="Hash de la contraseña")
    role = Column(Enum(UserRole), nullable=False, default=UserRole.analyst, comment="Rol del usuario")
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=True, comment="ID de la empresa (NULL para admins)")
    
    # Campos adicionales
    last_login = Column(TIMESTAMP, nullable=True, comment="Último acceso del usuario")
    is_active = Column(Boolean, default=True, comment="Usuario activo/inactivo")
    login_attempts = Column(Integer, default=0, comment="Intentos de login fallidos")
    locked_until = Column(TIMESTAMP, nullable=True, comment="Fecha hasta la cual está bloqueado")
    
    # Campos de auditoría
    created_user = Column(String(100), nullable=False, comment="Usuario que creó el registro")
    created_at = Column(TIMESTAMP, default=func.current_timestamp(), comment="Fecha de creación")
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="Fecha de última actualización")
    
    # Relaciones
    company = relationship("Company", back_populates="users")
    requested_reports = relationship("CreditReport", back_populates="requested_by_user")
    audit_logs = relationship("AuditLog", back_populates="user")
    sessions = relationship("Session", back_populates="user")
    file_uploads = relationship("FileUpload", back_populates="user")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"

# ===============================================
# MODELO: Client (Clientes para consultas crediticias)
# ===============================================

class Client(Base, AuditMixin):
    __tablename__ = "clients"
    
    # Campos principales
    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(255), nullable=False, comment="Nombre completo del cliente")
    national_identifier = Column(String(20), unique=True, nullable=False, comment="Cédula de ciudadanía")
    birth_date = Column(Date, nullable=True, comment="Fecha de nacimiento")
    phone = Column(String(20), nullable=True, comment="Teléfono del cliente")
    email = Column(String(255), nullable=True, comment="Email del cliente")
    address = Column(Text, nullable=True, comment="Dirección del cliente")
    city = Column(String(100), nullable=True, comment="Ciudad de residencia")
    department = Column(String(100), nullable=True, comment="Departamento de residencia")
    occupation = Column(String(255), nullable=True, comment="Ocupación del cliente")
    monthly_income = Column(DECIMAL(15, 2), nullable=True, comment="Ingresos mensuales")
    
    # Campos de auditoría
    created_user = Column(String(100), nullable=False, comment="Usuario que creó el registro")
    created_at = Column(TIMESTAMP, default=func.current_timestamp(), comment="Fecha de creación")
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="Fecha de última actualización")
    
    # Relaciones
    loans = relationship("Loan", back_populates="client")
    credit_reports = relationship("CreditReport", back_populates="client")
    
    def __repr__(self):
        return f"<Client(id={self.id}, name='{self.full_name}', identifier='{self.national_identifier}')>"

# ===============================================
# MODELO: Loan (Préstamos/Créditos)
# ===============================================

class Loan(Base, AuditMixin):
    __tablename__ = "loans"
    
    # Campos principales
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False, comment="ID del cliente")
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False, comment="ID de la empresa otorgante")
    loan_number = Column(String(50), unique=True, nullable=False, comment="Número único del préstamo")
    loan_type = Column(Enum(LoanType), nullable=False, comment="Tipo de préstamo")
    
    # Información financiera
    original_amount = Column(DECIMAL(15, 2), nullable=False, comment="Monto original del préstamo")
    current_balance = Column(DECIMAL(15, 2), nullable=False, comment="Saldo actual del préstamo")
    monthly_payment = Column(DECIMAL(15, 2), nullable=False, comment="Pago mensual")
    interest_rate = Column(DECIMAL(5, 2), nullable=False, comment="Tasa de interés anual")
    
    # Fechas importantes
    start_date = Column(Date, nullable=False, comment="Fecha de inicio del préstamo")
    end_date = Column(Date, nullable=False, comment="Fecha de vencimiento")
    last_payment_date = Column(Date, nullable=True, comment="Fecha del último pago")
    
    # Estado del préstamo
    status = Column(Enum(LoanStatus), default=LoanStatus.active, comment="Estado del préstamo")
    days_late = Column(Integer, default=0, comment="Días de atraso")
    payment_behavior = Column(Enum(PaymentBehavior), default=PaymentBehavior.excellent, comment="Comportamiento de pago")
    
    # Garantías
    collateral_type = Column(String(100), nullable=True, comment="Tipo de garantía")
    collateral_value = Column(DECIMAL(15, 2), nullable=True, comment="Valor de la garantía")
    
    # Campos de auditoría
    created_user = Column(String(100), nullable=False, comment="Usuario que creó el registro")
    created_at = Column(TIMESTAMP, default=func.current_timestamp(), comment="Fecha de creación")
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="Fecha de última actualización")
    
    # Relaciones
    client = relationship("Client", back_populates="loans")
    company = relationship("Company", back_populates="loans")
    
    def __repr__(self):
        return f"<Loan(id={self.id}, number='{self.loan_number}', amount={self.original_amount})>"

# ===============================================
# MODELO: CreditReport (Reportes crediticios generados)
# ===============================================

class CreditReport(Base, AuditMixin):
    __tablename__ = "credit_reports"
    
    # Campos principales
    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False, comment="ID del cliente consultado")
    requested_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=False, comment="ID del usuario que solicitó el reporte")
    requested_by_company_id = Column(Integer, ForeignKey('companies.id'), nullable=False, comment="ID de la empresa que solicitó el reporte")
    
    # Información del reporte
    report_type = Column(Enum(ReportType), default=ReportType.basic, comment="Tipo de reporte generado")
    credit_score = Column(Integer, nullable=True, comment="Puntaje crediticio calculado")
    risk_level = Column(Enum(RiskLevel), nullable=True, comment="Nivel de riesgo")
    
    # Resumen financiero
    total_active_loans = Column(Integer, default=0, comment="Total de préstamos activos")
    total_debt_amount = Column(DECIMAL(15, 2), default=0, comment="Monto total de deuda")
    monthly_obligations = Column(DECIMAL(15, 2), default=0, comment="Obligaciones mensuales")
    
    # Comportamiento histórico
    payment_history_score = Column(Integer, nullable=True, comment="Puntaje de historial de pagos")
    recent_inquiries = Column(Integer, default=0, comment="Consultas recientes (últimos 6 meses)")
    
    # Información adicional
    report_data = Column(JSON, nullable=True, comment="Datos completos del reporte en formato JSON")
    observations = Column(Text, nullable=True, comment="Observaciones adicionales")
    
    # Campos de auditoría
    created_user = Column(String(100), nullable=False, comment="Usuario que creó el registro")
    created_at = Column(TIMESTAMP, default=func.current_timestamp(), comment="Fecha de creación")
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="Fecha de última actualización")
    
    # Relaciones
    client = relationship("Client", back_populates="credit_reports")
    requested_by_user = relationship("User", back_populates="requested_reports")
    requested_by_company = relationship("Company", back_populates="credit_reports")
    
    def __repr__(self):
        return f"<CreditReport(id={self.id}, client_id={self.client_id}, type='{self.report_type.value}')>"

# ===============================================
# MODELO: AuditLog (Logs de auditoría del sistema)
# ===============================================

class AuditLog(Base, AuditMixin):
    __tablename__ = "audit_logs"
    
    # Campos principales
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, comment="ID del usuario que realizó la acción")
    action = Column(String(100), nullable=False, comment="Acción realizada")
    table_name = Column(String(50), nullable=False, comment="Tabla afectada")
    record_id = Column(Integer, nullable=True, comment="ID del registro afectado")
    
    # Detalles de la acción
    old_values = Column(JSON, nullable=True, comment="Valores anteriores (para updates)")
    new_values = Column(JSON, nullable=True, comment="Valores nuevos")
    ip_address = Column(String(45), nullable=True, comment="Dirección IP del usuario")
    user_agent = Column(Text, nullable=True, comment="User agent del navegador")
    
    # Campos de auditoría
    created_user = Column(String(100), nullable=False, comment="Usuario que creó el registro")
    created_at = Column(TIMESTAMP, default=func.current_timestamp(), comment="Fecha de creación")
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="Fecha de última actualización")
    
    # Relaciones
    user = relationship("User", back_populates="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', table='{self.table_name}')>"

# ===============================================
# MODELO: Session (Sesiones de usuario)
# ===============================================

class Session(Base, AuditMixin):
    __tablename__ = "sessions"
    
    # Campos principales
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, comment="ID del usuario")
    token_hash = Column(String(255), unique=True, nullable=False, comment="Hash del token de sesión")
    
    # Información de la sesión
    ip_address = Column(String(45), nullable=True, comment="Dirección IP del usuario")
    user_agent = Column(Text, nullable=True, comment="User agent del navegador")
    expires_at = Column(TIMESTAMP, nullable=False, comment="Fecha de expiración del token")
    last_activity = Column(TIMESTAMP, default=func.current_timestamp(), comment="Última actividad")
    is_active = Column(Boolean, default=True, comment="Sesión activa")
    
    # Campos de auditoría
    created_user = Column(String(100), nullable=False, comment="Usuario que creó el registro")
    created_at = Column(TIMESTAMP, default=func.current_timestamp(), comment="Fecha de creación")
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="Fecha de última actualización")
    
    # Relaciones
    user = relationship("User", back_populates="sessions")
    
    def __repr__(self):
        return f"<Session(id={self.id}, user_id={self.user_id}, active={self.is_active})>"

# ===============================================
# MODELO: FileUpload (Archivos subidos al sistema)
# ===============================================

class FileUpload(Base, AuditMixin):
    __tablename__ = "file_uploads"
    
    # Campos principales
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, comment="ID del usuario que subió el archivo")
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False, comment="ID de la empresa asociada")
    
    # Información del archivo
    original_filename = Column(String(255), nullable=False, comment="Nombre original del archivo")
    stored_filename = Column(String(255), nullable=False, comment="Nombre del archivo en el servidor")
    file_path = Column(String(500), nullable=False, comment="Ruta completa del archivo")
    file_size = Column(BigInteger, nullable=False, comment="Tamaño del archivo en bytes")
    file_type = Column(String(100), nullable=False, comment="Tipo MIME del archivo")
    
    # Estado del procesamiento
    status = Column(Enum(FileUploadStatus), default=FileUploadStatus.uploaded, comment="Estado del procesamiento")
    processed_records = Column(Integer, default=0, comment="Registros procesados exitosamente")
    failed_records = Column(Integer, default=0, comment="Registros que fallaron")
    error_details = Column(Text, nullable=True, comment="Detalles de errores durante procesamiento")
    
    # Campos de auditoría
    created_user = Column(String(100), nullable=False, comment="Usuario que creó el registro")
    created_at = Column(TIMESTAMP, default=func.current_timestamp(), comment="Fecha de creación")
    updated_at = Column(TIMESTAMP, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="Fecha de última actualización")
    
    # Relaciones
    user = relationship("User", back_populates="file_uploads")
    company = relationship("Company", back_populates="file_uploads")
    
    def __repr__(self):
        return f"<FileUpload(id={self.id}, filename='{self.original_filename}', status='{self.status.value}')>"

# ===============================================
# FUNCIONES DE UTILIDAD PARA MODELOS
# ===============================================

def get_all_models():
    """
    Retorna una lista de todos los modelos definidos
    """
    return [
        Company, User, Client, Loan, CreditReport, 
        AuditLog, Session, FileUpload
    ]

def get_model_by_name(model_name: str):
    """
    Obtiene un modelo por su nombre
    """
    models = {
        'Company': Company,
        'User': User,
        'Client': Client,
        'Loan': Loan,
        'CreditReport': CreditReport,
        'AuditLog': AuditLog,
        'Session': Session,
        'FileUpload': FileUpload
    }
    return models.get(model_name)

def create_model_instance(model_name: str, **kwargs):
    """
    Crea una instancia de un modelo con los datos proporcionados
    """
    model_class = get_model_by_name(model_name)
    if model_class:
        return model_class(**kwargs)
    else:
        raise ValueError(f"Modelo '{model_name}' no encontrado")

# ===============================================
# EXPORTACIONES
# ===============================================

__all__ = [
    'Company', 'User', 'Client', 'Loan', 'CreditReport', 
    'AuditLog', 'Session', 'FileUpload',
    'CompanyStatus', 'UserRole', 'LoanType', 'LoanStatus', 
    'PaymentBehavior', 'ReportType', 'RiskLevel', 'FileUploadStatus',
    'get_all_models', 'get_model_by_name', 'create_model_instance'
]