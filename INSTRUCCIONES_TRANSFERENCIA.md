# 📦 Instrucciones de Transferencia y Sincronización

**Sistema de Registro Institucional**  
**Autor:** Kevin Gabriel Pérez García  
**Repositorio:** https://github.com/Hikki777/asistencia-institucional

---

## 🎯 Propósito

Este documento te guía para:
1. ✅ Exportar el proyecto a otro PC (sin acceso a GitHub)
2. ✅ Continuar el desarrollo en otro PC
3. ✅ Importar cambios de vuelta y sincronizar con GitHub

---

## 📤 PARTE 1: Exportar el Proyecto

### Opción A: Exportar con Git (Recomendado)

Si el otro PC tiene Git instalado:

```powershell
# 1. Asegurarse de que todo está guardado
cd "C:\Users\Kevin\Documents\Proyectos\Sistema de Registro Institucional"
git status

# 2. Si hay cambios pendientes, guardarlos
git add .
git commit -m "Preparando transferencia a otro PC"
git push origin main

# 3. Crear bundle portable (incluye historial Git)
git bundle create "$env:USERPROFILE\Desktop\sistema-registro-$(Get-Date -Format 'yyyy-MM-dd').bundle" --all

# 4. Copiar el archivo .bundle a USB
```

**✅ Ventajas:**
- Mantiene historial de commits
- Puedes seguir usando Git en el otro PC
- Fácil sincronización de vuelta

---

### Opción B: Exportar ZIP Simple

Si el otro PC NO tiene Git:

```powershell
# 1. Ir al directorio del proyecto
cd "C:\Users\Kevin\Documents\Proyectos\Sistema de Registro Institucional"

# 2. Crear ZIP (excluye node_modules automáticamente por .gitignore)
Compress-Archive -Path * -DestinationPath "$env:USERPROFILE\Desktop\sistema-registro-$(Get-Date -Format 'yyyy-MM-dd').zip" -Force

# 3. Copiar el .zip a USB
```

**⚠️ Nota:** Excluye automáticamente:
- `node_modules/` (se reinstala con `npm install`)
- `.git/` (historial)
- `*.db` (base de datos - copiar aparte si necesitas datos)

---

## 💻 PARTE 2: Importar en Otro PC

### Si usaste Bundle (Opción A):

```powershell
# 1. Copiar el .bundle del USB a una carpeta
# Ejemplo: D:\Proyectos\

# 2. Clonar desde el bundle
cd D:\Proyectos
git clone sistema-registro-2025-11-05.bundle sistema-registro-institucional

# 3. Entrar al proyecto
cd sistema-registro-institucional

# 4. Instalar dependencias
npm install
cd frontend-react
npm install
cd ..

# 5. Verificar que todo funciona
npm run dev
```

---

### Si usaste ZIP (Opción B):

```powershell
# 1. Descomprimir el ZIP en una carpeta
# Ejemplo: D:\Proyectos\sistema-registro-institucional

# 2. Abrir PowerShell en esa carpeta
cd D:\Proyectos\sistema-registro-institucional

# 3. Instalar dependencias del backend
npm install

# 4. Instalar dependencias del frontend
cd frontend-react
npm install
cd ..

# 5. Configurar variables de entorno
# Copiar .env.example a .env si existe
# O crear .env manualmente con:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="tu_secreto_jwt"
# HMAC_SECRET="tu_secreto_hmac"
# PORT=5000

# 6. Inicializar base de datos (si es nuevo)
npx prisma generate
npx prisma migrate dev --name init

# 7. (Opcional) Cargar datos de prueba
node backend/prisma/seed.js

# 8. Iniciar sistema
.\start-system.ps1
# O manualmente:
# Terminal 1: cd backend && node server.js
# Terminal 2: cd frontend-react && npm run dev
```

---

## 🔨 PARTE 3: Trabajar en el Otro PC

### Desarrollo Normal:

```powershell
# Iniciar el sistema
.\start-system.ps1

# Realizar cambios en el código...
# Editar archivos, agregar funcionalidades, etc.

# Detener el sistema
.\stop-system.ps1
```

### Si tienes Git (desde Bundle):

```powershell
# Guardar cambios localmente
git add .
git commit -m "Descripción de los cambios realizados"

# Ver historial
git log --oneline

# Crear bundle para llevar de vuelta
git bundle create sistema-registro-vuelta.bundle --all
```

### Si NO tienes Git (desde ZIP):

```powershell
# Crear un archivo de registro manual
New-Item -Path "CAMBIOS_REALIZADOS.txt" -ItemType File

# Anota en ese archivo:
# - Archivos modificados
# - Funcionalidades agregadas
# - Bugs corregidos
# - Fecha y descripción

# Al terminar, crear ZIP para llevar de vuelta
Compress-Archive -Path * -DestinationPath "sistema-registro-modificado-$(Get-Date -Format 'yyyy-MM-dd').zip" -Force
```

---

## 📥 PARTE 4: Importar Cambios de Vuelta

### Si usaste Git (Bundle):

```powershell
# 1. Volver a tu PC con GitHub
cd "C:\Users\Kevin\Documents\Proyectos\Sistema de Registro Institucional"

# 2. Asegurarte de que tienes lo último
git pull origin main

# 3. Importar cambios del bundle
git pull C:\ruta\al\sistema-registro-vuelta.bundle main

# 4. Resolver conflictos si hay (Git te guiará)

# 5. Subir a GitHub
git push origin main
```

---

### Si usaste ZIP:

```powershell
# 1. Volver a tu PC con GitHub
cd "C:\Users\Kevin\Documents\Proyectos\Sistema de Registro Institucional"

# 2. Verificar estado actual
git status

# 3. Hacer backup por si acaso
git branch backup-antes-importar

# 4. Comparar archivos manualmente
# Usa herramientas como:
# - VS Code (abre ambas carpetas y compara)
# - WinMerge (gratuito)
# - Beyond Compare

# 5. Copiar archivos modificados selectivamente
# Sobrescribe solo los que cambiaron

# 6. Revisar cambios
git status
git diff

# 7. Guardar cambios
git add .
git commit -m "Cambios importados desde otro PC

- [Lista los cambios principales]
- [Basado en CAMBIOS_REALIZADOS.txt]"

# 8. Subir a GitHub
git push origin main
```

---

## 🔄 PARTE 5: Sincronización Continua

### Flujo Recomendado:

```
PC con GitHub (Casa)
    ↓ [git push]
  GitHub
    ↓ [git clone/pull en PC de trabajo]
PC sin GitHub (Trabajo/Escuela)
    ↓ [trabajar y guardar cambios]
    ↓ [crear bundle o ZIP]
  USB
    ↓ [importar cambios]
PC con GitHub (Casa)
    ↓ [git push]
  GitHub
    (repetir ciclo)
```

---

## 📋 Checklist de Transferencia

### Antes de Exportar:
- [ ] `git status` - Verificar que todo está commiteado
- [ ] `git push origin main` - Subir últimos cambios
- [ ] Crear bundle o ZIP
- [ ] Copiar a USB
- [ ] (Opcional) Exportar base de datos si necesitas datos

### En el Otro PC:
- [ ] Descomprimir/clonar
- [ ] `npm install` en raíz y en `frontend-react/`
- [ ] Configurar `.env`
- [ ] Inicializar Prisma si es necesario
- [ ] Verificar que funciona con `.\start-system.ps1`

### Antes de Regresar:
- [ ] Crear bundle o ZIP con cambios
- [ ] Documentar cambios en `CAMBIOS_REALIZADOS.txt`
- [ ] Copiar a USB
- [ ] Verificar que no falten archivos importantes

### Al Importar de Vuelta:
- [ ] `git status` en PC original
- [ ] Hacer backup: `git branch backup-$(Get-Date -Format 'yyyy-MM-dd')`
- [ ] Importar cambios (bundle o manual)
- [ ] Probar que funciona
- [ ] `git add . && git commit`
- [ ] `git push origin main`

---

## 🛠️ Comandos Útiles

### Verificar estado Git:
```powershell
git status
git log --oneline -10
git branch -a
```

### Crear backup rápido:
```powershell
git branch backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')
```

### Ver diferencias:
```powershell
git diff
git diff --name-only
```

### Descartar cambios locales:
```powershell
git checkout -- archivo.js
git reset --hard HEAD
```

### Listar archivos grandes:
```powershell
Get-ChildItem -Recurse | Where-Object { $_.Length -gt 10MB } | Sort-Object Length -Descending | Select-Object FullName, @{Name="MB";Expression={[math]::Round($_.Length/1MB,2)}}
```

---

## ⚠️ Advertencias Importantes

1. **No copies `node_modules/`**: Siempre reinstala con `npm install`
2. **Base de datos**: Si necesitas datos, copia `backend/prisma/dev.db` aparte
3. **Variables de entorno**: Recuerda configurar `.env` en cada PC
4. **Conflictos**: Si modificas el mismo archivo en ambos PCs, Git te ayudará a fusionarlos
5. **Backups**: Siempre crea una rama de backup antes de importar cambios grandes

---

## 🆘 Solución de Problemas

### "npm install falla"
```powershell
# Limpiar caché
npm cache clean --force
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### "Prisma no funciona"
```powershell
npx prisma generate
npx prisma migrate dev
```

### "Puerto ocupado"
```powershell
# Cambiar puerto en .env
# PORT=5001 (en lugar de 5000)
```

### "Git rechaza el push"
```powershell
# Primero hacer pull
git pull origin main --rebase
# Luego push
git push origin main
```

---

## 📞 Contacto

Si tienes problemas:
- Revisa la documentación: `README.md`
- Consulta comandos útiles: `COMANDOS_UTILES.md`
- Revisa guía rápida: `GUIA_RAPIDA.md`

---

**Última actualización:** 5 de noviembre de 2025  
**Versión del documento:** 1.0
