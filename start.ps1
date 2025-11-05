#!/usr/bin/env pwsh
# Script simple para iniciar backend y frontend simultaneamente
# Uso: .\start.ps1

Write-Host "`nIniciando Sistema de Asistencias QR`n" -ForegroundColor Green

# Limpiar jobs anteriores
Get-Job -Name Backend,Frontend -ErrorAction SilentlyContinue | Stop-Job
Get-Job -Name Backend,Frontend -ErrorAction SilentlyContinue | Remove-Job

# Iniciar Backend
Write-Host "Iniciando Backend..." -ForegroundColor Cyan
$backend = Start-Job -Name Backend -ScriptBlock {
    Set-Location $using:PWD
    node backend/server.js
}

# Esperar un poco
Start-Sleep -Seconds 6

# Iniciar Frontend
Write-Host "Iniciando Frontend..." -ForegroundColor Cyan
$frontend = Start-Job -Name Frontend -ScriptBlock {
    Set-Location (Join-Path $using:PWD "frontend-react")
    npm run dev
}

Start-Sleep -Seconds 3

Write-Host "`n=======================================" -ForegroundColor Green
Write-Host "SISTEMA INICIADO" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

Write-Host "`nURLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White

Write-Host "`nCredenciales:" -ForegroundColor Cyan
Write-Host "  Email:    admin@test.edu" -ForegroundColor White
Write-Host "  Password: admin" -ForegroundColor White

Write-Host "`nEstado:" -ForegroundColor Cyan
Get-Job | Format-Table Name,State -AutoSize

Write-Host "`nComandos:" -ForegroundColor Cyan
Write-Host "  Ver logs backend:  Receive-Job -Name Backend -Keep" -ForegroundColor Gray
Write-Host "  Ver logs frontend: Receive-Job -Name Frontend -Keep" -ForegroundColor Gray
Write-Host "  Detener todo:      .\stop-system.ps1`n" -ForegroundColor Gray
