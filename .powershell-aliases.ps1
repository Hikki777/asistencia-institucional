# Aliases de PowerShell para el proyecto
# Importa este archivo en tu perfil de PowerShell para usarlos globalmente
# Para importar: Add-Content $PROFILE ". 'C:\Users\Kevin\Documents\Proyectos\Sistema de Registro Institucional\.powershell-aliases.ps1'"

# Función para hacer requests HTTP de forma simple y sin problemas de proxy
function Test-Backend {
    param(
        [string]$Url = "http://localhost:5000/api/health"
    )
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Backend respondiendo correctamente" -ForegroundColor Green
        return $response | ConvertTo-Json
    } catch {
        Write-Host "❌ Backend no responde: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Test-Frontend {
    param(
        [string]$Url = "http://localhost:5173"
    )
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Frontend respondiendo correctamente" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Frontend no responde: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Get-SystemStatus {
    Write-Host "`n🔍 Verificando estado del sistema..." -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    
    Write-Host "`n📦 Backend (puerto 5000):" -ForegroundColor Yellow
    Test-Backend | Out-Null
    
    Write-Host "`n🎨 Frontend (puerto 5173):" -ForegroundColor Yellow
    Test-Frontend | Out-Null
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
}

# Alias cortos
Set-Alias -Name backend-test -Value Test-Backend
Set-Alias -Name frontend-test -Value Test-Frontend
Set-Alias -Name status -Value Get-SystemStatus

Write-Host "✅ Aliases cargados: backend-test, frontend-test, status" -ForegroundColor Green
