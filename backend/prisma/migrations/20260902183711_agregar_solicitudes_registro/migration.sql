-- AlterTable
ALTER TABLE `restaurante` MODIFY `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `solicitud_registro` (
    `id_solicitud` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(60) NOT NULL,
    `apellido` VARCHAR(60) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `contrasena_hash` VARCHAR(255) NOT NULL,
    `id_rol_solicitado` INTEGER NOT NULL,
    `id_restaurante` INTEGER NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    `motivo_rechazo` VARCHAR(500) NULL,
    `fecha_solicitud` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_revision` DATETIME(0) NULL,
    `revisado_por` INTEGER NULL,

    UNIQUE INDEX `solicitud_registro_email_unique`(`email`),
    INDEX `id_rol_solicitado`(`id_rol_solicitado`),
    INDEX `id_restaurante`(`id_restaurante`),
    INDEX `revisado_por`(`revisado_por`),
    INDEX `estado`(`estado`),
    PRIMARY KEY (`id_solicitud`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `solicitud_registro` ADD CONSTRAINT `solicitud_registro_ibfk_rol` FOREIGN KEY (`id_rol_solicitado`) REFERENCES `rol`(`id_rol`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `solicitud_registro` ADD CONSTRAINT `solicitud_registro_ibfk_revisor` FOREIGN KEY (`revisado_por`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;
