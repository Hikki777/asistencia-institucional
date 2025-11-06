# Script para aplicar optimizaciones de base de datos
# Ejecutar desde la raíz del proyecto

Write-Host "🔧 Aplicando optimizaciones de base de datos..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "backend/prisma/schema.prisma")) {
    Write-Host "❌ Error: Ejecutar desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Aplicando índices al schema de Prisma..." -ForegroundColor Yellow

# Mostrar cambios que se aplicarán
Write-Host ""
Write-Host "Índices que se agregarán:" -ForegroundColor White
Write-Host "  • Alumno: carnet, estado, grado" -ForegroundColor Gray
Write-Host "  • Personal: carnet, estado" -ForegroundColor Gray
Write-Host "  • Asistencia: timestamp+persona_tipo, alumno_id, personal_id, tipo_evento+timestamp" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "¿Continuar? (s/n)"
if ($confirm -ne 's' -and $confirm -ne 'S') {
    Write-Host "❌ Operación cancelada" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "⚙️ Ejecutando: npx prisma db push" -ForegroundColor Cyan

try {
    npx prisma db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ¡Índices aplicados correctamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Verificando índices..." -ForegroundColor Yellow
        
        # Ejecutar PRAGMA index_list para ver índices
        Write-Host ""
        Write-Host "Índices en tabla 'asistencias':" -ForegroundColor White
        sqlite3 backend/prisma/dev.db "PRAGMA index_list('asistencias');"
        
        Write-Host ""
        Write-Host "Índices en tabla 'alumnos':" -ForegroundColor White
        sqlite3 backend/prisma/dev.db "PRAGMA index_list('alumnos');"
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host "✅ OPTIMIZACIÓN COMPLETADA" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host ""
        Write-Host "📈 Mejoras esperadas:" -ForegroundColor Cyan
        Write-Host "   • Consultas 5-10x más rápidas" -ForegroundColor White
        Write-Host "   • Búsquedas optimizadas con índices" -ForegroundColor White
        Write-Host "   • Mejor rendimiento con muchos registros" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Próximo paso:" -ForegroundColor Cyan
        Write-Host "   Reinicia el sistema: .\start-dev-simple.ps1" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Error al aplicar cambios" -ForegroundColor Red
        Write-Host "   Código de salida: $LASTEXITCODE" -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
