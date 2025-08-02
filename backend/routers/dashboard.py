from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas, auth, models, crud
from database import get_db

router = APIRouter()

@router.get("", response_model=schemas.DashboardResponse)
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """
    Endpoint para obtener los datos consolidados del dashboard.
    NOTA: Esta es una implementación SIMULADA. En un entorno real,
    estas consultas serían complejas y estarían optimizadas.
    """

    # --- Simulación de datos generales ---
    total_clients = db.query(models.Client).count()
    clients_with_arrears = db.query(models.Loan.client_id).filter(models.Loan.status.in_(['En Mora', 'Castigado'])).distinct().count()
    clients_in_legal = db.query(models.Loan.client_id).filter(models.Loan.status.in_(['En Jurídica', 'Embargo'])).distinct().count()
    active_clients_up_to_date = total_clients - clients_with_arrears - clients_in_legal

    general_data = schemas.GeneralDashboardData(
        total_clients=total_clients,
        active_clients_up_to_date=active_clients_up_to_date,
        clients_with_arrears=clients_with_arrears,
        clients_in_legal=clients_in_legal,
        mora_distribution={
            "1-30": 120, "31-60": 75, "61-90": 40, "91+": 25
        } # Datos simulados
    )

    # --- Simulación de datos por empresa ---
    all_companies = crud.get_all_companies(db)
    company_data = []
    for company in all_companies:
        company_clients = db.query(models.Loan.client_id).filter(models.Loan.company_id == company.id).distinct().count()
        company_data.append(schemas.CompanyAnalyticsData(
            company=schemas.CompanySchema.from_orm(company),
            total_clients=company_clients,
            active_clients_up_to_date=int(company_clients * 0.8), # Simulado
            clients_with_arrears=int(company_clients * 0.15), # Simulado
            clients_in_legal=int(company_clients * 0.05), # Simulado
            mora_distribution={ "1-30": 30, "31-60": 15, "61-90": 8, "91+": 5 } # Simulado
        ))

    return schemas.DashboardResponse(general=general_data, company=company_data)