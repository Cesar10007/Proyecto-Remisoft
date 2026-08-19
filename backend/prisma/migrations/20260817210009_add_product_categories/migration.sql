-- AlterTable
ALTER TABLE `Producto` ADD COLUMN `id_categoria` INTEGER NULL;

-- CreateTable
CREATE TABLE `categoria_productos` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    UNIQUE INDEX `categoria_productos_nombre_key`(`nombre`),
    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `id_categoria` ON `Producto`(`id_categoria`);

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_ibfk_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categoria_productos`(`id_categoria`) ON DELETE RESTRICT ON UPDATE RESTRICT;
