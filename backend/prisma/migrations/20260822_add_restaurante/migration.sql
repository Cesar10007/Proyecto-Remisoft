-- CreateTable
CREATE TABLE `restaurante` (
  `id_restaurante` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `direccion` VARCHAR(200) NULL,
  `telefono` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  `activo` BOOLEAN NOT NULL DEFAULT TRUE,
  `fecha_creacion` DATETIME(0) NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id_restaurante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `usuario`
  ADD COLUMN `id_restaurante` INT NULL,
  ADD INDEX `id_restaurante` (`id_restaurante`),
  ADD CONSTRAINT `usuario_ibfk_restaurante`
    FOREIGN KEY (`id_restaurante`)
    REFERENCES `restaurante` (`id_restaurante`)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT;
