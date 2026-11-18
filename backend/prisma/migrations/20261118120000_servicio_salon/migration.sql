-- NULL distingue las cuentas anteriores (consumo al cobrar) de las confirmadas en salón.
ALTER TABLE `pedido` ADD COLUMN `version_salon` INTEGER NULL,
                     ADD COLUMN `comensales` INTEGER NULL;
ALTER TABLE `Detalle_pedido` ADD COLUMN `nota` VARCHAR(200) NULL;
CREATE INDEX `idx_consumo_pedido` ON `inventario_mov` (`origen_tipo`, `origen_id`);
