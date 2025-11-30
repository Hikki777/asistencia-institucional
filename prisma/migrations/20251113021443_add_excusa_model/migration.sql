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

-- CreateIndex
CREATE INDEX "excusas_fecha_idx" ON "excusas"("fecha");
