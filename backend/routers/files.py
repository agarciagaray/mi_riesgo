from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import schemas, auth, models
import os
import shutil

router = APIRouter()

UPLOAD_DIRECTORY = "uploads"

@router.post("/upload", response_model=schemas.ProcessResult)
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Endpoint para cargar un archivo plano.
    NOTA: Esta es una implementación SIMULADA. No procesa el archivo,
    simplemente lo guarda y devuelve un resultado exitoso.
    """
    if not file.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="Formato de archivo no válido. Solo se aceptan archivos .txt.")

    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        return schemas.ProcessResult(
            status='error',
            message=f"No se pudo guardar el archivo: {str(e)}",
            fileName=file.filename,
            totalRecords=0, processedRecords=0, newClients=0, newLoans=0, updatedLoans=0,
            errors=[str(e)]
        )
    finally:
        file.file.close()
    
    # Simulación de un procesamiento exitoso
    return schemas.ProcessResult(
        status='success',
        message=f"Archivo '{file.filename}' recibido y guardado correctamente. El procesamiento en segundo plano ha comenzado.",
        fileName=file.filename,
        totalRecords=158,
        processedRecords=158,
        newClients=12,
        newLoans=25,
        updatedLoans=121,
        errors=[]
    )