import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, reports, clients, dashboard, gemini, files, companies
from sqlalchemy.exc import SQLAlchemyError

# Crea la carpeta de uploads si no existe
if not os.path.exists('uploads'):
    os.makedirs('uploads')

app = FastAPI(
    title="Credit Intelligence Platform API",
    description="API para gestionar el riesgo crediticio y la cartera de clientes.",
    version="1.0.0",
)

# Configuración de CORS
# Esto permite que el frontend (ejecutándose en un origen diferente) se comunique con el backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # En producción, deberías restringir esto a la URL de tu frontend.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para manejar errores de base de datos de forma global
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    print(f"SQLAlchemy Error: {exc}") # Log para debugging
    return JSONResponse(
        status_code=500,
        content={"message": "Ocurrió un error en la base de datos. Por favor, intente de nuevo más tarde."},
    )

# Incluir los routers de la aplicación
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(gemini.router, prefix="/api", tags=["AI Risk Analysis"])
app.include_router(files.router, prefix="/api/files", tags=["File Processing"])
app.include_router(companies.router, prefix="/api/companies", tags=["Companies"])


@app.get("/api/health", tags=["Health Check"])
async def health_check():
    """Endpoint para verificar que el servidor está funcionando."""
    return {"status": "ok"}