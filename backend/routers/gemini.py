import os
import json
from fastapi import APIRouter, Depends, HTTPException
import schemas, auth, models
from config import settings
from google.generativeai import GenerativeModel, configure
import google.generativeai as genai

# Configura la API de Google
try:
    # El nombre del SDK ha cambiado en versiones recientes.
    genai.configure(api_key=settings.API_KEY)
except Exception as e:
    print(f"Error al configurar la API de Google: {e}")
    # Esto no detendrá la aplicación, pero las llamadas a Gemini fallarán.

router = APIRouter()

@router.post("/risk-score", response_model=schemas.RiskScore)
async def calculate_risk_score(
    request: schemas.RiskScoreRequest,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Calcula el puntaje de riesgo de un cliente utilizando la API de Google Gemini.
    """
    if not settings.API_KEY or "TU_CLAVE_DE_API" in settings.API_KEY:
        raise HTTPException(status_code=500, detail="La API Key de Google Gemini no está configurada en el servidor.")
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo inicializar el modelo de IA: {e}")

    report_data = request.report
    
    # Simplificar el reporte para no exceder el límite de tokens
    simplified_report = {
        "client": {
            "birthDate": report_data.get("client", {}).get("birthDate"),
            "flags": report_data.get("client", {}).get("flags"),
        },
        "debtSummary": report_data.get("debtSummary"),
        "loans": [
            {
                "status": loan.get("status"),
                "originalAmount": loan.get("originalAmount"),
                "currentBalance": loan.get("currentBalance"),
                "paymentsSummary": f"{len([p for p in loan.get('payments', []) if p['status'] == 'Pagado'])} pagadas de {len(loan.get('payments', []))}"
            } for loan in report_data.get("loans", [])
        ]
    }
    
    prompt = f"""
    Eres un experto analista de riesgo crediticio para una entidad financiera en Colombia.
    Tu tarea es analizar el siguiente reporte de crédito y generar un puntaje de riesgo y una evaluación.
    
    El puntaje de riesgo debe estar en una escala de 300 a 850, donde:
    - 300-579: Muy Malo (Riesgo Muy Alto)
    - 580-669: Regular (Riesgo Alto)
    - 670-739: Bueno (Riesgo Medio)
    - 740-799: Muy Bueno (Riesgo Bajo)
    - 800-850: Excepcional (Riesgo Muy Bajo)
    
    Considera los siguientes factores: historial de pago, nivel de endeudamiento actual vs. original, estado de los créditos (especialmente si hay 'Castigado', 'En Jurídica' o 'Fraude'), y la cantidad de créditos. Las banderas de 'Fraude' o 'Robo de identidad' deben impactar muy negativamente el puntaje.
    
    Analiza estos datos:
    {json.dumps(simplified_report)}
    
    Devuelve tu respuesta ÚNICAMENTE en formato JSON, sin texto adicional antes o después del JSON.
    El JSON debe tener la siguiente estructura exacta:
    {{
      "score": <un número entero entre 300 y 850>,
      "assessment": "<Una de estas opciones: 'Muy Bajo', 'Bajo', 'Medio', 'Alto', 'Muy Alto'>",
      "reasoning": "<Una frase corta y concisa (máximo 15 palabras) que justifique el puntaje, ej: 'Excelente historial de pagos y bajo endeudamiento.'>"
    }}
    """

    try:
        response = model.generate_content(prompt)
        
        # Limpiar la respuesta para obtener solo el JSON
        json_text = response.text.strip().replace('```json', '').replace('```', '')
        
        result = json.loads(json_text)
        
        return schemas.RiskScore(**result)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="La respuesta de la IA no fue un JSON válido.")
    except Exception as e:
        print(f"Error llamando a la API de Gemini: {e}")
        raise HTTPException(status_code=503, detail=f"Error al comunicarse con el servicio de IA: {str(e)}")