import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Carga las variables de entorno desde .env
load_dotenv()

class Settings(BaseSettings):
    # Configuración de la Base de Datos
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "miriresgo")

    # Configuración de JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "clave-secreta-por-defecto-cambiar-en-produccion")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # Google Gemini
    API_KEY: str = os.getenv("API_KEY", "")

    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

# Validación de variables obligatorias
settings = Settings()
# Comentamos temporalmente la validación para desarrollo
# if not all([settings.DB_USER, settings.DB_PASSWORD, settings.API_KEY]):
#     raise ValueError("Faltan variables de entorno obligatorias. Por favor revisa tu archivo .env")

# Para desarrollo con SQLite, solo validamos la API_KEY si se va a usar
if settings.API_KEY and "TU_CLAVE_DE_GEMINI_AQUI" in settings.API_KEY:
    print("⚠️  ADVERTENCIA: Usando API Key de placeholder. Configura una real para usar IA.")