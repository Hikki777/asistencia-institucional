# Script para detener todos los servicios del sistema
# Sistema de Registro Institucional

Write-Host "================================" -ForegroundColor Red
Write-Host "  DETENIENDO SISTEMA" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host ""

# Detener todos los procesos de Node.js
Write-Host "[1/3] Deteniendo procesos Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Procesos Node.js detenidos: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "  ⓘ No hay procesos Node.js activos" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# Liberar puertos
Write-Host "[2/3] Liberando puertos 5000 y 5173..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port5000) {
    $port5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Write-Host "  ✓ Puerto 5000 liberado" -ForegroundColor Green
}

if ($port5173) {
    $port5173 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Write-Host "  ✓ Puerto 5173 liberado" -ForegroundColor Green
}

if (-not $port5000 -and -not $port5173) {
    Write-Host "  ⓘ Puertos ya estaban libres" -ForegroundColor Gray
}

# Verificación final
Write-Host "[3/3] Verificando limpieza..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

$remainingNodes = Get-Process -Name node -ErrorAction SilentlyContinue
$port5000Check = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5173Check = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

Write-Host ""
if (-not $remainingNodes -and -not $port5000Check -and -not $port5173Check) {
    Write-Host "================================" -ForegroundColor Green
    Write-Host "  ✓ SISTEMA DETENIDO" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
} else {
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host "  ⚠ ADVERTENCIA" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    if ($remainingNodes) {
        Write-Host "  Procesos Node.js aún activos: $($remainingNodes.Count)" -ForegroundColor Yellow
    }
    if ($port5000Check -or $port5173Check) {
        Write-Host "  Algunos puertos aún ocupados" -ForegroundColor Yellow
    }
}

Write-Host ""
