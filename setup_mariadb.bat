@echo off
chcp 65001 >nul
echo ========================================
echo   MIRIESGO v2 - Configuracion MariaDB 11.8
echo ========================================
echo.

REM Configurar ruta específica de MariaDB
set "MARIADB_PATH=C:\Program Files\MariaDB 11.8\bin"
set "PATH=%MARIADB_PATH%;%PATH%"

REM Verificar si MariaDB está accesible
"%MARIADB_PATH%\mysql.exe" --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ No se pudo acceder a MariaDB en: %MARIADB_PATH%
    echo 💡 Verifica que MariaDB esté instalado en esa ruta
    pause
    exit /b 1
)

echo ✅ MariaDB 11.8 encontrado en: %MARIADB_PATH%
echo.

REM Configurar variables
set DB_NAME=miriesgo_v2

REM Solicitar credenciales
echo 🔑 Configuración de acceso a MariaDB:
set /p DB_USER="    Usuario MariaDB: "
set /p DB_PASSWORD="    Contraseña (Enter si está vacía): "

REM Configurar parámetro de contraseña
if "%DB_PASSWORD%"=="" (
    set "DB_PASSWORD_PARAM="
) else (
    set "DB_PASSWORD_PARAM=-p%DB_PASSWORD%"
)

echo.
echo 🚀 Probando conexión a MariaDB...

REM Probar conexión
"%MARIADB_PATH%\mysql.exe" -u %DB_USER% %DB_PASSWORD_PARAM% -e "SELECT VERSION();"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error de conexión a MariaDB
    echo 💡 Verifica usuario y contraseña
    echo 💡 ¿El servicio MariaDB está iniciado?
    pause
    exit /b 1
)

echo ✅ Conexión exitosa a MariaDB
echo.

echo 🗄️ Creando base de datos %DB_NAME%...
"%MARIADB_PATH%\mysql.exe" -u %DB_USER% %DB_PASSWORD_PARAM% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error creando la base de datos
    pause
    exit /b 1
)

echo ✅ Base de datos %DB_NAME% creada exitosamente
echo.

echo 📊 Ejecutando script de schema...
"%MARIADB_PATH%\mysql.exe" -u %DB_USER% %DB_PASSWORD_PARAM% %DB_NAME% < database\schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error ejecutando script de schema
    echo 💡 Verifica que el archivo database\schema.sql existe
    pause
    exit /b 1
)

echo ✅ Schema ejecutado exitosamente
echo.

echo 📋 Verificando tablas creadas...
"%MARIADB_PATH%\mysql.exe" -u %DB_USER% %DB_PASSWORD_PARAM% %DB_NAME% -e "SHOW TABLES;"

echo.
echo 🔧 Configurando archivo .env...
(
echo # Configuración de Base de Datos MariaDB para MIRIESGO v2
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
echo.
echo # Configuración de Archivos
echo UPLOAD_FOLDER=uploads
echo MAX_FILE_SIZE=50MB
echo.
echo # Configuración de Logs
echo LOG_LEVEL=INFO
echo LOG_FILE=logs/miriesgo.log
) > .env

echo ✅ Archivo .env configurado con tus credenciales
echo.

echo 🎉 ¡Configuración de MariaDB completada exitosamente!
echo.
echo 📋 Próximos pasos:
echo    1. Ejecutar migración de datos: cd database ^&^& python migrate_data.py
echo    2. Activar endpoints en backend\main.py
echo    3. Reiniciar el backend para usar la base de datos real
echo.
pause