# start-auto.ps1 - Inicia el sistema automáticamente sin ventanas externas
# Libera puertos automáticamente y ejecuta todo en segundo plano

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  INICIANDO SISTEMA" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Función para liberar un puerto específico
function Free-Port {
    param([int]$Port)
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connections) {
        Write-Host "[*] Liberando puerto $Port..." -ForegroundColor Yellow
        
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        
        foreach ($processId in $processIds) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Proceso $processId detenido" -ForegroundColor Green
            } catch {
                Write-Host "  ! No se pudo detener proceso $processId" -ForegroundColor Red
            }
        }
        
        Start-Sleep -Milliseconds 500
        return $true
    }
    
    return $false
}

# Función para verificar si un puerto está libre
function Test-PortFree {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return ($null -eq $connection)
}

# Paso 1: Liberar puertos automáticamente
Write-Host "[1/3] Verificando y liberando puertos..." -ForegroundColor Cyan

$freedBackend = Free-Port -Port 5000
$freedFrontend = Free-Port -Port 5173

if ($freedBackend -or $freedFrontend) {
    Write-Host "  ⏳ Esperando a que los puertos se liberen completamente..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

# Verificar que los puertos estén libres
$backendFree = Test-PortFree -Port 5000
$frontendFree = Test-PortFree -Port 5173

if (-not $backendFree) {
    Write-Host "  ✗ Puerto 5000 aún ocupado" -ForegroundColor Red
} else {
    Write-Host "  ✓ Puerto 5000 libre" -ForegroundColor Green
}

if (-not $frontendFree) {
    Write-Host "  ✗ Puerto 5173 aún ocupado" -ForegroundColor Red
} else {
    Write-Host "  ✓ Puerto 5173 libre" -ForegroundColor Green
}

# Paso 2: Iniciar el sistema
Write-Host "[2/3] Iniciando servicios..." -ForegroundColor Cyan

# Iniciar backend en segundo plano sin ventanas
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node backend/server.js
}

# Iniciar frontend en segundo plano sin ventanas
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location frontend-react
    npm run dev -- --host
}

Write-Host "  ✓ Backend iniciándose (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host "  ✓ Frontend iniciándose (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Paso 3: Verificar que los servicios estén arriba
Write-Host "[3/3] Verificando servicios..." -ForegroundColor Cyan

Start-Sleep -Seconds 5

# Verificar backend
$backendReady = $false
for ($i = 1; $i -le 15; $i++) {
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -TimeoutSec 1 -ErrorAction Stop
        $backendReady = $true
        break
    } catch {
        Start-Sleep -Milliseconds 500
    }
}

if ($backendReady) {
    Write-Host "  ✓ Backend activo en http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "  ⏳ Backend iniciando..." -ForegroundColor Yellow
}

# Verificar frontend
$frontendReady = $false
for ($i = 1; $i -le 10; $i++) {
    if (-not (Test-PortFree -Port 5173)) {
        $frontendReady = $true
        break
    }
    Start-Sleep -Milliseconds 500
}

if ($frontendReady) {
    Write-Host "  ✓ Frontend activo en http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  ⏳ Frontend iniciando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  ✓ SISTEMA INICIADO" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Accede a: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Para detener: .\stop-all.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tip: Los servicios corren como jobs de PowerShell (sin ventanas)" -ForegroundColor Gray
Write-Host "   Para ver logs: Get-Job | Receive-Job" -ForegroundColor Gray
Write-Host ""
