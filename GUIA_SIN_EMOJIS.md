# Guía de Desarrollo Sin Emojis

## Problema

Los emojis en el código backend causan problemas de visualización en terminales que no soportan UTF-8 o no tienen fuentes con emojis instaladas. Esto resulta en caracteres corruptos como:

- `ƒôï` en lugar de 🚀
- `Ô£à` en lugar de ✅
- `conexi├│n` en lugar de "conexión"

## Solución: Alternativas ASCII

Usa siempre alternativas ASCII en lugar de emojis:

| ❌ NO Usar | ✅ SÍ Usar | Contexto |
|-----------|-----------|----------|
| ✅ | `[OK]` | Operaciones exitosas |
| ❌ | `[ERROR]` | Errores |
| ⚠️ | `[WARN]` | Advertencias |
| 🚀 | `[READY]` | Sistema listo |
| 🔌 | `[DB]` | Base de datos |
| 📋 | `[API]` | Endpoints API |
| 💡 | `[INFO]` | Información |
| 🛑 | `[STOP]` | Detención |
| 🔍 | `[DEBUG]` | Depuración |

## Validación Automática

### ESLint

El proyecto tiene configurado ESLint para detectar emojis automáticamente:

```bash
# Verificar código
npm run lint

# Corregir automáticamente
npm run lint:fix
```

### Script de Validación

```bash
# Escanear archivos en busca de emojis
npm run validate:emojis

# Ejecutar todas las validaciones (lint + emojis)
npm run validate:all
```

### Remover Emojis Existentes

Si encuentras emojis en el código:

```bash
node scripts/remove-emojis.js
```

## Ejemplos

### ❌ Incorrecto

```javascript
logger.info('✅ Usuario creado exitosamente');
console.log('🚀 Servidor iniciado');
res.send('Backend funcionando 🎉');
```

### ✅ Correcto

```javascript
logger.info('[OK] Usuario creado exitosamente');
console.log('[READY] Servidor iniciado');
res.send('Backend funcionando [OK]');
```

## Pre-commit Hook (Opcional)

Para prevenir commits con emojis, agrega esto a `.git/hooks/pre-commit`:

```bash
#!/bin/sh
npm run validate:emojis
if [ $? -ne 0 ]; then
  echo "Error: Se encontraron emojis en el código"
  exit 1
fi
```

## Regla ESLint

La regla está configurada en `backend/.eslintrc.json`:

```json
{
  "no-restricted-syntax": [
    "error",
    {
      "selector": "Literal[value=/[\\u{1F300}-\\u{1FAFF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]/u]",
      "message": "No usar emojis en el código. Usa alternativas ASCII..."
    }
  ]
}
```

## Compatibilidad

Esta guía asegura que el código sea compatible con:
- ✅ PowerShell con codificación IBM850
- ✅ Terminales sin fuentes emoji
- ✅ Sistemas legacy
- ✅ Logs en archivos de texto plano
- ✅ Herramientas de monitoreo que no soportan UTF-8
