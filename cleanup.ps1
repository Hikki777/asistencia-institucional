# cleanup.ps1 - Limpieza profunda del proyecto
# Elimina archivos innecesarios, temporales y duplicados

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  LIMPIEZA DEL PROYECTO" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$cleanupLog = @()

# Función para eliminar archivo/carpeta con confirmación
function Remove-ItemSafe {
    param(
        [string]$Path,
        [string]$Description
    )
    
    if (Test-Path $Path) {
        try {
            Remove-Item $Path -Recurse -Force -ErrorAction Stop
            Write-Host "  ✓ $Description" -ForegroundColor Green
            $script:cleanupLog += "✓ Eliminado: $Description"
            return $true
        } catch {
            Write-Host "  ✗ No se pudo eliminar: $Description" -ForegroundColor Red
            $script:cleanupLog += "✗ Error: $Description - $($_.Exception.Message)"
            return $false
        }
    }
    return $false
}

# 1. Archivos de componentes antiguos/duplicados
Write-Host "[1/8] Eliminando componentes duplicados..." -ForegroundColor Yellow
$removed = 0
$removed += Remove-ItemSafe "frontend-react\src\components\DocentesPanel.jsx" "DocentesPanel.jsx (reemplazado por PersonalPanel)"
$removed += Remove-ItemSafe "frontend-react\src\components\AlumnosPanel_OLD.jsx" "AlumnosPanel_OLD.jsx"
$removed += Remove-ItemSafe "frontend-react\src\components\AsistenciasPanel_OLD_ZXING.jsx" "AsistenciasPanel_OLD_ZXING.jsx"
if ($removed -eq 0) { Write-Host "  ⓘ No hay componentes duplicados" -ForegroundColor Gray }

# 2. Frontend antiguo (HTML estático)
Write-Host "[2/8] Eliminando frontend antiguo..." -ForegroundColor Yellow
$removed = Remove-ItemSafe "frontend" "Carpeta frontend/ (HTML estático no usado)"
if (-not $removed) { Write-Host "  ⓘ Frontend antiguo ya eliminado" -ForegroundColor Gray }

# 3. Archivos de prueba y debug
Write-Host "[3/8] Eliminando archivos de prueba..." -ForegroundColor Yellow
$testFiles = @(
    "test.js",
    "test-auth.js",
    "test-qr-content.js",
    "test-qr-display.html",
    "check-login.js",
    "check-logo.js",
    "check-user.js",
    "setup-test-db.js"
)
$removed = 0
foreach ($file in $testFiles) {
    $removed += Remove-ItemSafe $file "$file"
}
if ($removed -eq 0) { Write-Host "  ⓘ No hay archivos de prueba" -ForegroundColor Gray }

# 4. Archivos HTML de demostración
Write-Host "[4/8] Eliminando archivos HTML de demo..." -ForegroundColor Yellow
$htmlFiles = @(
    "qr-mobile.html",
    "qr-mobile-con-logo.html",
    "imprimir-qr.html"
)
$removed = 0
foreach ($file in $htmlFiles) {
    $removed += Remove-ItemSafe $file "$file"
}
if ($removed -eq 0) { Write-Host "  ⓘ No hay archivos HTML de demo" -ForegroundColor Gray }

# 5. Scripts de generación temporal
Write-Host "[5/8] Eliminando scripts temporales..." -ForegroundColor Yellow
$tempScripts = @(
    "generar-asistencias-demo.js",
    "generar-qrs-sin-logo.js",
    "generar-qrs-ultra.js",
    "regenerar-qrs-sin-logo.js",
    "regenerar-qrs.js",
    "aplicar-optimizaciones.ps1",
    "exportar-node-modules.ps1"
)
$removed = 0
foreach ($file in $tempScripts) {
    $removed += Remove-ItemSafe $file "$file"
}
if ($removed -eq 0) { Write-Host "  ⓘ No hay scripts temporales" -ForegroundColor Gray }

# 6. Reportes temporales
Write-Host "[6/8] Limpiando reportes temporales..." -ForegroundColor Yellow
if (Test-Path "temp-reports") {
    $tempReports = Get-ChildItem "temp-reports" -File -ErrorAction SilentlyContinue
    if ($tempReports) {
        $tempReports | ForEach-Object {
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  ✓ Reportes temporales eliminados ($($tempReports.Count))" -ForegroundColor Green
    } else {
        Write-Host "  ⓘ No hay reportes temporales" -ForegroundColor Gray
    }
}

# 7. Logs antiguos (mantener solo últimos 7 días)
Write-Host "[7/8] Limpiando logs antiguos..." -ForegroundColor Yellow
if (Test-Path "logs") {
    $cutoffDate = (Get-Date).AddDays(-7)
    $oldLogs = Get-ChildItem "logs" -File -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    if ($oldLogs) {
        $oldLogs | ForEach-Object {
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  ✓ Logs antiguos eliminados ($($oldLogs.Count))" -ForegroundColor Green
    } else {
        Write-Host "  ⓘ No hay logs antiguos (>7 días)" -ForegroundColor Gray
    }
}

# 8. Documentación redundante
Write-Host "[8/8] Consolidando documentación..." -ForegroundColor Yellow
$docsToRemove = @(
    "COMANDOS_POWERSHELL.md",
    "COMANDOS_UTILES.md",
    "DIAGNOSTICO_Y_REPARACION.md",
    "ESTADO_ACTUAL.md",
    "MEJORAS_PRE_GITHUB.md",
    "OBSERVABILIDAD_APLICADA.md",
    "OPTIMIZACIONES_APLICADAS.md",
    "OPTIMIZACIONES_Y_ROADMAP.md",
    "PERFORMANCE_OPTIMIZADO.md",
    "PROXIMOS_PASOS.md",
    "SEGURIDAD_APLICADA.md",
    "TESTING_Y_CICD.md",
    "UX_FRONTEND_MEJORADO.md",
    "INSTRUCCIONES_TRANSFERENCIA.md",
    "README_COMPLETO.md"
)
$removed = 0
foreach ($file in $docsToRemove) {
    $removed += Remove-ItemSafe $file "$file"
}
if ($removed -eq 0) { Write-Host "  ⓘ Documentación ya consolidada" -ForegroundColor Gray }

# Resumen final
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  ✓ LIMPIEZA COMPLETADA" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Generar reporte
$reportPath = "cleanup-report.txt"
$cleanupLog | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "📝 Reporte guardado en: $reportPath" -ForegroundColor Cyan
Write-Host ""

# Mostrar estadísticas
$totalRemoved = ($cleanupLog | Where-Object { $_ -like "✓*" }).Count
Write-Host "📊 Elementos eliminados: $totalRemoved" -ForegroundColor White
Write-Host ""

# Verificar integridad del proyecto
Write-Host "🔍 Verificando integridad del proyecto..." -ForegroundColor Cyan
$critical = @(
    "backend\server.js",
    "backend\prismaClient.js",
    "frontend-react\src\main.jsx",
    "frontend-react\src\App.jsx",
    "frontend-react\src\components\PersonalPanel.jsx",
    "frontend-react\src\components\AlumnosPanel.jsx",
    "package.json",
    "start-auto.ps1",
    "stop-all.ps1"
)

$allGood = $true
foreach ($file in $critical) {
    if (-not (Test-Path $file)) {
        Write-Host "  ✗ Archivo crítico faltante: $file" -ForegroundColor Red
        $allGood = $false
    }
}

if ($allGood) {
    Write-Host "  ✓ Todos los archivos críticos intactos" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Hay archivos críticos faltantes - revisa el proyecto" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Archivos mantenidos:" -ForegroundColor White
Write-Host "   ✓ Scripts de utilidad (check-data.js, list-data.js, crear-admin.js, reset-password.js)" -ForegroundColor Gray
Write-Host "   ✓ Scripts de inicio (start-auto.ps1, stop-all.ps1)" -ForegroundColor Gray
Write-Host "   ✓ Documentación esencial (README.md, GUIA_RAPIDA.md, INICIO_RAPIDO.md)" -ForegroundColor Gray
Write-Host "   ✓ Configuración (package.json, .env, prisma/)" -ForegroundColor Gray
Write-Host ""
