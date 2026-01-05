/*
  Warnings:

  - You are about to alter the column `fecha_cierre` on the `ticket` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `ultimo_inicio_sesion` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - Made the column `cumplimiento_respuesta` on table `ticket` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cumplimiento_resolucion` on table `ticket` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `ticket` MODIFY `fecha_cierre` DATETIME NULL,
    MODIFY `cumplimiento_respuesta` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `cumplimiento_resolucion` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `usuario` MODIFY `ultimo_inicio_sesion` DATETIME NULL;
