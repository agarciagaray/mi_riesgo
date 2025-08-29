@echo off
echo ========================================
echo    MIRIESGO v2 - Configuracion MySQL
echo ========================================
echo.

REM Verificar si MySQL está instalado
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL no encontrado en el PATH del sistema
    echo 📋 Instrucciones:
    echo    1. Instalar MySQL desde: https://dev.mysql.com/downloads/installer/
    echo    2. Agregar MySQL al PATH del sistema
    echo    3. Ejecutar este script nuevamente
    pause
    exit /b 1
)

echo ✅ MySQL encontrado en el sistema
echo.

REM Configurar variables
set DB_NAME=miriesgo_v2

REM Solicitar credenciales
echo 🔑 Configuración de acceso a MySQL:
set /p DB_USER="    Usuario MySQL: "
set /p DB_PASSWORD="    Contraseña (Enter si está vacía): "

REM Configurar parámetro de contraseña
if "%DB_PASSWORD%"=="" (
    set "DB_PASSWORD_PARAM="
) else (
    set "DB_PASSWORD_PARAM=-p%DB_PASSWORD%"
)

echo.
echo 🚀 Creando base de datos %DB_NAME%...
echo.

REM Crear base de datos usando el script SQL
mysql -u %DB_USER% %DB_PASSWORD_PARAM% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error creando la base de datos
    echo 💡 Verifica que MySQL esté corriendo y las credenciales sean correctas
    pause
    exit /b 1
)

echo ✅ Base de datos %DB_NAME% creada exitosamente
echo.

REM Ejecutar script de schema
echo 📊 Ejecutando script de schema...
mysql -u %DB_USER% %DB_PASSWORD_PARAM% %DB_NAME% < database\schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error ejecutando script de schema
    pause
    exit /b 1
)

echo ✅ Schema creado exitosamente
echo.

REM Actualizar archivo .env
echo 🔧 Configurando archivo .env...
(
echo # Configuración de Base de Datos MySQL para MIRIESGO v2
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_NAME=%DB_NAME%
echo DB_USER=%DB_USER%
echo DB_PASSWORD=%DB_PASSWORD%
echo.
echo # Configuración de la Aplicación
echo SECRET_KEY=miriesgo_v2_secret_key_change_in_production_2024
echo ACCESS_TOKEN_EXPIRE_MINUTES=480
echo.
echo # Configuración de Entorno
echo ENVIRONMENT=development
echo DEBUG=true
) > .env

echo ✅ Archivo .env configurado
echo.

echo 🎉 ¡Configuración completada exitosamente!
echo.
echo 📋 Siguiente paso: Ejecutar migración de datos
echo    Comando: cd database ^&^& python migrate_data.py
echo.
pause