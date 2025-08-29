"""
Script de migración de datos para MIRIESGO v2
Poblar base de datos MySQL con datos iniciales
"""

import sys
import os
from datetime import datetime, date, timedelta
from passlib.context import CryptContext
from decimal import Decimal
import random

# Agregar path para importar database
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

from database import (
    SessionLocal, Company, User, Client, Loan, CreditReport,
    CompanyStatus, UserRole, LoanType, LoanStatus, PaymentBehavior,
    ReportType, RiskLevel, create_all_tables, test_connection
)

# ===============================================
# CONFIGURACIÓN
# ===============================================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Cifrar contraseña"""
    return pwd_context.hash(password)

# ===============================================
# DATOS INICIALES
# ===============================================

def get_initial_companies():
    """Datos iniciales de empresas"""
    return [
        {
            "name": "Banco Financiero Nacional",
            "nit": "900123456-1",
            "code": "001",
            "email": "info@bancofn.com",
            "phone": "+57 1 234 5678",
            "address": "Carrera 7 # 72-21, Bogotá",
            "website": "https://www.bancofn.com",
            "industry": "Servicios Financieros",
            "status": CompanyStatus.active
        },
        {
            "name": "Cooperativa de Crédito Unidos",
            "nit": "900654321-2",
            "code": "002",
            "email": "contacto@coopunidos.co",
            "phone": "+57 1 345 6789",
            "address": "Avenida El Dorado # 45-67, Bogotá",
            "website": "https://www.coopunidos.co",
            "industry": "Cooperativas Financieras",
            "status": CompanyStatus.active
        },
        {
            "name": "Microfinanciera Progreso",
            "nit": "900789123-3",
            "code": "003",
            "email": "atencion@progresomicro.com",
            "phone": "+57 2 456 7890",
            "address": "Calle 15 # 23-45, Cali",
            "website": "https://www.progresomicro.com",
            "industry": "Microfinanzas",
            "status": CompanyStatus.active
        },
        {
            "name": "Fintech Innovations SAS",
            "nit": "900456789-4",
            "code": "004",
            "email": "soporte@fintechinno.co",
            "phone": "+57 4 567 8901",
            "address": "Carrera 43A # 1-50, Medellín",
            "website": "https://www.fintechinno.co",
            "industry": "Tecnología Financiera",
            "status": CompanyStatus.active
        },
        {
            "name": "Corporación de Crédito Empresarial",
            "nit": "900321654-5",
            "code": "005",
            "email": "gerencia@corpempresarial.com",
            "phone": "+57 5 678 9012",
            "address": "Carrera 50 # 80-90, Barranquilla",
            "website": "https://www.corpempresarial.com",
            "industry": "Crédito Empresarial",
            "status": CompanyStatus.active
        }
    ]

def get_initial_users():
    """Datos iniciales de usuarios"""
    return [
        {
            "full_name": "Administrador del Sistema",
            "national_identifier": "80123456789",
            "email": "admin@miriesgo.com",
            "phone": "+57 300 123 4567",
            "password": "admin123",  # Se cifra en el script
            "role": UserRole.admin,
            "company_id": None  # Admin no tiene empresa
        },
        {
            "full_name": "Carlos Rodríguez Pérez",
            "national_identifier": "12345678901",
            "email": "carlos.rodriguez@bancofn.com",
            "phone": "+57 310 234 5678",
            "password": "manager123",
            "role": UserRole.manager,
            "company_id": 1  # Banco Financiero Nacional
        },
        {
            "full_name": "María González López",
            "national_identifier": "23456789012",
            "email": "maria.gonzalez@bancofn.com",
            "phone": "+57 311 345 6789",
            "password": "analyst123",
            "role": UserRole.analyst,
            "company_id": 1  # Banco Financiero Nacional
        },
        {
            "full_name": "Juan David Martínez",
            "national_identifier": "34567890123",
            "email": "juan.martinez@coopunidos.co",
            "phone": "+57 312 456 7890",
            "password": "manager123",
            "role": UserRole.manager,
            "company_id": 2  # Cooperativa de Crédito Unidos
        },
        {
            "full_name": "Ana Patricia Herrera",
            "national_identifier": "45678901234",
            "email": "ana.herrera@progresomicro.com",
            "phone": "+57 313 567 8901",
            "password": "analyst123",
            "role": UserRole.analyst,
            "company_id": 3  # Microfinanciera Progreso
        },
        {
            "full_name": "Luis Fernando Castro",
            "national_identifier": "56789012345",
            "email": "luis.castro@fintechinno.co",
            "phone": "+57 314 678 9012",
            "password": "manager123",
            "role": UserRole.manager,
            "company_id": 4  # Fintech Innovations SAS
        },
        {
            "full_name": "Sandra Milena Jiménez",
            "national_identifier": "67890123456",
            "email": "sandra.jimenez@corpempresarial.com",
            "phone": "+57 315 789 0123",
            "password": "analyst123",
            "role": UserRole.analyst,
            "company_id": 5  # Corporación de Crédito Empresarial
        }
    ]

def get_initial_clients():
    """Datos iniciales de clientes"""
    return [
        {
            "full_name": "Pedro José Ramírez Silva",
            "national_identifier": "10123456789",
            "birth_date": date(1985, 3, 15),
            "phone": "+57 320 111 2233",
            "email": "pedro.ramirez@email.com",
            "address": "Carrera 20 # 45-67, Apartamento 301",
            "city": "Bogotá",
            "department": "Cundinamarca",
            "occupation": "Ingeniero de Sistemas",
            "monthly_income": Decimal("4500000")
        },
        {
            "full_name": "Carmen Elena Vargas Moreno",
            "national_identifier": "20234567890",
            "birth_date": date(1990, 7, 22),
            "phone": "+57 321 222 3344",
            "email": "carmen.vargas@email.com",
            "address": "Calle 80 # 15-23, Casa 45",
            "city": "Medellín",
            "department": "Antioquia",
            "occupation": "Administradora de Empresas",
            "monthly_income": Decimal("3800000")
        },
        {
            "full_name": "Roberto Carlos Mendoza Torres",
            "national_identifier": "30345678901",
            "birth_date": date(1982, 11, 8),
            "phone": "+57 322 333 4455",
            "email": "roberto.mendoza@email.com",
            "address": "Avenida 6N # 28-45",
            "city": "Cali",
            "department": "Valle del Cauca",
            "occupation": "Contador Público",
            "monthly_income": Decimal("3200000")
        },
        {
            "full_name": "Isabella Sofía Restrepo Gómez",
            "national_identifier": "40456789012",
            "birth_date": date(1988, 4, 30),
            "phone": "+57 323 444 5566",
            "email": "isabella.restrepo@email.com",
            "address": "Carrera 35 # 70-80, Torre B, Apto 1205",
            "city": "Barranquilla",
            "department": "Atlántico",
            "occupation": "Médica Especialista",
            "monthly_income": Decimal("6200000")
        },
        {
            "full_name": "Diego Alejandro Ortiz Peña",
            "national_identifier": "50567890123",
            "birth_date": date(1975, 12, 14),
            "phone": "+57 324 555 6677",
            "email": "diego.ortiz@email.com",
            "address": "Calle 45 # 22-15, Local 3",
            "city": "Cartagena",
            "department": "Bolívar",
            "occupation": "Comerciante",
            "monthly_income": Decimal("2800000")
        }
    ]

def get_initial_loans():
    """Generar préstamos iniciales para los clientes"""
    loans = []
    
    # Cliente 1: Pedro José Ramírez Silva
    loans.extend([
        {
            "client_id": 1,
            "company_id": 1,
            "loan_number": "BFN-001-2023-001",
            "loan_type": LoanType.mortgage,
            "original_amount": Decimal("180000000"),
            "current_balance": Decimal("165000000"),
            "monthly_payment": Decimal("1200000"),
            "interest_rate": Decimal("12.5"),
            "start_date": date(2023, 1, 15),
            "end_date": date(2038, 1, 15),
            "last_payment_date": date(2024, 12, 15),
            "status": LoanStatus.active,
            "days_late": 0,
            "payment_behavior": PaymentBehavior.excellent,
            "collateral_type": "Vivienda",
            "collateral_value": Decimal("220000000")
        },
        {
            "client_id": 1,
            "company_id": 1,
            "loan_number": "BFN-001-2024-002",
            "loan_type": LoanType.vehicle,
            "original_amount": Decimal("45000000"),
            "current_balance": Decimal("32000000"),
            "monthly_payment": Decimal("850000"),
            "interest_rate": Decimal("15.2"),
            "start_date": date(2024, 3, 10),
            "end_date": date(2029, 3, 10),
            "last_payment_date": date(2024, 12, 10),
            "status": LoanStatus.active,
            "days_late": 0,
            "payment_behavior": PaymentBehavior.good,
            "collateral_type": "Vehículo",
            "collateral_value": Decimal("50000000")
        }
    ])
    
    # Cliente 2: Carmen Elena Vargas Moreno
    loans.extend([
        {
            "client_id": 2,
            "company_id": 2,
            "loan_number": "CCU-002-2023-001",
            "loan_type": LoanType.personal,
            "original_amount": Decimal("15000000"),
            "current_balance": Decimal("8500000"),
            "monthly_payment": Decimal("650000"),
            "interest_rate": Decimal("18.5"),
            "start_date": date(2023, 6, 20),
            "end_date": date(2026, 6, 20),
            "last_payment_date": date(2024, 12, 20),
            "status": LoanStatus.active,
            "days_late": 5,
            "payment_behavior": PaymentBehavior.regular,
            "collateral_type": None,
            "collateral_value": None
        }
    ])
    
    # Cliente 3: Roberto Carlos Mendoza Torres
    loans.extend([
        {
            "client_id": 3,
            "company_id": 3,
            "loan_number": "MP-003-2022-001",
            "loan_type": LoanType.commercial,
            "original_amount": Decimal("25000000"),
            "current_balance": Decimal("0"),
            "monthly_payment": Decimal("0"),
            "interest_rate": Decimal("22.0"),
            "start_date": date(2022, 4, 5),
            "end_date": date(2024, 4, 5),
            "last_payment_date": date(2024, 4, 5),
            "status": LoanStatus.paid,
            "days_late": 0,
            "payment_behavior": PaymentBehavior.excellent,
            "collateral_type": "Inventario",
            "collateral_value": Decimal("30000000")
        },
        {
            "client_id": 3,
            "company_id": 1,
            "loan_number": "BFN-003-2024-001",
            "loan_type": LoanType.credit_card,
            "original_amount": Decimal("8000000"),
            "current_balance": Decimal("3200000"),
            "monthly_payment": Decimal("400000"),
            "interest_rate": Decimal("28.5"),
            "start_date": date(2024, 8, 1),
            "end_date": date(2026, 8, 1),
            "last_payment_date": date(2024, 11, 30),
            "status": LoanStatus.active,
            "days_late": 30,
            "payment_behavior": PaymentBehavior.poor,
            "collateral_type": None,
            "collateral_value": None
        }
    ])
    
    # Cliente 4: Isabella Sofía Restrepo Gómez
    loans.extend([
        {
            "client_id": 4,
            "company_id": 4,
            "loan_number": "FI-004-2024-001",
            "loan_type": LoanType.personal,
            "original_amount": Decimal("30000000"),
            "current_balance": Decimal("22000000"),
            "monthly_payment": Decimal("1100000"),
            "interest_rate": Decimal("16.8"),
            "start_date": date(2024, 2, 14),
            "end_date": date(2027, 2, 14),
            "last_payment_date": date(2024, 12, 14),
            "status": LoanStatus.active,
            "days_late": 0,
            "payment_behavior": PaymentBehavior.excellent,
            "collateral_type": None,
            "collateral_value": None
        }
    ])
    
    # Cliente 5: Diego Alejandro Ortiz Peña
    loans.extend([
        {
            "client_id": 5,
            "company_id": 5,
            "loan_number": "CCE-005-2023-001",
            "loan_type": LoanType.commercial,
            "original_amount": Decimal("40000000"),
            "current_balance": Decimal("35000000"),
            "monthly_payment": Decimal("980000"),
            "interest_rate": Decimal("20.5"),
            "start_date": date(2023, 9, 10),
            "end_date": date(2028, 9, 10),
            "last_payment_date": date(2024, 11, 10),
            "status": LoanStatus.active,
            "days_late": 45,
            "payment_behavior": PaymentBehavior.critical,
            "collateral_type": "Local Comercial",
            "collateral_value": Decimal("60000000")
        }
    ])
    
    return loans

# ===============================================
# FUNCIONES DE MIGRACIÓN
# ===============================================

def migrate_companies(db):
    """Migrar empresas"""
    print("📊 Migrando empresas...")
    
    companies_data = get_initial_companies()
    created_count = 0
    
    for company_data in companies_data:
        # Verificar si ya existe
        existing = db.query(Company).filter(Company.nit == company_data["nit"]).first()
        if existing:
            print(f"  ⚠️ Empresa {company_data['name']} ya existe")
            continue
        
        company = Company(
            name=company_data["name"],
            nit=company_data["nit"],
            code=company_data["code"],
            email=company_data["email"],
            phone=company_data["phone"],
            address=company_data["address"],
            website=company_data["website"],
            industry=company_data["industry"],
            status=company_data["status"],
            created_user="migration_script"
        )
        
        db.add(company)
        created_count += 1
        print(f"  ✅ Creada: {company_data['name']}")
    
    db.commit()
    print(f"📊 {created_count} empresas migradas exitosamente")

def migrate_users(db):
    """Migrar usuarios"""
    print("👥 Migrando usuarios...")
    
    users_data = get_initial_users()
    created_count = 0
    
    for user_data in users_data:
        # Verificar si ya existe
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"  ⚠️ Usuario {user_data['email']} ya existe")
            continue
        
        user = User(
            full_name=user_data["full_name"],
            national_identifier=user_data["national_identifier"],
            email=user_data["email"],
            phone=user_data["phone"],
            password_hash=hash_password(user_data["password"]),
            role=user_data["role"],
            company_id=user_data["company_id"],
            is_active=True,
            created_user="migration_script"
        )
        
        db.add(user)
        created_count += 1
        print(f"  ✅ Creado: {user_data['full_name']} ({user_data['email']})")
    
    db.commit()
    print(f"👥 {created_count} usuarios migrados exitosamente")

def migrate_clients(db):
    """Migrar clientes"""
    print("👤 Migrando clientes...")
    
    clients_data = get_initial_clients()
    created_count = 0
    
    for client_data in clients_data:
        # Verificar si ya existe
        existing = db.query(Client).filter(Client.national_identifier == client_data["national_identifier"]).first()
        if existing:
            print(f"  ⚠️ Cliente {client_data['full_name']} ya existe")
            continue
        
        client = Client(
            full_name=client_data["full_name"],
            national_identifier=client_data["national_identifier"],
            birth_date=client_data["birth_date"],
            phone=client_data["phone"],
            email=client_data["email"],
            address=client_data["address"],
            city=client_data["city"],
            department=client_data["department"],
            occupation=client_data["occupation"],
            monthly_income=client_data["monthly_income"],
            created_user="migration_script"
        )
        
        db.add(client)
        created_count += 1
        print(f"  ✅ Creado: {client_data['full_name']}")
    
    db.commit()
    print(f"👤 {created_count} clientes migrados exitosamente")

def migrate_loans(db):
    """Migrar préstamos"""
    print("💰 Migrando préstamos...")
    
    loans_data = get_initial_loans()
    created_count = 0
    
    for loan_data in loans_data:
        # Verificar si ya existe
        existing = db.query(Loan).filter(Loan.loan_number == loan_data["loan_number"]).first()
        if existing:
            print(f"  ⚠️ Préstamo {loan_data['loan_number']} ya existe")
            continue
        
        loan = Loan(
            client_id=loan_data["client_id"],
            company_id=loan_data["company_id"],
            loan_number=loan_data["loan_number"],
            loan_type=loan_data["loan_type"],
            original_amount=loan_data["original_amount"],
            current_balance=loan_data["current_balance"],
            monthly_payment=loan_data["monthly_payment"],
            interest_rate=loan_data["interest_rate"],
            start_date=loan_data["start_date"],
            end_date=loan_data["end_date"],
            last_payment_date=loan_data["last_payment_date"],
            status=loan_data["status"],
            days_late=loan_data["days_late"],
            payment_behavior=loan_data["payment_behavior"],
            collateral_type=loan_data["collateral_type"],
            collateral_value=loan_data["collateral_value"],
            created_user="migration_script"
        )
        
        db.add(loan)
        created_count += 1
        print(f"  ✅ Creado: {loan_data['loan_number']}")
    
    db.commit()
    print(f"💰 {created_count} préstamos migrados exitosamente")

def generate_credit_reports(db):
    """Generar reportes crediticios de muestra"""
    print("📄 Generando reportes crediticios...")
    
    # Obtener algunos usuarios para generar reportes
    users = db.query(User).filter(User.role != UserRole.admin).limit(3).all()
    clients = db.query(Client).all()
    
    created_count = 0
    
    for i, client in enumerate(clients[:3]):  # Solo primeros 3 clientes
        if i < len(users):
            user = users[i]
            
            # Calcular estadísticas del cliente
            client_loans = db.query(Loan).filter(Loan.client_id == client.id).all()
            
            total_active_loans = len([l for l in client_loans if l.status == LoanStatus.active])
            total_debt = sum([l.current_balance for l in client_loans if l.status == LoanStatus.active])
            monthly_obligations = sum([l.monthly_payment for l in client_loans if l.status == LoanStatus.active])
            
            # Calcular score crediticio basado en comportamiento
            payment_behaviors = [l.payment_behavior for l in client_loans]
            if PaymentBehavior.excellent in payment_behaviors:
                credit_score = random.randint(750, 850)
                risk_level = RiskLevel.low
            elif PaymentBehavior.good in payment_behaviors:
                credit_score = random.randint(650, 750)
                risk_level = RiskLevel.medium
            elif PaymentBehavior.poor in payment_behaviors or PaymentBehavior.critical in payment_behaviors:
                credit_score = random.randint(300, 550)
                risk_level = RiskLevel.high
            else:
                credit_score = random.randint(550, 650)
                risk_level = RiskLevel.medium
            
            report = CreditReport(
                client_id=client.id,
                requested_by_user_id=user.id,
                requested_by_company_id=user.company_id,
                report_type=ReportType.detailed,
                credit_score=credit_score,
                risk_level=risk_level,
                total_active_loans=total_active_loans,
                total_debt_amount=total_debt,
                monthly_obligations=monthly_obligations,
                payment_history_score=credit_score - random.randint(0, 50),
                recent_inquiries=random.randint(1, 5),
                report_data={
                    "summary": f"Reporte crediticio completo para {client.full_name}",
                    "recommendations": ["Mantener historial de pagos", "Diversificar productos crediticios"],
                    "alerts": [] if risk_level == RiskLevel.low else ["Revisar capacidad de pago"]
                },
                observations=f"Cliente con {total_active_loans} créditos activos. Evaluación realizada el {datetime.now().strftime('%Y-%m-%d')}",
                created_user="migration_script"
            )
            
            db.add(report)
            created_count += 1
            print(f"  ✅ Reporte creado para: {client.full_name} (Score: {credit_score})")
    
    db.commit()
    print(f"📄 {created_count} reportes crediticios generados exitosamente")

# ===============================================
# FUNCIÓN PRINCIPAL DE MIGRACIÓN
# ===============================================

def run_migration():
    """Ejecutar migración completa"""
    print("🚀 Iniciando migración de datos MIRIESGO v2")
    print("=" * 60)
    
    # Verificar conexión
    if not test_connection():
        print("❌ Error: No se pudo conectar a la base de datos")
        return False
    
    # Crear tablas
    if not create_all_tables():
        print("❌ Error: No se pudieron crear las tablas")
        return False
    
    # Crear sesión
    db = SessionLocal()
    
    try:
        # Ejecutar migraciones en orden
        migrate_companies(db)
        migrate_users(db)
        migrate_clients(db)
        migrate_loans(db)
        generate_credit_reports(db)
        
        print("\n" + "=" * 60)
        print("✅ Migración completada exitosamente")
        print("\n📋 Resumen de datos migrados:")
        print(f"  • Empresas: {db.query(Company).count()}")
        print(f"  • Usuarios: {db.query(User).count()}")
        print(f"  • Clientes: {db.query(Client).count()}")
        print(f"  • Préstamos: {db.query(Loan).count()}")
        print(f"  • Reportes: {db.query(CreditReport).count()}")
        
        print("\n🔐 Credenciales de acceso:")
        print("  • Admin: admin@miriesgo.com / admin123")
        print("  • Manager: carlos.rodriguez@bancofn.com / manager123")
        print("  • Analyst: maria.gonzalez@bancofn.com / analyst123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()

# ===============================================
# EJECUCIÓN
# ===============================================

if __name__ == "__main__":
    success = run_migration()
    
    if success:
        print("\n🎉 ¡MIRIESGO v2 está listo para usar!")
    else:
        print("\n💥 La migración falló. Revise los errores anteriores.")
        sys.exit(1)