-- CreateTable
CREATE TABLE "institucion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "logo_base64" TEXT,
    "logo_path" TEXT,
    "horario_inicio" TEXT,
    "margen_puntualidad_min" INTEGER NOT NULL DEFAULT 5,
    "inicializado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumnos" (
    "id" SERIAL NOT NULL,
    "carnet" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "sexo" TEXT,
    "grado" TEXT NOT NULL,
    "especialidad" TEXT,
    "jornada" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "foto_path" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alumnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal" (
    "id" SERIAL NOT NULL,
    "carnet" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "sexo" TEXT,
    "cargo" TEXT,
    "jornada" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "foto_path" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_qr" (
    "id" SERIAL NOT NULL,
    "persona_tipo" TEXT NOT NULL,
    "alumno_id" INTEGER,
    "personal_id" INTEGER,
    "token" TEXT NOT NULL,
    "png_path" TEXT,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "generado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regenerado_en" TIMESTAMP(3),

    CONSTRAINT "codigos_qr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" SERIAL NOT NULL,
    "persona_tipo" TEXT NOT NULL,
    "alumno_id" INTEGER,
    "personal_id" INTEGER,
    "tipo_evento" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origen" TEXT NOT NULL DEFAULT 'QR',
    "dispositivo" TEXT,
    "estado_puntualidad" TEXT,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'operador',
    "hash_pass" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" SERIAL NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidad_id" INTEGER,
    "usuario_id" INTEGER,
    "accion" TEXT NOT NULL,
    "detalle" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "excusas" (
    "id" SERIAL NOT NULL,
    "alumno_id" INTEGER,
    "personal_id" INTEGER,
    "motivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "excusas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_results" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "codigo_qr_id" INTEGER,
    "descripcion" TEXT NOT NULL,
    "reparado" BOOLEAN NOT NULL DEFAULT false,
    "reparado_en" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alumnos_carnet_key" ON "alumnos"("carnet");

-- CreateIndex
CREATE INDEX "alumnos_estado_idx" ON "alumnos"("estado");

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
CREATE INDEX "diagnostic_results_reparado_idx" ON "diagnostic_results"("reparado");

-- CreateIndex
CREATE INDEX "diagnostic_results_timestamp_idx" ON "diagnostic_results"("timestamp");

-- AddForeignKey
ALTER TABLE "codigos_qr" ADD CONSTRAINT "codigos_qr_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_qr" ADD CONSTRAINT "codigos_qr_personal_id_fkey" FOREIGN KEY ("personal_id") REFERENCES "personal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_personal_id_fkey" FOREIGN KEY ("personal_id") REFERENCES "personal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excusas" ADD CONSTRAINT "excusas_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excusas" ADD CONSTRAINT "excusas_personal_id_fkey" FOREIGN KEY ("personal_id") REFERENCES "personal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
