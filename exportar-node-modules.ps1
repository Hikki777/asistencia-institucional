#!/usr/bin/env pwsh
# Script para exportar node_modules al USB
# Sistema de Registro Institucional

$ErrorActionPreference = "Continue"

Write-Host "`n🔌 EXPORTADOR DE NODE_MODULES PARA TRABAJO OFFLINE`n" -ForegroundColor Cyan

# Detectar drives USB
Write-Host "Buscando unidades USB..." -ForegroundColor Yellow
$usbDrives = Get-Volume | Where-Object { $_.DriveType -eq 'Removable' -and $_.DriveLetter } | Select-Object -ExpandProperty DriveLetter

if ($usbDrives.Count -eq 0) {
    Write-Host "❌ No se encontraron unidades USB conectadas" -ForegroundColor Red
    Write-Host "   Por favor conecta una memoria USB y vuelve a ejecutar el script" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ USB encontrado(s): $($usbDrives -join ', ')" -ForegroundColor Green

# Seleccionar USB
if ($usbDrives.Count -eq 1) {
    $selectedUSB = $usbDrives[0]
    Write-Host "📍 Usando USB: $selectedUSB`:\" -ForegroundColor Cyan
} else {
    Write-Host "`nUnidades USB disponibles:" -ForegroundColor Cyan
    for ($i = 0; $i -lt $usbDrives.Count; $i++) {
        $drive = $usbDrives[$i]
        $volume = Get-Volume -DriveLetter $drive
        $freeGB = [math]::Round($volume.SizeRemaining / 1GB, 2)
        Write-Host "  [$i] $drive`:\ - $($volume.FileSystemLabel) ($freeGB GB libres)"
    }
    
    $selection = Read-Host "`nSelecciona USB [0-$($usbDrives.Count-1)]"
    $selectedUSB = $usbDrives[[int]$selection]
}

$usbPath = "$selectedUSB`:\"

# Verificar espacio disponible
$volume = Get-Volume -DriveLetter $selectedUSB
$freeGB = [math]::Round($volume.SizeRemaining / 1GB, 2)

Write-Host "`n📊 Espacio disponible en USB: $freeGB GB" -ForegroundColor Cyan

if ($freeGB -lt 1) {
    Write-Host "⚠️  ADVERTENCIA: Poco espacio disponible" -ForegroundColor Yellow
    Write-Host "   node_modules puede ocupar ~700 MB" -ForegroundColor Yellow
    $continue = Read-Host "¿Continuar de todos modos? (s/n)"
    if ($continue -ne 's') {
        exit 0
    }
}

# Crear carpeta destino
$backupPath = Join-Path $usbPath "node_modules-backup-$(Get-Date -Format 'yyyy-MM-dd')"
Write-Host "`n📁 Creando carpeta: $backupPath" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

# Exportar node_modules del backend
Write-Host "`n📦 Exportando node_modules del BACKEND..." -ForegroundColor Yellow
$backendSource = "node_modules"
$backendDest = Join-Path $backupPath "backend-node_modules"

if (Test-Path $backendSource) {
    Write-Host "   Copiando archivos (esto puede tardar varios minutos)..." -ForegroundColor Gray
    
    try {
        # Usar robocopy para mejor rendimiento
        $result = robocopy $backendSource $backendDest /E /NFL /NDL /NJH /NJS /nc /ns /np
        if ($LASTEXITCODE -le 7) {
            $backendSize = (Get-ChildItem -Path $backendDest -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "   ✅ Backend node_modules: $([math]::Round($backendSize, 2)) MB" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Advertencia: Algunos archivos no se copiaron (código: $LASTEXITCODE)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Error copiando backend node_modules: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  No se encontró node_modules del backend" -ForegroundColor Yellow
    Write-Host "   Ejecuta 'npm install' primero en la raíz del proyecto" -ForegroundColor Gray
}

# Exportar node_modules del frontend
Write-Host "`n📦 Exportando node_modules del FRONTEND..." -ForegroundColor Yellow
$frontendSource = "frontend-react\node_modules"
$frontendDest = Join-Path $backupPath "frontend-node_modules"

if (Test-Path $frontendSource) {
    Write-Host "   Copiando archivos (esto puede tardar varios minutos)..." -ForegroundColor Gray
    
    try {
        $result = robocopy $frontendSource $frontendDest /E /NFL /NDL /NJH /NJS /nc /ns /np
        if ($LASTEXITCODE -le 7) {
            $frontendSize = (Get-ChildItem -Path $frontendDest -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "   ✅ Frontend node_modules: $([math]::Round($frontendSize, 2)) MB" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Advertencia: Algunos archivos no se copiaron (código: $LASTEXITCODE)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Error copiando frontend node_modules: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  No se encontró node_modules del frontend" -ForegroundColor Yellow
    Write-Host "   Ejecuta 'npm install' en frontend-react/ primero" -ForegroundColor Gray
}

# Crear archivo README
$readmePath = Join-Path $backupPath "LEEME.txt"
@"
NODE_MODULES BACKUP - Sistema de Registro Institucional
Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm')

CONTENIDO:
- backend-node_modules/  -> Copiar a: raiz-proyecto/node_modules/
- frontend-node_modules/ -> Copiar a: raiz-proyecto/frontend-react/node_modules/

INSTRUCCIONES DE USO:
1. Copia el proyecto completo desde el otro backup
2. Copia estas carpetas node_modules a las ubicaciones indicadas
3. Ejecuta: npx prisma generate
4. Inicia el sistema: .\start-system.ps1

NO REQUIERE INTERNET para funcionar una vez copiado.

Más info: Ver GUIA-TRABAJO-OFFLINE.md en el backup del proyecto
"@ | Out-File -FilePath $readmePath -Encoding utf8

Write-Host "`n📄 Archivo LEEME.txt creado con instrucciones" -ForegroundColor Green

# Resumen final
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ EXPORTACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

$totalSize = (Get-ChildItem -Path $backupPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$fileCount = (Get-ChildItem -Path $backupPath -Recurse -File | Measure-Object).Count

Write-Host "`n📍 Ubicación: $backupPath"
Write-Host "📊 Tamaño total: $([math]::Round($totalSize, 2)) MB"
Write-Host "📄 Archivos totales: $fileCount"

Write-Host "`n✅ Tu USB ahora contiene:" -ForegroundColor Green
Write-Host "   • backend-node_modules/" -ForegroundColor White
Write-Host "   • frontend-node_modules/" -ForegroundColor White
Write-Host "   • LEEME.txt con instrucciones" -ForegroundColor White

Write-Host "`n💡 Siguiente paso:" -ForegroundColor Cyan
Write-Host "   Copia también el backup del proyecto completo" -ForegroundColor White
Write-Host "   Ubicación: $env:USERPROFILE\Desktop\Backup-Sistema-Registro-*" -ForegroundColor Gray

Write-Host "`n🎉 Listo para trabajar sin internet!" -ForegroundColor Green
Write-Host ""

pause
