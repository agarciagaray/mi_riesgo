from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, User, Company
from passlib.context import CryptContext
from database import DATABASE_URL

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Genera el hash de una contraseña."""
    return pwd_context.hash(password)

# Crear el motor de SQLAlchemy
engine = create_engine(DATABASE_URL)

# Crear todas las tablas definidas en models.py
Base.metadata.create_all(bind=engine)

# Crear una sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Verificar si ya existen usuarios
user_count = db.query(User).count()

if user_count == 0:
    try:
        # Crear empresas de ejemplo
        company1 = Company(
            name="Financiera Confianza S.A.",
            nit="800123456-1",
            transunion_code="101",
            address="Calle Falsa 123",
            phone="3001112233",
            email="contacto@confianza.com",
            is_active=True
        )
        
        company2 = Company(
            name="Créditos El Progreso Ltda.",
            nit="900654321-2",
            transunion_code="202",
            address="Avenida Siempre Viva 742",
            phone="3109998877",
            email="info@progreso.com.co",
            is_active=True
        )
        
        db.add(company1)
        db.add(company2)
        db.commit()
        db.refresh(company1)
        db.refresh(company2)
        
        # Crear usuarios de ejemplo
        admin_user = User(
            email="admin@credintell.com",
            password_hash=get_password_hash("AdminPass123!"),
            full_name="Administrador del Sistema",
            national_identifier="1",
            phone="3000000000",
            role="admin",
            company_id=None,
            is_active=True
        )
        
        analyst_user = User(
            email="analyst@credintell.com",
            password_hash=get_password_hash("AnalystPass123!"),
            full_name="Analista de Crédito",
            national_identifier="2",
            phone="3011111111",
            role="analyst",
            company_id=company1.id,
            is_active=True
        )
        
        manager_user = User(
            email="manager@credintell.com",
            password_hash=get_password_hash("ManagerPass123!"),
            full_name="Gerente de Operaciones",
            national_identifier="3",
            phone="3022222222",
            role="manager",
            company_id=company2.id,
            is_active=True
        )
        
        db.add(admin_user)
        db.add(analyst_user)
        db.add(manager_user)
        db.commit()
        
        print("Base de datos inicializada con empresas y usuarios de ejemplo.")
        print("\nUsuarios creados:")
        print("- Admin: admin@credintell.com / AdminPass123!")
        print("- Analista: analyst@credintell.com / AnalystPass123!")
        print("- Gerente: manager@credintell.com / ManagerPass123!")
        
    except Exception as e:
        db.rollback()
        print(f"Error al inicializar la base de datos: {e}")
        
else:
    print("La base de datos ya contiene usuarios. No se realizaron cambios.")

db.close()