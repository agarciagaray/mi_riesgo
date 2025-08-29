"""
Configuración de base de datos para MIRIESGO v2
Manejo de conexión MySQL con SQLAlchemy
"""

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import logging

# Configuración de logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# ===============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===============================================

# Variables de entorno para configuración
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '3306')
DB_NAME = os.getenv('DB_NAME', 'miriesgo_v2')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')

# Construcción de la URL de conexión
# Intentar MySQL primero, fallback a SQLite
try:
    if DB_PASSWORD:
        DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    else:
        DATABASE_URL = f"mysql+pymysql://{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    
    # Probar conexión MySQL
    test_engine = create_engine(
        DATABASE_URL,
        connect_args={
            "connect_timeout": 30,
            "read_timeout": 30,
            "write_timeout": 30
        }
    )
    with test_engine.connect() as conn:
        conn.execute("SELECT 1")
    print("✅ Conectado a MySQL/MariaDB")
except Exception as e:
    print(f"⚠️ MySQL no disponible ({e}), usando SQLite")
    DATABASE_URL = "sqlite:///./miriesgo_v2.db"

# ===============================================
# CONFIGURACIÓN DEL ENGINE
# ===============================================

# Configuración del motor de base de datos
if DATABASE_URL.startswith("mysql"):
    # Configuración para MySQL/MariaDB
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False,  # Cambiar a True para debug SQL
        connect_args={
            "connect_timeout": 30,
            "read_timeout": 30,
            "write_timeout": 30,
            "autocommit": False
        }
    )
else:
    # Configuración para SQLite
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Cambiar a True para debug SQL
        connect_args={
            "check_same_thread": False
        }
    )

# ===============================================
# CONFIGURACIÓN DE SESIONES
# ===============================================

# Configuración de las sesiones
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base para modelos
Base = declarative_base()

# Metadata para introspección
metadata = MetaData()

# ===============================================
# FUNCIONES DE UTILIDAD
# ===============================================

def get_db():
    """
    Generador de sesiones de base de datos
    Para usar con FastAPI Dependency Injection
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_all_tables():
    """
    Crear todas las tablas en la base de datos
    """
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente")
        return True
    except Exception as e:
        print(f"❌ Error creando tablas: {e}")
        return False

def drop_all_tables():
    """
    Eliminar todas las tablas de la base de datos
    ¡USAR CON PRECAUCIÓN!
    """
    try:
        Base.metadata.drop_all(bind=engine)
        print("⚠️ Todas las tablas han sido eliminadas")
        return True
    except Exception as e:
        print(f"❌ Error eliminando tablas: {e}")
        return False

def test_connection():
    """
    Probar la conexión a la base de datos
    """
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1 as test")
            test_value = result.fetchone()[0]
            if test_value == 1:
                print("✅ Conexión a la base de datos exitosa")
                return True
            else:
                print("❌ Conexión fallida - respuesta inesperada")
                return False
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def get_database_info():
    """
    Obtener información de la base de datos
    """
    try:
        with engine.connect() as connection:
            # Información del servidor
            server_info = connection.execute("SELECT VERSION() as version").fetchone()[0]
            
            # Información de la base de datos
            db_info = connection.execute(
                f"SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME "
                f"FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '{DB_NAME}'"
            ).fetchone()
            
            # Contar tablas
            table_count = connection.execute(
                f"SELECT COUNT(*) as count FROM information_schema.TABLES "
                f"WHERE TABLE_SCHEMA = '{DB_NAME}'"
            ).fetchone()[0]
            
            info = {
                "server_version": server_info,
                "database_name": db_info[0] if db_info else "No encontrada",
                "charset": db_info[1] if db_info else "Desconocido",
                "collation": db_info[2] if db_info else "Desconocido",
                "table_count": table_count,
                "connection_url": DATABASE_URL.replace(DB_PASSWORD, "*" * len(DB_PASSWORD))
            }
            
            return info
    except Exception as e:
        print(f"❌ Error obteniendo información: {e}")
        return None

# ===============================================
# CONFIGURACIÓN DE AUDITORÍA
# ===============================================

class AuditMixin:
    """
    Mixin para agregar campos de auditoría a los modelos
    """
    def set_audit_fields(self, user: str):
        """Establecer campos de auditoría"""
        from datetime import datetime
        
        if not hasattr(self, 'created_at') or self.created_at is None:
            self.created_user = user
            self.created_at = datetime.utcnow()
        
        self.updated_at = datetime.utcnow()

# ===============================================
# CONFIGURACIÓN DE LOGGING PERSONALIZADO
# ===============================================

def setup_database_logging():
    """
    Configurar logging específico para la base de datos
    """
    db_logger = logging.getLogger('miriesgo.database')
    db_logger.setLevel(logging.INFO)
    
    if not db_logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        db_logger.addHandler(handler)
    
    return db_logger

# Inicializar logger
db_logger = setup_database_logging()

# ===============================================
# VALIDACIONES DE CONFIGURACIÓN
# ===============================================

def validate_config():
    """
    Validar la configuración de la base de datos
    """
    issues = []
    
    if not DB_USER:
        issues.append("DB_USER no está configurado")
    
    if not DB_NAME:
        issues.append("DB_NAME no está configurado")
    
    if not DB_HOST:
        issues.append("DB_HOST no está configurado")
    
    if DB_PASSWORD == '':
        issues.append("⚠️ DB_PASSWORD está vacío - usando conexión sin contraseña")
    
    if issues:
        print("🔍 Problemas de configuración encontrados:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    
    print("✅ Configuración de base de datos válida")
    return True

# ===============================================
# INICIALIZACIÓN
# ===============================================

# Validar configuración al importar el módulo
if __name__ == "__main__":
    print("🔧 Configuración de Base de Datos MIRIESGO v2")
    print("=" * 50)
    
    # Validar configuración
    config_valid = validate_config()
    
    if config_valid:
        # Probar conexión
        connection_ok = test_connection()
        
        if connection_ok:
            # Mostrar información de la base de datos
            info = get_database_info()
            if info:
                print("\n📊 Información de la Base de Datos:")
                print(f"  Servidor: {info['server_version']}")
                print(f"  Base de datos: {info['database_name']}")
                print(f"  Charset: {info['charset']}")
                print(f"  Collation: {info['collation']}")
                print(f"  Tablas: {info['table_count']}")
                print(f"  URL: {info['connection_url']}")
        else:
            print("❌ No se pudo establecer conexión con la base de datos")
    else:
        print("❌ Configuración inválida")