-- CreateTable
CREATE TABLE "institucion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "logo_base64" TEXT,
    "logo_path" TEXT,
    "horario_inicio" TEXT,
    "margen_puntualidad_min" INTEGER NOT NULL DEFAULT 5,
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
    "jornada" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
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
    "grado" TEXT,
    "jornada" TEXT,
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
CREATE UNIQUE INDEX "personal_carnet_key" ON "personal"("carnet");

-- CreateIndex
CREATE UNIQUE INDEX "codigos_qr_token_key" ON "codigos_qr"("token");

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
