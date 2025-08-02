# app/api/routes/admin.py
from fastapi import APIRouter, File, UploadFile, BackgroundTasks, Depends
from ...services import file_processor_service

router = APIRouter()

@router.post("/files/upload")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    # Leer el contenido del archivo de forma asíncrona
    contents = await file.read()
    
    # Añadir la tarea pesada al fondo. La respuesta se envía INMEDIATAMENTE.
    background_tasks.add_task(file_processor_service.process_fixed_width_file, contents, file.filename)
    
    return {"message": f"El archivo '{file.filename}' ha sido recibido y se está procesando en segundo plano."}