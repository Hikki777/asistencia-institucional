-- Migración Manual: Sistema de Migración de Alumnos
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar campos de ciclo de vida a la tabla alumnos
ALTER TABLE alumnos
ADD COLUMN IF NOT EXISTS anio_ingreso INTEGER,
ADD COLUMN IF NOT EXISTS anio_graduacion INTEGER,
ADD COLUMN IF NOT EXISTS nivel_actual VARCHAR(50),
ADD COLUMN IF NOT EXISTS motivo_baja VARCHAR(100),
ADD COLUMN IF NOT EXISTS fecha_baja TIMESTAMP;

-- 2. Actualizar comentarios de la columna estado
COMMENT ON COLUMN alumnos.estado IS 'Estado del alumno: activo, graduado, retirado';

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_alumnos_grado ON alumnos(grado);
CREATE INDEX IF NOT EXISTS idx_alumnos_nivel_actual ON alumnos(nivel_actual);

-- 4. Crear tabla de historial académico
CREATE TABLE IF NOT EXISTS historial_academico (
  id SERIAL PRIMARY KEY,
  alumno_id INTEGER NOT NULL,
  anio_escolar INTEGER NOT NULL,
  grado_cursado VARCHAR(50) NOT NULL,
  nivel VARCHAR(50) NOT NULL,
  carrera VARCHAR(100),
  promovido BOOLEAN NOT NULL DEFAULT true,
  observaciones TEXT,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key
  CONSTRAINT fk_historial_alumno
    FOREIGN KEY (alumno_id)
    REFERENCES alumnos(id)
    ON DELETE CASCADE
);

-- 5. Crear índices para historial académico
CREATE INDEX IF NOT EXISTS idx_historial_alumno_id ON historial_academico(alumno_id);
CREATE INDEX IF NOT EXISTS idx_historial_anio_escolar ON historial_academico(anio_escolar);
CREATE INDEX IF NOT EXISTS idx_historial_alumno_anio ON historial_academico(alumno_id, anio_escolar);

-- 6. Verificar que las tablas se crearon correctamente
SELECT 
  'alumnos' as tabla,
  COUNT(*) as total_columnas
FROM information_schema.columns
WHERE table_name = 'alumnos'
UNION ALL
SELECT 
  'historial_academico' as tabla,
  COUNT(*) as total_columnas
FROM information_schema.columns
WHERE table_name = 'historial_academico';

-- 7. Mostrar estructura de la nueva tabla
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_academico'
ORDER BY ordinal_position;

-- 8. SEGURIDAD: Habilitar Row Level Security (RLS) en historial_academico
-- Esto corrige el warning de Supabase Advisor
ALTER TABLE historial_academico ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios autenticados pueden ver todos los registros
CREATE POLICY "Permitir lectura a usuarios autenticados"
ON historial_academico
FOR SELECT
TO authenticated
USING (true);

-- Política: Los usuarios autenticados pueden insertar registros
CREATE POLICY "Permitir inserción a usuarios autenticados"
ON historial_academico
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Los usuarios autenticados pueden actualizar registros
CREATE POLICY "Permitir actualización a usuarios autenticados"
ON historial_academico
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política: Los usuarios autenticados pueden eliminar registros
CREATE POLICY "Permitir eliminación a usuarios autenticados"
ON historial_academico
FOR DELETE
TO authenticated
USING (true);

-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'historial_academico';
