Write-Host "Configurando schema de base de datos..." -ForegroundColor Green

$username = "igdadmin"
$password = "`$User#Conec.2022`$"
$database = "miriesgo_v2"
$schemaFile = "database\schema.sql"

if (!(Test-Path $schemaFile)) {
    Write-Host "Error: No se encontro el archivo schema.sql" -ForegroundColor Red
    exit 1
}

Write-Host "Ejecutando schema SQL..." -ForegroundColor Yellow

Get-Content $schemaFile | mysql -u $username -p$password $database

if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema ejecutado exitosamente" -ForegroundColor Green
    
    Write-Host "Verificando tablas creadas:" -ForegroundColor Cyan
    $query = "SHOW TABLES;"
    echo $query | mysql -u $username -p$password $database
    
    Write-Host ""
    Write-Host "Base de datos configurada correctamente!" -ForegroundColor Green
    Write-Host "Siguiente paso: cd database && python migrate_data.py" -ForegroundColor Yellow
} else {
    Write-Host "Error ejecutando el schema" -ForegroundColor Red
}