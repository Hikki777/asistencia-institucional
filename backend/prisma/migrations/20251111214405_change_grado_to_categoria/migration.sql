/*
  Warnings:

  - You are about to drop the column `grado` on the `personal` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_personal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "carnet" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "sexo" TEXT,
    "categoria" TEXT,
    "jornada" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "foto_path" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" DATETIME NOT NULL
);
INSERT INTO "new_personal" ("actualizado_en", "apellidos", "carnet", "creado_en", "estado", "foto_path", "id", "jornada", "nombres", "sexo") SELECT "actualizado_en", "apellidos", "carnet", "creado_en", "estado", "foto_path", "id", "jornada", "nombres", "sexo" FROM "personal";
DROP TABLE "personal";
ALTER TABLE "new_personal" RENAME TO "personal";
CREATE UNIQUE INDEX "personal_carnet_key" ON "personal"("carnet");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
