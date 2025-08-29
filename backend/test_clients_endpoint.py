#!/usr/bin/env python3
"""
Script de prueba para verificar que el endpoint de clientes funciona correctamente.
"""

import requests
import json

def test_clients_endpoint():
    base_url = "http://127.0.0.1:8000"
    
    print("🔍 Probando endpoint de clientes...")
    
    # 1. Primero hacer login para obtener token
    print("\n1. 📝 Haciendo login...")
    login_data = {
        'username': 'admin@example.com',
        'password': '123456'
    }
    
    try:
        login_response = requests.post(
            f"{base_url}/api/auth/login",
            data=login_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result['access_token']
            print(f"✅ Login exitoso. Token obtenido: {token[:50]}...")
            
            # 2. Ahora probar el endpoint de clientes
            print("\n2. 👥 Probando endpoint de clientes...")
            headers = {
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            }
            
            clients_response = requests.get(
                f"{base_url}/api/clients/",
                headers=headers
            )
            
            if clients_response.status_code == 200:
                clients = clients_response.json()
                print(f"✅ Clientes obtenidos exitosamente. Total: {len(clients)}")
                
                # Mostrar algunos detalles de los primeros clientes
                for i, client in enumerate(clients[:3]):
                    print(f"   📋 Cliente {i+1}: {client['fullName']} (ID: {client['nationalIdentifier']})")
                
                if len(clients) > 3:
                    print(f"   ... y {len(clients) - 3} más")
                
            else:
                print(f"❌ Error al obtener clientes. Status: {clients_response.status_code}")
                print(f"   Respuesta: {clients_response.text}")
                
        else:
            print(f"❌ Error en login. Status: {login_response.status_code}")
            print(f"   Respuesta: {login_response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al servidor. ¿Está el backend ejecutándose en http://127.0.0.1:8000?")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    test_clients_endpoint()