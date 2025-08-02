from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import SQLAlchemyError
import logging
from config import settings

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- Opción 1: mysqlclient (requiere instalar mysqlclient) ---
# DATABASE_URL = (
#     f"mysql+mysqlclient://{settings.DB_USER}:{settings.DB_PASSWORD}@"
#     f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
# )

# --- Opción 2: pymysql (recomendado en Windows, requiere instalar pymysql) ---
DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@"
    f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)


try:
    # Crea el motor de SQLAlchemy con configuración mejorada
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Verifica la conexión antes de usarla
        pool_recycle=3600,   # Recicla conexiones cada hora
        pool_size=5,         # Tamaño del pool de conexiones
        max_overflow=10,     # Conexiones adicionales permitidas
        echo=settings.DEBUG  # Muestra consultas SQL en consola si DEBUG=True
    )
    
    # Crea una clase de sesión local
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )
    
    # Base para los modelos ORM
    Base = declarative_base()
    
    logger.info("Conexión a la base de datos configurada correctamente")

except Exception as e:
    logger.error(f"Error al configurar la conexión a la base de datos: {e}")
    raise

def get_db():
    """
    Proveedor de dependencia para obtener una sesión de base de datos.
    Asegura que la sesión se cierre correctamente después de su uso.
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Error de base de datos: {e}")
        db.rollback()
        raise
    finally:
        db.close()