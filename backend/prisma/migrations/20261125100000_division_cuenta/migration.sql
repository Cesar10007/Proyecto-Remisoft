CREATE TABLE `division_cuenta` (
  `id_division` INT NOT NULL AUTO_INCREMENT,
  `id_pedido` INT NOT NULL,
  `modo` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_division`),
  UNIQUE INDEX `division_cuenta_pedido_key` (`id_pedido`),
  CONSTRAINT `division_cuenta_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `parte_cuenta` (
  `id_parte` INT NOT NULL AUTO_INCREMENT,
  `id_division` INT NOT NULL,
  `numero` INT NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id_parte`),
  UNIQUE INDEX `parte_cuenta_numero_key` (`id_division`, `numero`),
  INDEX `idx_parte_cuenta_division` (`id_division`),
  CONSTRAINT `parte_cuenta_ibfk_1` FOREIGN KEY (`id_division`) REFERENCES `division_cuenta` (`id_division`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `detalle_parte_cuenta` (
  `id_parte` INT NOT NULL,
  `id_detalle` INT NOT NULL,
  `cantidad` INT NOT NULL,
  PRIMARY KEY (`id_parte`, `id_detalle`),
  INDEX `idx_detalle_parte_detalle` (`id_detalle`),
  CONSTRAINT `detalle_parte_cuenta_ibfk_1` FOREIGN KEY (`id_parte`) REFERENCES `parte_cuenta` (`id_parte`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `detalle_parte_cuenta_ibfk_2` FOREIGN KEY (`id_detalle`) REFERENCES `Detalle_pedido` (`id_detalle`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `pago`
  ADD COLUMN `id_parte` INT NULL,
  ADD COLUMN `monto_recibido` DECIMAL(10, 2) NULL,
  ADD COLUMN `cambio` DECIMAL(10, 2) NULL,
  ADD INDEX `idx_pago_parte` (`id_parte`),
  ADD CONSTRAINT `pago_ibfk_parte` FOREIGN KEY (`id_parte`) REFERENCES `parte_cuenta` (`id_parte`) ON DELETE RESTRICT ON UPDATE RESTRICT;
