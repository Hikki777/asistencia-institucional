-- CreateTable
CREATE TABLE "institucion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "logo_base64" TEXT,
    "logo_path" TEXT,
    "horario_inicio" TEXT,
    "horario_salida" TEXT,
    "margen_puntualidad_min" INTEGER NOT NULL DEFAULT 5,
    "direccion" TEXT,
    "pais" TEXT,
    "departamento" TEXT,
    "municipio" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "inicializado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "alumnos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carnet" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "sexo" TEXT,
    "grado" TEXT NOT NULL,
    "carrera" TEXT,
    "especialidad" TEXT,
    "jornada" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "anio_ingreso" INTEGER,
    "anio_graduacion" INTEGER,
    "nivel_actual" TEXT,
    "motivo_baja" TEXT,
    "fecha_baja" DATETIME,
    "foto_path" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "personal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carnet" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "sexo" TEXT,
    "cargo" TEXT,
    "jornada" TEXT,
    "grado_guia" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "foto_path" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "codigos_qr" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "persona_tipo" TEXT NOT NULL,
    "alumno_id" INTEGER,
    "personal_id" INTEGER,
    "token" TEXT NOT NULL,
    "png_path" TEXT,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "generado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regenerado_en" DATETIME,
    CONSTRAINT "codigos_qr_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "codigos_qr_personal_id_fkey" FOREIGN KEY ("personal_id") REFERENCES "personal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "persona_tipo" TEXT NOT NULL,
    "alumno_id" INTEGER,
    "personal_id" INTEGER,
    "tipo_evento" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origen" TEXT NOT NULL DEFAULT 'QR',
    "dispositivo" TEXT,
    "estado_puntualidad" TEXT,
    "observaciones" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "asistencias_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "asistencias_personal_id_fkey" FOREIGN KEY ("personal_id") REFERENCES "personal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "nombres" TEXT,
    "apellidos" TEXT,
    "foto_path" TEXT,
    "cargo" TEXT,
    "jornada" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'operador',
    "hash_pass" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entidad" TEXT NOT NULL,
    "entidad_id" INTEGER,
    "usuario_id" INTEGER,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "excusas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alumno_id" INTEGER,
    "personal_id" INTEGER,
    "motivo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "excusas_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "excusas_personal_id_fkey" FOREIGN KEY ("personal_id") REFERENCES "personal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historial_academico" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alumno_id" INTEGER NOT NULL,
    "anio_escolar" INTEGER NOT NULL,
    "grado_cursado" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "carrera" TEXT,
    "promovido" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_academico_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "diagnostic_results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "codigo_qr_id" INTEGER,
    "descripcion" TEXT NOT NULL,
    "reparado" BOOLEAN NOT NULL DEFAULT false,
    "reparado_en" DATETIME,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_carnet_key" ON "alumnos"("carnet");

-- CreateIndex
CREATE INDEX "alumnos_estado_idx" ON "alumnos"("estado");

-- CreateIndex
CREATE INDEX "alumnos_grado_idx" ON "alumnos"("grado");

-- CreateIndex
CREATE INDEX "alumnos_nivel_actual_idx" ON "alumnos"("nivel_actual");

-- CreateIndex
CREATE UNIQUE INDEX "personal_carnet_key" ON "personal"("carnet");

-- CreateIndex
CREATE INDEX "personal_estado_idx" ON "personal"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_qr_token_key" ON "codigos_qr"("token");

-- CreateIndex
CREATE INDEX "codigos_qr_token_idx" ON "codigos_qr"("token");

-- CreateIndex
CREATE INDEX "codigos_qr_vigente_idx" ON "codigos_qr"("vigente");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_qr_persona_tipo_alumno_id_key" ON "codigos_qr"("persona_tipo", "alumno_id");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_qr_persona_tipo_personal_id_key" ON "codigos_qr"("persona_tipo", "personal_id");

-- CreateIndex
CREATE INDEX "asistencias_timestamp_idx" ON "asistencias"("timestamp");

-- CreateIndex
CREATE INDEX "asistencias_persona_tipo_idx" ON "asistencias"("persona_tipo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "auditoria_timestamp_idx" ON "auditoria"("timestamp");

-- CreateIndex
CREATE INDEX "auditoria_entidad_idx" ON "auditoria"("entidad");

-- CreateIndex
CREATE INDEX "excusas_fecha_idx" ON "excusas"("fecha");

-- CreateIndex
CREATE INDEX "historial_academico_alumno_id_anio_escolar_idx" ON "historial_academico"("alumno_id", "anio_escolar");

-- CreateIndex
CREATE INDEX "diagnostic_results_reparado_idx" ON "diagnostic_results"("reparado");

-- CreateIndex
CREATE INDEX "diagnostic_results_timestamp_idx" ON "diagnostic_results"("timestamp");
