
from database import SessionLocal
from models import User
from auth import pwd_context

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Cambia estos valores por los del usuario que deseas crear
email = "nuevo@usuario.com"
full_name = "Nuevo Usuario"
national_identifier = "123456780"
phone = "555-1234"
password = "AnalystPass123!"
role = "analyst"  # o "manager", "admin"
company_id = None  # o el ID de la compañía si aplica

# Genera el hash de la contraseña
password_hash = get_password_hash(password)

# Crea la sesión y el usuario
db = SessionLocal()
try:
    nuevo_usuario = User(
        email=email,
        full_name=full_name,
        national_identifier=national_identifier,
        phone=phone,
        password_hash=password_hash,
        role=role,
        company_id=company_id
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    print("Usuario creado con ID:", nuevo_usuario.id)
except Exception as e:
    print("Error al crear usuario:", e)
    db.rollback()
finally:
    db.close()