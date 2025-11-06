# Script para ver logs de backend y frontend
# Sistema de Registro Institucional

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("backend", "frontend", "ambos")]
    [string]$Servicio = "ambos"
)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  LOGS DEL SISTEMA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Obtener todos los jobs activos
$jobs = Get-Job -State Running -ErrorAction SilentlyContinue

if (-not $jobs) {
    Write-Host "⚠️  No hay servicios activos" -ForegroundColor Yellow
    Write-Host "Inicia el sistema primero con: .\start-all.ps1" -ForegroundColor Gray
    Write-Host ""
    exit
}

Write-Host "Jobs activos:" -ForegroundColor Green
$jobs | ForEach-Object {
    Write-Host "  ID: $($_.Id) - Estado: $($_.State)" -ForegroundColor Gray
}
Write-Host ""

if ($Servicio -eq "backend" -or $Servicio -eq "ambos") {
    Write-Host "=== BACKEND LOGS ===" -ForegroundColor Magenta
    Write-Host ""
    $backendJob = $jobs | Select-Object -First 1
    if ($backendJob) {
        Receive-Job -Id $backendJob.Id -Keep
    }
    Write-Host ""
}

if ($Servicio -eq "frontend" -or $Servicio -eq "ambos") {
    Write-Host "=== FRONTEND LOGS ===" -ForegroundColor Cyan
    Write-Host ""
    $frontendJob = $jobs | Select-Object -Last 1
    if ($frontendJob) {
        Receive-Job -Id $frontendJob.Id -Keep
    }
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Comandos útiles:" -ForegroundColor Cyan
Write-Host "  Ver solo backend:  .\ver-logs.ps1 -Servicio backend" -ForegroundColor Gray
Write-Host "  Ver solo frontend: .\ver-logs.ps1 -Servicio frontend" -ForegroundColor Gray
Write-Host "  Ver ambos:         .\ver-logs.ps1" -ForegroundColor Gray
Write-Host ""
