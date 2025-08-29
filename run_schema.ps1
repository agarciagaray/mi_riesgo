# Script para ejecutar schema SQL en MariaDB/MySQL
Write-Host "🗄️ Configurando schema de base de datos..." -ForegroundColor Green

$username = "igdladmin"
$password = "`$User#Conec.2022`$"  # Escapar caracteres especiales
$database = "miriesgo_v2"
$schemaFile = "database\schema.sql"

# Verificar que el archivo existe
if (!(Test-Path $schemaFile)) {
    Write-Host "❌ No se encontró el archivo $schemaFile" -ForegroundColor Red
    exit 1
}

# Ejecutar el script SQL
try {
    Write-Host "📊 Ejecutando schema SQL..." -ForegroundColor Yellow
    
    # Usar Get-Content para leer el archivo y pasarlo a mysql
    Get-Content $schemaFile | mysql -u $username -p$password $database
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Schema ejecutado exitosamente" -ForegroundColor Green
        
        # Verificar las tablas creadas
        Write-Host "📋 Verificando tablas creadas:" -ForegroundColor Cyan
        $query = "SHOW TABLES;"
        echo $query | mysql -u $username -p$password $database
        
        Write-Host "`n🎉 ¡Base de datos configurada correctamente!" -ForegroundColor Green
        Write-Host "📌 Siguiente paso: Ejecutar migración de datos" -ForegroundColor Yellow
        Write-Host "   Comando: cd database && python migrate_data.py" -ForegroundColor White
    } else {
        Write-Host "❌ Error ejecutando el schema" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}