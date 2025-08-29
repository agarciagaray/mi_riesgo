"""
Script de migración para SQLite - MIRIESGO v2
Popula SQLite con los mismos datos que MariaDB para modo fallback
"""

import sys
import os
from datetime import datetime, date
import bcrypt
from sqlalchemy import text

# Agregar path para importar database
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

from database import (
    SessionLocal, Company, User, Client, Loan, CreditReport,
    CompanyStatus, UserRole, LoanType, LoanStatus, PaymentBehavior,
    ReportType, RiskLevel, create_all_tables, test_connection
)

def hash_password(password: str) -> str:
    """Hashea una contraseña usando bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def migrate_sqlite():
    """Migra datos a SQLite"""
    print("🚀 MIGRACIÓN SQLITE - MIRIESGO v2")
    print("=" * 50)
    
    # Crear todas las tablas
    print("📦 Creando tablas...")
    create_all_tables()
    
    # Obtener sesión de base de datos
    db = SessionLocal()
    
    # Probar conexión básica
    try:
        db.execute(text("SELECT 1"))
        print("✅ Conexión a SQLite exitosa")
    except Exception as e:
        print(f"❌ Error de conexión a SQLite: {e}")
        return False
    
    try:
        print("📊 Verificando datos existentes...")
        
        # Verificar si ya hay datos
        existing_companies = db.query(Company).count()
        if existing_companies > 0:
            print(f"⚠️ Ya existen {existing_companies} empresas en SQLite")
            response = input("¿Desea sobrescribir los datos? (s/n): ")
            if response.lower() != 's':
                print("❌ Migración cancelada")
                return False
            
            # Limpiar datos existentes
            print("🧹 Limpiando datos existentes...")
            db.query(CreditReport).delete()
            db.query(Loan).delete()
            db.query(Client).delete()
            db.query(User).delete()
            db.query(Company).delete()
            db.commit()
        
        # 1. Insertar empresas
        print("📊 Insertando empresas...")
        companies_data = [
            Company(
                name="MiriEsGo Financial Corp",
                nit="900123456-1",
                code="001",
                email="info@miriesgo.com",
                phone="+57 1 234 5678",
                address="Carrera 7 # 72-21, Bogotá",
                website="https://www.miriesgo.com",
                industry="Servicios Financieros",
                status=CompanyStatus.active,
                created_user="admin"
            ),
            Company(
                name="Banco Financiero Nacional",
                nit="900654321-2",
                code="002",
                email="contacto@bancofn.com",
                phone="+57 1 345 6789",
                address="Avenida El Dorado # 45-67, Bogotá",
                website="https://www.bancofn.com",
                industry="Servicios Financieros",
                status=CompanyStatus.active,
                created_user="admin"
            ),
            Company(
                name="Cooperativa Unidos",
                nit="900789123-3",
                code="003",
                email="atencion@coopunidos.co",
                phone="+57 2 456 7890",
                address="Calle 15 # 23-45, Cali",
                website="https://www.coopunidos.co",
                industry="Cooperativas Financieras",
                status=CompanyStatus.active,
                created_user="admin"
            ),
            Company(
                name="Fintech Innovations SAS",
                nit="900456789-4",
                code="004",
                email="soporte@fintechinno.co",
                phone="+57 4 567 8901",
                address="Carrera 43A # 1-50, Medellín",
                website="https://www.fintechinno.co",
                industry="Tecnología Financiera",
                status=CompanyStatus.active,
                created_user="admin"
            )
        ]
        
        for company in companies_data:
            db.add(company)
        db.commit()
        print(f"✅ {len(companies_data)} empresas insertadas")
        
        # 2. Insertar usuarios
        print("👥 Insertando usuarios...")
        users_data = [
            User(
                full_name="Administrador Principal",
                national_identifier="80123456789",
                email="admin@miriesgo.com",
                phone="+57 300 123 4567",
                password_hash=hash_password("admin123"),
                role=UserRole.admin,
                company_id=None,
                is_active=True,
                created_user="admin"
            ),
            User(
                full_name="Ana García",
                national_identifier="12345678901",
                email="ana.garcia@miriesgo.com",
                phone="+57 310 234 5678",
                password_hash=hash_password("ana123"),
                role=UserRole.manager,
                company_id=1,
                is_active=True,
                created_user="admin"
            ),
            User(
                full_name="Carlos Rodríguez",
                national_identifier="23456789012",
                email="carlos.rodriguez@miriesgo.com",
                phone="+57 311 345 6789",
                password_hash=hash_password("carlos123"),
                role=UserRole.analyst,
                company_id=1,
                is_active=True,
                created_user="admin"
            ),
            User(
                full_name="María López",
                national_identifier="34567890123",
                email="maria.lopez@bancofn.com",
                phone="+57 312 456 7890",
                password_hash=hash_password("maria123"),
                role=UserRole.manager,
                company_id=2,
                is_active=True,
                created_user="admin"
            )
        ]
        
        for user in users_data:
            db.add(user)
        db.commit()
        print(f"✅ {len(users_data)} usuarios insertados")
        
        # 3. Insertar clientes
        print("🏢 Insertando clientes...")
        clients_data = [
            Client(
                full_name="Pedro José Ramírez Silva",
                national_identifier="10123456789",
                birth_date=date(1985, 3, 15),
                phone="+57 320 111 2233",
                email="pedro.ramirez@email.com",
                address="Carrera 20 # 45-67, Apartamento 301",
                city="Bogotá",
                department="Cundinamarca",
                occupation="Ingeniero de Sistemas",
                monthly_income=4500000.00,
                created_user="admin"
            ),
            Client(
                full_name="Carmen Elena Vargas Moreno",
                national_identifier="20234567890",
                birth_date=date(1990, 7, 22),
                phone="+57 321 222 3344",
                email="carmen.vargas@email.com",
                address="Calle 80 # 15-23, Casa 45",
                city="Medellín",
                department="Antioquia",
                occupation="Administradora de Empresas",
                monthly_income=3800000.00,
                created_user="admin"
            ),
            Client(
                full_name="Roberto Carlos Mendoza Torres",
                national_identifier="30345678901",
                birth_date=date(1982, 11, 8),
                phone="+57 322 333 4455",
                email="roberto.mendoza@email.com",
                address="Avenida 6N # 28-45",
                city="Cali",
                department="Valle del Cauca",
                occupation="Contador Público",
                monthly_income=5200000.00,
                created_user="admin"
            ),
            Client(
                full_name="Liliana Patricia Herrera Castro",
                national_identifier="40456789012",
                birth_date=date(1988, 5, 30),
                phone="+57 323 444 5566",
                email="liliana.herrera@email.com",
                address="Calle 85 # 12-34, Torre 2 Apt 405",
                city="Barranquilla",
                department="Atlántico",
                occupation="Doctora",
                monthly_income=6800000.00,
                created_user="admin"
            ),
            Client(
                full_name="Fernando Andrés Jiménez Ruiz",
                national_identifier="50567890123",
                birth_date=date(1979, 12, 18),
                phone="+57 324 555 6677",
                email="fernando.jimenez@email.com",
                address="Carrera 15 # 93-07, Oficina 302",
                city="Bucaramanga",
                department="Santander",
                occupation="Arquitecto",
                monthly_income=4200000.00,
                created_user="admin"
            )
        ]
        
        for client in clients_data:
            db.add(client)
        db.commit()
        print(f"✅ {len(clients_data)} clientes insertados")
        
        print("\n🎉 ¡Migración SQLite completada exitosamente!")
        print("\n📊 RESUMEN:")
        print("=" * 30)
        print(f"Empresas: {db.query(Company).count()}")
        print(f"Usuarios: {db.query(User).count()}")
        print(f"Clientes: {db.query(Client).count()}")
        
        print("\n🔐 CREDENCIALES DE ACCESO:")
        print("=" * 30)
        print("Email: admin@miriesgo.com")
        print("Password: admin123")
        print("Rol: ADMIN")
        
        print("\n✅ SQLite está listo para usar como fallback!")
        return True
        
    except Exception as e:
        print(f"❌ Error en migración: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = migrate_sqlite()
    if success:
        print("\n🔄 Reinicie el backend para usar los nuevos datos:")
        print("   cd backend && python -m uvicorn main:app --reload --port 8000")
    else:
        print("\n💥 La migración falló. Revise los errores anteriores.")