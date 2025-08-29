"""
Main simplificado para diagnóstico
"""

print("🚀 Iniciando MIRIESGO v2 Backend (modo diagnóstico)...")

try:
    import sys
    import os
    print("✅ Imports básicos OK")
    
    # Agregar path
    sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')
    print("✅ Path configurado")
    
    from fastapi import FastAPI
    print("✅ FastAPI importado")
    
    app = FastAPI(title="MIRIESGO v2 - Diagnóstico")
    print("✅ FastAPI app creada")
    
    @app.get("/")
    def read_root():
        return {"message": "MIRIESGO v2 Backend funcionando"}
    
    @app.get("/health")
    def health():
        return {"status": "ok", "mode": "diagnostic"}
    
    print("✅ Endpoints definidos")
    
    if __name__ == "__main__":
        import uvicorn
        print("🌐 Iniciando servidor uvicorn...")
        uvicorn.run(app, host="0.0.0.0", port=8000)
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()