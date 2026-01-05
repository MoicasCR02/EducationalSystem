/*
  Warnings:

  - You are about to alter the column `fecha_cierre` on the `ticket` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `ultimo_inicio_sesion` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `ticket` MODIFY `fecha_cierre` DATETIME NULL;

-- AlterTable
ALTER TABLE `usuario` MODIFY `ultimo_inicio_sesion` DATETIME NULL;
