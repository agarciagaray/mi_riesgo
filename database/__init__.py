"""
Módulo de base de datos para MIRIESGO v2
Configuración y modelos SQLAlchemy para MySQL
"""

from .config import (
    engine, SessionLocal, Base, get_db, 
    create_all_tables, drop_all_tables, 
    test_connection, get_database_info,
    validate_config, db_logger, AuditMixin
)

from .models import (
    Company, User, Client, Loan, CreditReport, 
    AuditLog, Session, FileUpload,
    CompanyStatus, UserRole, LoanType, LoanStatus, 
    PaymentBehavior, ReportType, RiskLevel, FileUploadStatus,
    get_all_models, get_model_by_name, create_model_instance
)

# Información del módulo
__version__ = "1.0.0"
__author__ = "MIRIESGO v2 Team"

# Configuraciones por defecto
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Exportaciones principales
__all__ = [
    # Configuración
    'engine', 'SessionLocal', 'Base', 'get_db',
    'create_all_tables', 'drop_all_tables', 
    'test_connection', 'get_database_info',
    'validate_config', 'db_logger', 'AuditMixin',
    
    # Modelos
    'Company', 'User', 'Client', 'Loan', 'CreditReport',
    'AuditLog', 'Session', 'FileUpload',
    
    # Enums
    'CompanyStatus', 'UserRole', 'LoanType', 'LoanStatus',
    'PaymentBehavior', 'ReportType', 'RiskLevel', 'FileUploadStatus',
    
    # Utilidades
    'get_all_models', 'get_model_by_name', 'create_model_instance',
    
    # Constantes
    'DEFAULT_PAGE_SIZE', 'MAX_PAGE_SIZE'
]

def initialize_database():
    """
    Inicializar la base de datos
    Verifica configuración, conexión y crea tablas si es necesario
    """
    print("🚀 Inicializando base de datos MIRIESGO v2...")
    
    # Validar configuración
    if not validate_config():
        return False
    
    # Probar conexión
    if not test_connection():
        return False
    
    # Crear tablas
    if not create_all_tables():
        return False
    
    print("✅ Base de datos inicializada correctamente")
    return True