-- No se modifican las mesas ni los pedidos existentes. Esta fila solo existe
-- entre sentar al grupo y tomar el primer pedido (o liberar la mesa vacía).
CREATE TABLE `mesa_atencion` (
  `id_atencion` INTEGER NOT NULL AUTO_INCREMENT,
  `numero` INTEGER NOT NULL,
  `id_restaurante` INTEGER NULL,
  `id_mesero` INTEGER NOT NULL,
  `comensales` INTEGER NOT NULL,
  `desde` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id_atencion`),
  UNIQUE INDEX `mesa_atencion_numero_sede_key` (`numero`, `id_restaurante`),
  INDEX `mesa_atencion_sede_idx` (`id_restaurante`),
  INDEX `mesa_atencion_mesero_idx` (`id_mesero`),
  CONSTRAINT `mesa_atencion_numero_fkey` FOREIGN KEY (`numero`) REFERENCES `mesa`(`numero`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `mesa_atencion_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante`(`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `mesa_atencion_id_mesero_fkey` FOREIGN KEY (`id_mesero`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
