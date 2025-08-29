# ===============================================
# Script de configuracion MariaDB - MIRIESGO v2
# Configura usuario y permisos para la aplicacion
# ===============================================

Write-Host "CONFIGURACION MARIADB - MIRIESGO v2" -ForegroundColor Green
Write-Host "=" * 50

# Solicitar credenciales de root
$rootPassword = Read-Host "Ingrese la contrasena de root de MariaDB" -AsSecureString
$rootPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($rootPassword))

# Comandos SQL para configurar el usuario y base de datos
$sqlCommands = @"
-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS miriesgo_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- Crear usuario con autenticacion mysql_native_password
DROP USER IF EXISTS 'miriesgo_app'@'localhost';
CREATE USER 'miriesgo_app'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MiriEsGo2024!';

-- Otorgar permisos completos en la base de datos
GRANT ALL PRIVILEGES ON miriesgo_v2.* TO 'miriesgo_app'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Verificar usuario creado
SELECT User, Host, plugin FROM mysql.user WHERE User = 'miriesgo_app';

-- Mostrar bases de datos
SHOW DATABASES;
"@

try {
    Write-Host "Conectando a MariaDB..." -ForegroundColor Yellow
    
    # Escribir comandos a un archivo temporal
    $tempSQLFile = "$env:TEMP\mariadb_config.sql"
    $sqlCommands | Out-File -FilePath $tempSQLFile -Encoding UTF8
    
    # Ejecutar comandos SQL
    & mysql -u root -p"$rootPasswordText" < $tempSQLFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Configuracion de MariaDB exitosa!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "NUEVA CONFIGURACION:" -ForegroundColor Cyan
        Write-Host "Usuario: miriesgo_app"
        Write-Host "Contrasena: MiriEsGo2024!"
        Write-Host "Base de datos: miriesgo_v2"
        Write-Host "Autenticacion: mysql_native_password"
        
        Write-Host ""
        Write-Host "ACTUALIZAR .env:" -ForegroundColor Yellow
        Write-Host "DB_USER=miriesgo_app"
        Write-Host "DB_PASSWORD=MiriEsGo2024!"
        
        Write-Host ""
        Write-Host "Siguiente paso: Actualizar .env y reiniciar backend" -ForegroundColor Magenta
        
    } else {
        Write-Host "Error en la configuracion" -ForegroundColor Red
    }
    
    # Limpiar archivo temporal
    Remove-Item -Path $tempSQLFile -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Script completado" -ForegroundColor Green