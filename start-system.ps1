#!/usr/bin/env pwsh
# Script de inicio rápido para Sistema de Registro Institucional
# Uso: .\start-system.ps1

$ErrorActionPreference = "Continue"

Write-Host "`nIniciando Sistema de Registro Institucional`n" -ForegroundColor Green

# Verificar directorio
if (-not (Test-Path "backend/server.js")) {
    Write-Host "Error: Ejecutar desde la raiz del proyecto" -ForegroundColor Red
    exit 1
}

# Limpiar jobs anteriores
Write-Host "Limpiando jobs anteriores..." -ForegroundColor Yellow
Get-Job -Name Backend,Frontend -ErrorAction SilentlyContinue | Stop-Job
Get-Job -Name Backend,Frontend -ErrorAction SilentlyContinue | Remove-Job

# Iniciar Backend
Write-Host "`nIniciando Backend (Express + Prisma)..." -ForegroundColor Cyan
$backendJob = Start-Job -Name Backend -ScriptBlock {
    Set-Location $using:PWD
    node backend/server.js
}
Start-Sleep -Seconds 5

# Verificar Backend
Write-Host "Verificando Backend..." -ForegroundColor Yellow
$backendOK = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp) {
            $backendOK = $true
            break
        }
    }
    catch {
        if ($i -lt 9) {
            Write-Host "  Esperando... ($($i+1)/10)" -ForegroundColor Gray
            Start-Sleep -Seconds 1
        }
    }
}

if (-not $backendOK) {
    Write-Host "Backend no respondio" -ForegroundColor Red
    Receive-Job -Name Backend | Select-Object -Last 20
    Stop-Job -Name Backend | Out-Null
    Remove-Job -Name Backend | Out-Null
    exit 1
}

Write-Host "Backend operativo en http://localhost:5000" -ForegroundColor Green

# Iniciar Frontend
Write-Host "Iniciando Frontend (React + Vite)..." -ForegroundColor Cyan
$frontendJob = Start-Job -Name Frontend -ScriptBlock {
    Set-Location (Join-Path $using:PWD "frontend-react")
    npm run dev
}
Start-Sleep -Seconds 5

# Verificar Frontend
Write-Host "Verificando Frontend..." -ForegroundColor Yellow
$frontendOK = $false
for ($i = 0; $i -lt 5; $i++) {
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:5173" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp) {
            $frontendOK = $true
            break
        }
    }
    catch {
        if ($i -lt 4) {
            Start-Sleep -Seconds 1
        }
    }
}

if ($frontendOK) {
    Write-Host "Frontend operativo en http://localhost:5173`n" -ForegroundColor Green
} else {
    Write-Host "Frontend aun iniciando (esto es normal)`n" -ForegroundColor Yellow
}

# Resumen
Write-Host "=======================================" -ForegroundColor Green
Write-Host "SISTEMA INICIADO CORRECTAMENTE" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

Write-Host "`nURLs:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend:  http://localhost:5000/api" -ForegroundColor White
Write-Host "   - Health:   http://localhost:5000/api/health" -ForegroundColor White

Write-Host "`nCredenciales:" -ForegroundColor Cyan
Write-Host "   - Email:    admin@test.edu" -ForegroundColor White
Write-Host "   - Password: admin" -ForegroundColor White

Write-Host "`nEstado de Jobs:" -ForegroundColor Cyan
Get-Job | Format-Table Id,Name,State -AutoSize

Write-Host "`nComandos utiles:" -ForegroundColor Cyan
Write-Host "   - Ver logs backend:   Receive-Job -Name Backend -Keep | Select-Object -Last 50" -ForegroundColor Gray
Write-Host "   - Ver logs frontend:  Receive-Job -Name Frontend -Keep | Select-Object -Last 50" -ForegroundColor Gray
Write-Host "   - Detener todo:       Stop-Job Backend,Frontend; Remove-Job Backend,Frontend" -ForegroundColor Gray
Write-Host "   - Tests:              node test.js" -ForegroundColor Gray
Write-Host "   - Tests auth:         node test-auth.js`n" -ForegroundColor Gray

Write-Host "📚 Documentacion: GUIA_RAPIDA.md | ESTADO_ACTUAL.md`n" -ForegroundColor Cyan

# Abrir navegador
Write-Host "Abriendo navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "`nListo para usar!`n" -ForegroundColor Green
