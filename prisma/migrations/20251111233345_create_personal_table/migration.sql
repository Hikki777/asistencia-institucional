-- CreateIndex
CREATE INDEX "alumnos_estado_idx" ON "alumnos"("estado");

-- CreateIndex
CREATE INDEX "auditoria_timestamp_idx" ON "auditoria"("timestamp");

-- CreateIndex
CREATE INDEX "auditoria_entidad_idx" ON "auditoria"("entidad");

-- CreateIndex
CREATE INDEX "codigos_qr_token_idx" ON "codigos_qr"("token");

-- CreateIndex
CREATE INDEX "codigos_qr_vigente_idx" ON "codigos_qr"("vigente");

-- CreateIndex
CREATE INDEX "diagnostic_results_reparado_idx" ON "diagnostic_results"("reparado");

-- CreateIndex
CREATE INDEX "diagnostic_results_timestamp_idx" ON "diagnostic_results"("timestamp");

-- CreateIndex
CREATE INDEX "personal_estado_idx" ON "personal"("estado");
