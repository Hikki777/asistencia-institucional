#!/usr/bin/env pwsh
# Script para detener el Sistema de Registro Institucional
# Uso: .\stop-system.ps1

$ErrorActionPreference = "Continue"

Write-Host "`n🛑 Deteniendo Sistema de Registro Institucional`n" -ForegroundColor Yellow

# Ver jobs actuales
$jobs = Get-Job -Name Backend,Frontend -ErrorAction SilentlyContinue

if ($jobs.Count -eq 0) {
    Write-Host "ℹ️  No hay jobs en ejecución" -ForegroundColor Cyan
    Write-Host "`nBuscando procesos Node..." -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "⚠️  Encontrados $($nodeProcesses.Count) proceso(s) Node" -ForegroundColor Yellow
        $confirm = Read-Host "¿Detener todos los procesos Node? (y/n)"
        if ($confirm -eq 'y') {
            $nodeProcesses | Stop-Process -Force
            Write-Host "✅ Procesos Node detenidos" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ No hay procesos Node en ejecución" -ForegroundColor Green
    }
    
    exit 0
}

Write-Host "📊 Jobs encontrados:" -ForegroundColor Cyan
$jobs | Format-Table Id,Name,State -AutoSize

# Detener jobs
Write-Host "`n🛑 Deteniendo jobs..." -ForegroundColor Yellow
foreach ($job in $jobs) {
    Write-Host "   Deteniendo $($job.Name)..." -NoNewline
    Stop-Job -Id $job.Id -Force | Out-Null
    Remove-Job -Id $job.Id -Force | Out-Null
    Write-Host " ✅" -ForegroundColor Green
}

# Verificar que no queden jobs
Start-Sleep -Milliseconds 500
$remaining = Get-Job -Name Backend,Frontend -ErrorAction SilentlyContinue
if ($remaining.Count -gt 0) {
    Write-Host "`n⚠️  Algunos jobs no se detuvieron, forzando..." -ForegroundColor Yellow
    $remaining | Stop-Job -Force | Out-Null
    $remaining | Remove-Job -Force | Out-Null
}

Write-Host "`n✅ Sistema detenido correctamente`n" -ForegroundColor Green

# Verificar puertos
Write-Host "🔍 Verificando puertos..." -ForegroundColor Cyan
$ports = @{
    "Backend"  = 5000
    "Frontend" = 5173
}

foreach ($service in $ports.Keys) {
    $port = $ports[$service]
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 1 -ErrorAction Stop
        Write-Host "   ⚠️  $service aún responde en puerto $port" -ForegroundColor Yellow
    }
    catch {
        Write-Host "   ✅ Puerto $port libre ($service)" -ForegroundColor Green
    }
}

Write-Host "`n📝 Para reiniciar el sistema:" -ForegroundColor Cyan
Write-Host "   .\start-system.ps1`n" -ForegroundColor White
