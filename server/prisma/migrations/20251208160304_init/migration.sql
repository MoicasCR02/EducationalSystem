-- CreateTable
CREATE TABLE `Prioridad` (
    `id_prioridad` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_prioridad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `id_rol` ENUM('ADMIN', 'TECNICO', 'USER') NOT NULL DEFAULT 'USER',
    `ultimo_inicio_sesion` DATETIME NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `carga_actual` INTEGER NOT NULL DEFAULT 0,
    `disponible` BOOLEAN NULL,

    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Especialidad` (
    `id_especialidad` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    PRIMARY KEY (`id_especialidad`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `id_sla` INTEGER NOT NULL,

    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Etiqueta` (
    `id_etiqueta` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_etiqueta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sla` (
    `id_sla` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `tiempo_max_respuesta` INTEGER NOT NULL,
    `tiempo_max_resolucion` INTEGER NOT NULL,

    PRIMARY KEY (`id_sla`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id_ticket` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(200) NOT NULL,
    `descripcion` VARCHAR(100) NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_cierre` DATETIME NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    `prioridad` VARCHAR(20) NOT NULL DEFAULT 'Baja',
    `cumplimiento_respuesta` BOOLEAN NULL,
    `cumplimiento_resolucion` BOOLEAN NULL,
    `id_categoria` INTEGER NOT NULL,
    `id_usuario_cliente` INTEGER NOT NULL,

    PRIMARY KEY (`id_ticket`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Asignacion` (
    `id_asignacion` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_asignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metodo` VARCHAR(20) NOT NULL,
    `justificacion` VARCHAR(50) NULL,
    `id_ticket` INTEGER NOT NULL,
    `id_tecnico` INTEGER NOT NULL,
    `id_reglaAutotriage` INTEGER NULL,

    PRIMARY KEY (`id_asignacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Valoracion` (
    `id_valoracion` INTEGER NOT NULL AUTO_INCREMENT,
    `puntuacion` INTEGER NULL,
    `comentario` VARCHAR(255) NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_ticket` INTEGER NOT NULL,

    UNIQUE INDEX `Valoracion_id_ticket_key`(`id_ticket`),
    PRIMARY KEY (`id_valoracion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Historial_Estado` (
    `id_historial` INTEGER NOT NULL AUTO_INCREMENT,
    `estado_anterior` VARCHAR(20) NULL,
    `nuevo_estado` VARCHAR(20) NULL,
    `observaciones` VARCHAR(100) NULL,
    `fecha_cambio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_ticket` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,

    PRIMARY KEY (`id_historial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reglas_Autotriage` (
    `id_regla` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `prioridad_base` INTEGER NOT NULL,
    `peso_carga` INTEGER NOT NULL,
    `peso_sla` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id_regla`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Imagen_Ticket` (
    `id_imagen` INTEGER NOT NULL AUTO_INCREMENT,
    `ruta_imagen` VARCHAR(191) NOT NULL DEFAULT 'image-not-found.jpg',
    `id_historial` INTEGER NOT NULL,

    PRIMARY KEY (`id_imagen`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacion` (
    `id_notificacion` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(100) NOT NULL,
    `mensaje` VARCHAR(255) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leido` BOOLEAN NOT NULL DEFAULT false,
    `id_remitente` INTEGER NOT NULL,
    `id_destinatario` INTEGER NOT NULL,

    PRIMARY KEY (`id_notificacion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EspecialidadToUsuario` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EspecialidadToUsuario_AB_unique`(`A`, `B`),
    INDEX `_EspecialidadToUsuario_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CategoriaToEspecialidad` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CategoriaToEspecialidad_AB_unique`(`A`, `B`),
    INDEX `_CategoriaToEspecialidad_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CategoriaToEtiqueta` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CategoriaToEtiqueta_AB_unique`(`A`, `B`),
    INDEX `_CategoriaToEtiqueta_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_id_sla_fkey` FOREIGN KEY (`id_sla`) REFERENCES `Sla`(`id_sla`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_id_categoria_fkey` FOREIGN KEY (`id_categoria`) REFERENCES `Categoria`(`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_id_usuario_cliente_fkey` FOREIGN KEY (`id_usuario_cliente`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_id_ticket_fkey` FOREIGN KEY (`id_ticket`) REFERENCES `Ticket`(`id_ticket`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_id_tecnico_fkey` FOREIGN KEY (`id_tecnico`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asignacion` ADD CONSTRAINT `Asignacion_id_reglaAutotriage_fkey` FOREIGN KEY (`id_reglaAutotriage`) REFERENCES `Reglas_Autotriage`(`id_regla`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Valoracion` ADD CONSTRAINT `Valoracion_id_ticket_fkey` FOREIGN KEY (`id_ticket`) REFERENCES `Ticket`(`id_ticket`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial_Estado` ADD CONSTRAINT `Historial_Estado_id_ticket_fkey` FOREIGN KEY (`id_ticket`) REFERENCES `Ticket`(`id_ticket`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Historial_Estado` ADD CONSTRAINT `Historial_Estado_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Imagen_Ticket` ADD CONSTRAINT `Imagen_Ticket_id_historial_fkey` FOREIGN KEY (`id_historial`) REFERENCES `Historial_Estado`(`id_historial`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_id_remitente_fkey` FOREIGN KEY (`id_remitente`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_id_destinatario_fkey` FOREIGN KEY (`id_destinatario`) REFERENCES `Usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EspecialidadToUsuario` ADD CONSTRAINT `_EspecialidadToUsuario_A_fkey` FOREIGN KEY (`A`) REFERENCES `Especialidad`(`id_especialidad`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EspecialidadToUsuario` ADD CONSTRAINT `_EspecialidadToUsuario_B_fkey` FOREIGN KEY (`B`) REFERENCES `Usuario`(`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToEspecialidad` ADD CONSTRAINT `_CategoriaToEspecialidad_A_fkey` FOREIGN KEY (`A`) REFERENCES `Categoria`(`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToEspecialidad` ADD CONSTRAINT `_CategoriaToEspecialidad_B_fkey` FOREIGN KEY (`B`) REFERENCES `Especialidad`(`id_especialidad`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToEtiqueta` ADD CONSTRAINT `_CategoriaToEtiqueta_A_fkey` FOREIGN KEY (`A`) REFERENCES `Categoria`(`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaToEtiqueta` ADD CONSTRAINT `_CategoriaToEtiqueta_B_fkey` FOREIGN KEY (`B`) REFERENCES `Etiqueta`(`id_etiqueta`) ON DELETE CASCADE ON UPDATE CASCADE;
