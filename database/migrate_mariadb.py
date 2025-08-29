"""
Script de migración específico para MariaDB 11.8 - MIRIESGO v2
Evita problemas de autenticación usando conexión directa PyMySQL
"""

import pymysql
import getpass
from datetime import datetime
import bcrypt

def hash_password(password: str) -> str:
    """Hashea una contraseña usando bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def connect_to_mariadb():
    """Conecta directamente a MariaDB usando PyMySQL"""
    print("🔗 Configurando conexión a MariaDB 11.8...")
    
    # Solicitar credenciales interactivamente
    host = input("Host de MariaDB (default: localhost): ").strip() or "localhost"
    port = input("Puerto (default: 3306): ").strip() or "3306"
    user = input("Usuario de MariaDB: ").strip()
    password = getpass.getpass("Contraseña: ")
    database = input("Nombre de base de datos (default: miriesgo_v2): ").strip() or "miriesgo_v2"
    
    try:
        connection = pymysql.connect(
            host=host,
            port=int(port),
            user=user,
            password=password,
            database=database,
            charset='utf8mb4',
            autocommit=False,
            connect_timeout=30
        )
        print("✅ Conexión a MariaDB exitosa!")
        return connection
    except Exception as e:
        print(f"❌ Error conectando a MariaDB: {e}")
        return None

def migrate_data(connection):
    """Migra los datos iniciales a MariaDB"""
    print("\n🚀 Iniciando migración de datos...")
    
    cursor = connection.cursor()
    
    try:
        # 1. Insertar empresas
        print("📊 Insertando empresas...")
        companies_data = [
            ('MiriEsGo Financial Corp', '900123456-1', '001', 'info@miriesgo.com', '+57 1 234 5678', 'Carrera 7 # 72-21, Bogotá', 'https://www.miriesgo.com', 'Servicios Financieros', 'active', 'admin', datetime.now(), datetime.now()),
            ('Banco Financiero Nacional', '900654321-2', '002', 'contacto@bancofn.com', '+57 1 345 6789', 'Avenida El Dorado # 45-67, Bogotá', 'https://www.bancofn.com', 'Servicios Financieros', 'active', 'admin', datetime.now(), datetime.now()),
            ('Cooperativa Unidos', '900789123-3', '003', 'atencion@coopunidos.co', '+57 2 456 7890', 'Calle 15 # 23-45, Cali', 'https://www.coopunidos.co', 'Cooperativas Financieras', 'active', 'admin', datetime.now(), datetime.now()),
            ('Fintech Innovations SAS', '900456789-4', '004', 'soporte@fintechinno.co', '+57 4 567 8901', 'Carrera 43A # 1-50, Medellín', 'https://www.fintechinno.co', 'Tecnología Financiera', 'active', 'admin', datetime.now(), datetime.now())
        ]
        
        cursor.executemany("""
            INSERT INTO companies (name, nit, code, email, phone, address, website, industry, status, created_user, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, companies_data)
        print(f"✅ {len(companies_data)} empresas insertadas")
        
        # 2. Insertar usuarios
        print("👥 Insertando usuarios...")
        users_data = [
            ('Administrador Principal', '80123456789', 'admin@miriesgo.com', '+57 300 123 4567', hash_password('admin123'), 'admin', None, True, 'admin', datetime.now(), datetime.now()),
            ('Ana García', '12345678901', 'ana.garcia@miriesgo.com', '+57 310 234 5678', hash_password('ana123'), 'manager', 1, True, 'admin', datetime.now(), datetime.now()),
            ('Carlos Rodríguez', '23456789012', 'carlos.rodriguez@miriesgo.com', '+57 311 345 6789', hash_password('carlos123'), 'analyst', 1, True, 'admin', datetime.now(), datetime.now()),
            ('María López', '34567890123', 'maria.lopez@bancofn.com', '+57 312 456 7890', hash_password('maria123'), 'manager', 2, True, 'admin', datetime.now(), datetime.now())
        ]
        
        cursor.executemany("""
            INSERT INTO users (full_name, national_identifier, email, phone, password_hash, role, company_id, is_active, created_user, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, users_data)
        print(f"✅ {len(users_data)} usuarios insertados")
        
        # 3. Insertar clientes
        print("🏢 Insertando clientes...")
        clients_data = [
            ('Pedro José Ramírez Silva', '10123456789', '1985-03-15', '+57 320 111 2233', 'pedro.ramirez@email.com', 'Carrera 20 # 45-67, Apartamento 301', 'Bogotá', 'Cundinamarca', 'Ingeniero de Sistemas', 4500000.00, 'admin', datetime.now(), datetime.now()),
            ('Carmen Elena Vargas Moreno', '20234567890', '1990-07-22', '+57 321 222 3344', 'carmen.vargas@email.com', 'Calle 80 # 15-23, Casa 45', 'Medellín', 'Antioquia', 'Administradora de Empresas', 3800000.00, 'admin', datetime.now(), datetime.now()),
            ('Roberto Carlos Mendoza Torres', '30345678901', '1982-11-08', '+57 322 333 4455', 'roberto.mendoza@email.com', 'Avenida 6N # 28-45', 'Cali', 'Valle del Cauca', 'Contador Público', 5200000.00, 'admin', datetime.now(), datetime.now()),
            ('Liliana Patricia Herrera Castro', '40456789012', '1988-05-30', '+57 323 444 5566', 'liliana.herrera@email.com', 'Calle 85 # 12-34, Torre 2 Apt 405', 'Barranquilla', 'Atlántico', 'Doctora', 6800000.00, 'admin', datetime.now(), datetime.now()),
            ('Fernando Andrés Jiménez Ruiz', '50567890123', '1979-12-18', '+57 324 555 6677', 'fernando.jimenez@email.com', 'Carrera 15 # 93-07, Oficina 302', 'Bucaramanga', 'Santander', 'Arquitecto', 4200000.00, 'admin', datetime.now(), datetime.now())
        ]
        
        cursor.executemany("""
            INSERT INTO clients (full_name, national_identifier, birth_date, phone, email, address, city, department, occupation, monthly_income, created_user, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, clients_data)
        print(f"✅ {len(clients_data)} clientes insertados")
        
        # 4. Insertar préstamos de ejemplo
        print("💰 Insertando préstamos...")
        loans_data = [
            (1, 1, 'LOAN-001-2024', 'personal', 50000000.00, 45000000.00, 1250000.00, 12.5, '2023-01-15', '2027-01-15', '2024-07-15', 'active', 0, 'excellent', 'admin', datetime.now(), datetime.now()),
            (2, 2, 'LOAN-002-2024', 'vehicle', 35000000.00, 28000000.00, 875000.00, 14.8, '2023-06-10', '2027-06-10', '2024-07-10', 'active', 5, 'good', 'admin', datetime.now(), datetime.now()),
            (3, 1, 'LOAN-003-2024', 'mortgage', 120000000.00, 110000000.00, 1800000.00, 11.2, '2022-03-20', '2037-03-20', '2024-06-20', 'active', 15, 'regular', 'admin', datetime.now(), datetime.now()),
            (4, 3, 'LOAN-004-2024', 'commercial', 75000000.00, 65000000.00, 1950000.00, 16.5, '2023-09-05', '2027-09-05', '2024-07-05', 'active', 0, 'excellent', 'admin', datetime.now(), datetime.now())
        ]
        
        cursor.executemany("""
            INSERT INTO loans (client_id, company_id, loan_number, loan_type, original_amount, current_balance, monthly_payment, interest_rate, start_date, end_date, last_payment_date, status, days_late, payment_behavior, created_user, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, loans_data)
        print(f"✅ {len(loans_data)} préstamos insertados")
        
        # 5. Insertar reportes crediticios
        print("📋 Insertando reportes crediticios...")
        reports_data = [
            (1, 1, 1, 'detailed', 750, 'low', 1, 45000000.00, 1250000.00, 85, 2, '{"score": 750, "factors": ["Buen historial crediticio", "Ingresos estables"]}', 'Cliente con excelente comportamiento de pago', 'admin', datetime.now(), datetime.now()),
            (2, 1, 2, 'basic', 680, 'medium', 1, 28000000.00, 875000.00, 72, 1, '{"score": 680, "factors": ["Historial regular", "Atraso menor"]}', 'Cliente con comportamiento aceptable', 'admin', datetime.now(), datetime.now()),
            (3, 1, 1, 'detailed', 620, 'medium', 1, 110000000.00, 1800000.00, 68, 3, '{"score": 620, "factors": ["Alto endeudamiento", "Atrasos ocasionales"]}', 'Monitorear comportamiento de pago', 'admin', datetime.now(), datetime.now()),
            (4, 1, 3, 'commercial', 820, 'low', 1, 65000000.00, 1950000.00, 92, 0, '{"score": 820, "factors": ["Historial impecable", "Empresa sólida"]}', 'Cliente comercial de bajo riesgo', 'admin', datetime.now(), datetime.now())
        ]
        
        cursor.executemany("""
            INSERT INTO credit_reports (client_id, requested_by_user_id, requested_by_company_id, report_type, credit_score, risk_level, total_active_loans, total_debt_amount, monthly_obligations, payment_history_score, recent_inquiries, report_data, observations, created_user, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, reports_data)
        print(f"✅ {len(reports_data)} reportes crediticios insertados")
        
        # Confirmar transacción
        connection.commit()
        print("\n🎉 ¡Migración completada exitosamente!")
        
        # Mostrar resumen
        print("\n📊 RESUMEN DE MIGRACIÓN:")
        print("=" * 40)
        cursor.execute("SELECT COUNT(*) FROM companies")
        print(f"Empresas: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM users")
        print(f"Usuarios: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM clients")
        print(f"Clientes: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM loans")
        print(f"Préstamos: {cursor.fetchone()[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM credit_reports")
        print(f"Reportes: {cursor.fetchone()[0]}")
        
        print("\n🔐 CREDENCIALES DE ACCESO:")
        print("=" * 40)
        print("Email: admin@miriesgo.com")
        print("Password: admin123")
        print("Rol: ADMIN")
        
    except Exception as e:
        print(f"❌ Error en migración: {e}")
        connection.rollback()
        raise
    finally:
        cursor.close()

def main():
    """Función principal"""
    print("🚀 MIGRACIÓN MARIADB 11.8 - MIRIESGO v2")
    print("=" * 50)
    
    # Conectar a MariaDB
    connection = connect_to_mariadb()
    if not connection:
        print("💥 No se pudo conectar a MariaDB. Verifique sus credenciales.")
        return
    
    try:
        # Ejecutar migración
        migrate_data(connection)
        
        print("\n✅ Migración finalizada correctamente!")
        print("🔄 Reinicie el backend para usar la base de datos real:")
        print("   cd backend && python -m uvicorn main:app --reload --port 8000")
        
    except Exception as e:
        print(f"💥 Error durante la migración: {e}")
    finally:
        connection.close()
        print("\n🔌 Conexión cerrada.")

if __name__ == "__main__":
    main()