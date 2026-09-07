-- AlterTable
ALTER TABLE `caja` ADD COLUMN `id_restaurante` INTEGER NULL;

-- AlterTable
ALTER TABLE `inventario_mov` ADD COLUMN `id_restaurante` INTEGER NULL;

-- AlterTable
ALTER TABLE `lote_ingrediente` ADD COLUMN `id_restaurante` INTEGER NULL;

-- AlterTable
ALTER TABLE `orden_compra` ADD COLUMN `id_restaurante` INTEGER NULL;

-- AlterTable
ALTER TABLE `pedido` ADD COLUMN `id_restaurante` INTEGER NULL;

-- AlterTable
ALTER TABLE `proveedor` ADD COLUMN `id_restaurante` INTEGER NULL;

-- AlterTable
ALTER TABLE `turno_caja` ADD COLUMN `id_restaurante` INTEGER NULL;

-- AlterTable
ALTER TABLE `usuario` MODIFY `estado` VARCHAR(20) NULL DEFAULT 'ACTIVO';

-- CreateIndex
CREATE INDEX `idx_caja_restaurante` ON `caja`(`id_restaurante`);

-- CreateIndex
CREATE INDEX `idx_inventario_mov_restaurante` ON `inventario_mov`(`id_restaurante`);

-- CreateIndex
CREATE INDEX `idx_lote_ingrediente_restaurante` ON `lote_ingrediente`(`id_restaurante`);

-- CreateIndex
CREATE INDEX `idx_orden_compra_restaurante` ON `orden_compra`(`id_restaurante`);

-- CreateIndex
CREATE INDEX `idx_pedido_restaurante` ON `pedido`(`id_restaurante`);

-- CreateIndex
CREATE INDEX `idx_proveedor_restaurante` ON `proveedor`(`id_restaurante`);

-- CreateIndex
CREATE INDEX `idx_turno_caja_restaurante` ON `turno_caja`(`id_restaurante`);

-- AddForeignKey
ALTER TABLE `caja` ADD CONSTRAINT `caja_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante`(`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventario_mov` ADD CONSTRAINT `inventario_mov_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante`(`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `lote_ingrediente` ADD CONSTRAINT `lote_ingrediente_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante`(`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `orden_compra` ADD CONSTRAINT `orden_compra_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante`(`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante`(`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `proveedor` ADD CONSTRAINT `proveedor_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante`(`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `turno_caja` ADD CONSTRAINT `turno_caja_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante`(`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;
