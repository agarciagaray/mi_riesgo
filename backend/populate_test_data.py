"""
Script para poblar la base de datos con datos de prueba realistas
"""
import random
from datetime import datetime, date, timedelta
from sqlalchemy.orm import sessionmaker
from database import engine
from models import Client, ClientDataHistory, ClientFlag, Loan, Payment

# Crear una sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def create_test_clients():
    """Crear clientes de prueba"""
    clients_data = [
        {
            "national_identifier": "123456780",
            "full_name": "Carlos Andrés García Martínez",
            "birth_date": date(1985, 3, 15)
        },
        {
            "national_identifier": "987654321", 
            "full_name": "María Elena Rodríguez López",
            "birth_date": date(1978, 11, 22)
        },
        {
            "national_identifier": "101010101",
            "full_name": "Juan Carlos Pérez Hernández", 
            "birth_date": date(1990, 7, 8)
        },
        {
            "national_identifier": "202020202",
            "full_name": "Ana Isabel Gutiérrez Silva",
            "birth_date": date(1983, 12, 5)
        },
        {
            "national_identifier": "303030303",
            "full_name": "Luis Fernando Morales Castro",
            "birth_date": date(1992, 4, 18)
        },
        {
            "national_identifier": "404040404",
            "full_name": "Carmen Rosa Jiménez Vega",
            "birth_date": date(1980, 9, 30)
        },
        {
            "national_identifier": "505050505",
            "full_name": "Roberto Carlos Sánchez Díaz",
            "birth_date": date(1987, 1, 12)
        },
        {
            "national_identifier": "606060606",
            "full_name": "Patricia Alejandra Torres Ruiz",
            "birth_date": date(1995, 6, 25)
        }
    ]
    
    clients = []
    for client_data in clients_data:
        # Verificar si el cliente ya existe
        existing_client = db.query(Client).filter(
            Client.national_identifier == client_data["national_identifier"]
        ).first()
        
        if not existing_client:
            client = Client(**client_data)
            db.add(client)
            db.commit()
            db.refresh(client)
            clients.append(client)
            print(f"Cliente creado: {client.full_name}")
        else:
            clients.append(existing_client)
            print(f"Cliente ya existe: {existing_client.full_name}")
    
    return clients

def create_client_data_history(clients):
    """Crear historial de datos para clientes"""
    addresses = [
        "Calle 123 #45-67, Bogotá",
        "Carrera 89 #12-34, Medellín", 
        "Avenida 56 #78-90, Cali",
        "Transversal 23 #45-12, Barranquilla",
        "Diagonal 67 #89-23, Bucaramanga"
    ]
    
    phones = [
        "3001234567", "3109876543", "3157891234", 
        "3204567890", "3013456789", "3128901234"
    ]
    
    domains = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"]
    
    for client in clients:
        # Crear historial de direcciones
        for i in range(random.randint(1, 3)):
            address_history = ClientDataHistory(
                client_id=client.id,
                data_type="address",
                value=random.choice(addresses),
                date_modified=datetime.utcnow() - timedelta(days=random.randint(0, 365))
            )
            db.add(address_history)
        
        # Crear historial de teléfonos
        for i in range(random.randint(1, 2)):
            phone_history = ClientDataHistory(
                client_id=client.id,
                data_type="phone", 
                value=random.choice(phones),
                date_modified=datetime.utcnow() - timedelta(days=random.randint(0, 365))
            )
            db.add(phone_history)
        
        # Crear historial de emails
        email = f"{client.full_name.lower().replace(' ', '.').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')}@{random.choice(domains)}"
        email_history = ClientDataHistory(
            client_id=client.id,
            data_type="email",
            value=email,
            date_modified=datetime.utcnow() - timedelta(days=random.randint(0, 365))
        )
        db.add(email_history)
    
    db.commit()

def create_client_flags(clients):
    """Crear banderas para algunos clientes"""
    flag_options = ["Fraude", "Robo de identidad", "Múltiples moras", "Cliente VIP", "Proceso jurídico"]
    
    # Asignar banderas específicas a ciertos clientes
    clients_with_flags = [
        (clients[1], ["Fraude", "Robo de identidad"]),  # María Elena (987654321)
        (clients[3], ["Proceso jurídico"]),              # Ana Isabel (202020202) 
        (clients[6], ["Múltiples moras"]),               # Roberto Carlos (505050505)
        (clients[4], ["Cliente VIP"])                    # Luis Fernando (303030303)
    ]
    
    for client, flags in clients_with_flags:
        for flag in flags:
            client_flag = ClientFlag(
                client_id=client.id,
                flag=flag
            )
            db.add(client_flag)
    
    db.commit()

def create_loans_and_payments(clients):
    """Crear préstamos y pagos para los clientes"""
    loan_statuses = ['Vigente', 'En Mora', 'Pagado', 'Castigado', 'En Jurídica', 'Embargo']
    modalities = ['Diario', 'Semanal', 'Quincenal', 'Mensual']
    company_ids = [1, 2]  # IDs de las empresas creadas
    
    for client in clients:
        # Cada cliente tendrá entre 1-4 préstamos
        num_loans = random.randint(1, 4)
        
        for _ in range(num_loans):
            # Configurar parámetros del préstamo
            original_amount = random.randint(500000, 10000000)  # 500K a 10M pesos
            origination_date = date.today() - timedelta(days=random.randint(30, 1095))  # Último 3 años
            modality = random.choice(modalities)
            installments = random.randint(6, 36)
            interest_rate = round(random.uniform(1.5, 4.5), 2)
            
            # Determinar estado del préstamo basado en el cliente
            if client.national_identifier == "987654321":  # María Elena
                status = "Castigado"
                current_balance = original_amount * 0.8  # Debe el 80%
            elif client.national_identifier == "202020202":  # Ana Isabel  
                status = "En Jurídica"
                current_balance = original_amount * 0.6  # Debe el 60%
            elif client.national_identifier == "505050505":  # Roberto Carlos
                status = "En Mora"
                current_balance = original_amount * 0.4  # Debe el 40%
            elif client.national_identifier == "123456780":  # Carlos Andrés
                status = "Vigente" 
                current_balance = original_amount * random.uniform(0.1, 0.8)  # Debe entre 10-80%
            else:
                status = random.choice(['Vigente', 'Pagado', 'En Mora'])
                if status == 'Pagado':
                    current_balance = 0
                else:
                    current_balance = original_amount * random.uniform(0.0, 0.9)
            
            loan = Loan(
                client_id=client.id,
                company_id=random.choice(company_ids),
                origination_date=origination_date,
                original_amount=original_amount,
                current_balance=current_balance,
                status=status,
                modality=modality,
                interest_rate=interest_rate,
                installments=installments,
                last_report_date=date.today()
            )
            
            db.add(loan)
            db.commit()
            db.refresh(loan)
            
            # Crear historial de pagos
            create_payment_history(loan, origination_date)
    
    db.commit()

def create_payment_history(loan, start_date):
    """Crear historial de pagos para un préstamo"""
    payment_amount = float(loan.original_amount) / loan.installments
    current_date = start_date
    
    # Calcular intervalo entre pagos
    if loan.modality == 'Diario':
        interval = timedelta(days=1)
    elif loan.modality == 'Semanal':
        interval = timedelta(weeks=1) 
    elif loan.modality == 'Quincenal':
        interval = timedelta(days=15)
    else:  # Mensual
        interval = timedelta(days=30)
    
    payments_made = 0
    total_payments_needed = int((float(loan.original_amount) - float(loan.current_balance)) / payment_amount)
    
    for installment in range(1, loan.installments + 1):
        expected_date = current_date
        
        # Determinar si el pago fue realizado
        if installment <= total_payments_needed:
            # Pago realizado
            actual_date = expected_date + timedelta(days=random.randint(0, 5))  # Puede pagar con hasta 5 días de retraso
            amount_paid = float(payment_amount * random.uniform(0.95, 1.05))  # Variación en monto
            days_late = max(0, (actual_date - expected_date).days)
            
            if days_late > 30:
                status = 'En Mora'
            else:
                status = 'Pagado'
        else:
            # Pago pendiente
            actual_date = None
            amount_paid = None
            days_late = max(0, (date.today() - expected_date).days)
            
            if days_late > 30:
                status = 'En Mora'
            else:
                status = 'Pendiente'
        
        payment = Payment(
            loan_id=loan.id,
            installment_number=installment,
            expected_payment_date=expected_date,
            actual_payment_date=actual_date,
            amount_paid=amount_paid,
            status=status,
            days_late=days_late
        )
        
        db.add(payment)
        current_date += interval
    
    db.commit()

def main():
    """Función principal para crear todos los datos de prueba"""
    print("🚀 Iniciando creación de datos de prueba...")
    
    try:
        # Crear clientes
        print("\n📝 Creando clientes...")
        clients = create_test_clients()
        
        # Crear historial de datos
        print("\n📋 Creando historial de datos de clientes...")
        create_client_data_history(clients)
        
        # Crear banderas
        print("\n🚩 Creando banderas de clientes...")
        create_client_flags(clients)
        
        # Crear préstamos y pagos
        print("\n💰 Creando préstamos y pagos...")
        create_loans_and_payments(clients)
        
        print("\n✅ ¡Datos de prueba creados exitosamente!")
        
        # Mostrar resumen
        print(f"\n📊 Resumen:")
        print(f"   - Clientes: {db.query(Client).count()}")
        print(f"   - Préstamos: {db.query(Loan).count()}")
        print(f"   - Pagos: {db.query(Payment).count()}")
        
    except Exception as e:
        print(f"❌ Error creando datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()