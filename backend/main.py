import os
import sys
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

# Agregar el directorio padre al path para importar database
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

# Importar routers
from routers import auth, reports, clients, dashboard, gemini, files, companies, users

# Crea la carpeta de uploads si no existe
if not os.path.exists('uploads'):
    os.makedirs('uploads')

print("🚀 Iniciando MIRIESGO v2 Backend...")
print("="*50)
print("⚠️ Usando modo de desarrollo con datos mock")
print("📊 Para configurar MySQL, revise la documentación")
print("="*50)

# ===============================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ===============================================

app = FastAPI(
    title="MIRIESGO v2 - Credit Intelligence Platform API",
    description="API avanzada para gestión de riesgo crediticio, análisis de cartera y reportes TransUnion.",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# ===============================================
# CONFIGURACIÓN DE CORS
# ===============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",  # Vite dev server alternativo
        "http://localhost:3000",  # React dev server (por si acaso)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# ===============================================
# MIDDLEWARE DE MANEJO DE ERRORES
# ===============================================

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Manejo global de errores de SQLAlchemy"""
    error_msg = str(exc)
    print(f"❌ SQLAlchemy Error en {request.url}: {error_msg}")
    
    # Retornar error genérico para no exponer detalles internos
    return JSONResponse(
        status_code=500,
        content={
            "message": "Error interno de base de datos. Intente nuevamente o contacte al soporte técnico.",
            "error_code": "DB_ERROR",
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Manejo global de errores generales"""
    error_msg = str(exc)
    print(f"❌ Error general en {request.url}: {error_msg}")
    
    return JSONResponse(
        status_code=500,
        content={
            "message": "Error interno del servidor. Intente nuevamente.",
            "error_code": "INTERNAL_ERROR",
        },
    )

# ===============================================
# INCLUIR ROUTERS
# ===============================================

# Autenticación y usuarios
app.include_router(auth.router, prefix="/api/auth", tags=["🔐 Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["👥 Users"])

# Consultas y reportes
app.include_router(reports.router, prefix="/api/reports", tags=["📊 Reports"])
app.include_router(clients.router, prefix="/api/clients", tags=["👤 Clients"])

# Gestión empresarial
app.include_router(companies.router, prefix="/api/companies", tags=["🏢 Companies"])

# Dashboard y análisis
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["📈 Dashboard"])
app.include_router(gemini.router, prefix="/api", tags=["🤖 AI Risk Analysis"])

# Archivos
app.include_router(files.router, prefix="/api/files", tags=["📁 File Processing"])

# ===============================================
# ENDPOINTS DE SALUD Y INFORMACIÓN
# ===============================================

@app.get("/api/health", tags=["🏥 Health Check"])
async def health_check():
    """Endpoint para verificar que el servidor está funcionando"""
    return {
        "status": "healthy",
        "database": "mock_mode",
        "version": "2.0.0",
        "message": "MIRIESGO v2 Backend funcionando en modo de desarrollo"
    }

@app.get("/api/info", tags=["ℹ️ System Info"])
async def system_info():
    """Información del sistema y configuración"""
    return {
        "application": "MIRIESGO v2",
        "version": "2.0.0",
        "mode": "development",
        "database": "Mock data (MySQL not configured)",
        "features": [
            "Consultas crediticias",
            "Análisis de riesgo con IA",
            "Dashboard empresarial",
            "Carga masiva de archivos"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("🌐 Iniciando servidor...")
    uvicorn.run(app, host="0.0.0.0", port=8000)