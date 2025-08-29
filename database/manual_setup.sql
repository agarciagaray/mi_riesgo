-- ========================================
-- MIRIESGO v2 - Configuración Manual MySQL
-- ========================================

-- PASO 1: Conectarse a MySQL
-- Abrir Command Prompt o PowerShell y ejecutar:
-- mysql -u root -p
-- (Ingresa tu contraseña cuando se solicite)

-- PASO 2: Crear la base de datos
CREATE DATABASE IF NOT EXISTS miriesgo_v2 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;

-- PASO 3: Seleccionar la base de datos
USE miriesgo_v2;

-- PASO 4: Verificar que la base de datos fue creada
SHOW DATABASES;

-- PASO 5: Salir de MySQL
-- exit;

-- ========================================
-- SIGUIENTE: Ejecutar el script de schema
-- ========================================
-- Desde Command Prompt:
-- mysql -u root -p miriesgo_v2 < database/schema.sql

-- ========================================
-- CONFIGURAR .env
-- ========================================
-- Editar el archivo .env con tus credenciales:
-- DB_HOST=localhost
-- DB_PORT=3306
-- DB_NAME=miriesgo_v2
-- DB_USER=root
-- DB_PASSWORD=tu_contraseña_aquí