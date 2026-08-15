-- CreateTable
CREATE TABLE `Cliente` (
    `id_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(50) NULL,
    `Apellido` VARCHAR(50) NULL,
    `Email` VARCHAR(60) NULL,
    `Telefono` VARCHAR(20) NULL,
    `Direccion` VARCHAR(120) NULL,
    `coordenadas_gps` VARCHAR(80) NULL,
    `tipo_documento` VARCHAR(30) NULL,
    `Num_documento` VARCHAR(30) NULL,
    `fecha_registro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Email`(`Email`),
    PRIMARY KEY (`id_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Detalle_pedido` (
    `id_detalle` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `id_producto` INTEGER NOT NULL,
    `Cantidad` INTEGER NULL,
    `Precio_unitario` DECIMAL(10, 2) NULL,
    `estado_item` VARCHAR(20) NULL DEFAULT 'PENDIENTE',

    INDEX `id_pedido`(`id_pedido`),
    INDEX `id_producto`(`id_producto`),
    PRIMARY KEY (`id_detalle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Factura` (
    `id_factura` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `Fecha_emision` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `consecutivo` VARCHAR(40) NULL,
    `CUFE` VARCHAR(80) NULL,
    `IVA` DECIMAL(10, 2) NULL,
    `Descuento` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `Propina` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total` DECIMAL(10, 2) NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'EMITIDA',

    UNIQUE INDEX `id_pedido`(`id_pedido`),
    PRIMARY KEY (`id_factura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Factura_item` (
    `id_factura` INTEGER NOT NULL,
    `id_detalle_pedido` INTEGER NOT NULL,
    `cantidad_facturada` INTEGER NULL,

    INDEX `id_detalle_pedido`(`id_detalle_pedido`),
    PRIMARY KEY (`id_factura`, `id_detalle_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IA` (
    `id_IA` INTEGER NOT NULL AUTO_INCREMENT,
    `Fecha_generacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Tipo_prediccion` VARCHAR(50) NULL,
    `Resultado_generado` VARCHAR(500) NULL,
    `Recomendaciones_generales` VARCHAR(500) NULL,
    `Nivel_confianza` DECIMAL(4, 3) NULL,
    `periodo_inicio` DATE NULL,
    `periodo_fin` DATE NULL,

    PRIMARY KEY (`id_IA`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IA_INGREDIENTE` (
    `id_IA_ingrediente` INTEGER NOT NULL AUTO_INCREMENT,
    `id_IA` INTEGER NOT NULL,
    `id_ingrediente` INTEGER NOT NULL,
    `Demanda_predicha_ingrediente` DECIMAL(10, 2) NULL,
    `Nivel_confianza` DECIMAL(4, 3) NULL,
    `Ingrediente_critico` BOOLEAN NULL DEFAULT false,

    INDEX `id_IA`(`id_IA`),
    INDEX `id_ingrediente`(`id_ingrediente`),
    PRIMARY KEY (`id_IA_ingrediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IA_PRODUCTO` (
    `id_IA_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `id_IA` INTEGER NOT NULL,
    `id_producto` INTEGER NOT NULL,
    `demanda_predicho_producto` DECIMAL(10, 2) NULL,
    `nivel_confianza_producto` DECIMAL(4, 3) NULL,
    `Producto_critico` BOOLEAN NULL DEFAULT false,
    `Recomendacion_producto` VARCHAR(200) NULL,

    INDEX `id_IA`(`id_IA`),
    INDEX `id_producto`(`id_producto`),
    PRIMARY KEY (`id_IA_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ingrediente` (
    `id_ingrediente` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NULL,
    `descripcion` VARCHAR(500) NULL,
    `unidad_medida` VARCHAR(20) NULL,
    `costo_unitario_ref` DECIMAL(10, 2) NULL,
    `stock_minimo` DECIMAL(10, 2) NULL DEFAULT 0.00,

    PRIMARY KEY (`id_ingrediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Producto` (
    `id_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `Nombre` VARCHAR(50) NULL,
    `Descripcion` VARCHAR(500) NULL,
    `precio_venta` DECIMAL(10, 2) NULL,
    `Categoria` VARCHAR(30) NULL,
    `Tiempo_preparacion` TIME(0) NULL,
    `Estado` INTEGER NULL DEFAULT 1,

    PRIMARY KEY (`id_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Receta` (
    `id_receta` INTEGER NOT NULL AUTO_INCREMENT,
    `id_producto` INTEGER NOT NULL,
    `id_ingrediente` INTEGER NOT NULL,
    `Cantidad_necesaria` DECIMAL(10, 3) NULL,
    `Unidad` VARCHAR(20) NULL,

    INDEX `id_ingrediente`(`id_ingrediente`),
    INDEX `id_producto`(`id_producto`),
    PRIMARY KEY (`id_receta`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cache` (
    `key` VARCHAR(255) NOT NULL,
    `value` MEDIUMTEXT NOT NULL,
    `expiration` INTEGER NOT NULL,

    INDEX `cache_expiration_index`(`expiration`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cache_locks` (
    `key` VARCHAR(255) NOT NULL,
    `owner` VARCHAR(255) NOT NULL,
    `expiration` INTEGER NOT NULL,

    INDEX `cache_locks_expiration_index`(`expiration`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `caja` (
    `id_caja` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(40) NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'ACTIVA',
    `fecha_registro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_caja`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_orden_compra` (
    `id_detalle_compra` INTEGER NOT NULL AUTO_INCREMENT,
    `id_orden_compra` INTEGER NOT NULL,
    `id_ingrediente` INTEGER NOT NULL,
    `cantidad_solicitada` DECIMAL(10, 2) NULL,
    `cantidad_recibida` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `precio_unitario` DECIMAL(10, 2) NULL,

    INDEX `id_ingrediente`(`id_ingrediente`),
    INDEX `id_orden_compra`(`id_orden_compra`),
    PRIMARY KEY (`id_detalle_compra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `domicilio` (
    `id_domicilio` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pedido` INTEGER NOT NULL,
    `direccion` VARCHAR(150) NULL,
    `coordenadas_gps` VARCHAR(80) NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'ASIGNADO',
    `Fecha_asignacion` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_entrega` DATETIME(0) NULL,
    `id_repartidor` INTEGER NULL,

    UNIQUE INDEX `id_pedido`(`id_pedido`),
    INDEX `id_repartidor`(`id_repartidor`),
    PRIMARY KEY (`id_domicilio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `failed_jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(255) NOT NULL,
    `connection` TEXT NOT NULL,
    `queue` TEXT NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `exception` LONGTEXT NOT NULL,
    `failed_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `failed_jobs_uuid_unique`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flujo_caja` (
    `id_flujo` INTEGER NOT NULL AUTO_INCREMENT,
    `id_turno` INTEGER NOT NULL,
    `fecha` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `concepto` VARCHAR(100) NULL,
    `ingresos` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `egresos` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `saldo` DECIMAL(10, 2) NULL,
    `metodo` VARCHAR(30) NULL,
    `referencia` VARCHAR(80) NULL,
    `id_pago` INTEGER NULL,

    INDEX `id_pago`(`id_pago`),
    INDEX `id_turno`(`id_turno`),
    PRIMARY KEY (`id_flujo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventario_mov` (
    `id_movimiento` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ingrediente` INTEGER NOT NULL,
    `id_usuario` INTEGER NULL,
    `fecha_hora` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `tipo_movimiento` VARCHAR(20) NULL,
    `cantidad` DECIMAL(10, 3) NULL,
    `costo_unitario` DECIMAL(10, 2) NULL,
    `observaciones` VARCHAR(1000) NULL,
    `origen_tipo` VARCHAR(30) NULL,
    `origen_id` INTEGER NULL,
    `id_lote` INTEGER NULL,

    INDEX `id_ingrediente`(`id_ingrediente`),
    INDEX `id_lote`(`id_lote`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_movimiento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_batches` (
    `id` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `total_jobs` INTEGER NOT NULL,
    `pending_jobs` INTEGER NOT NULL,
    `failed_jobs` INTEGER NOT NULL,
    `failed_job_ids` LONGTEXT NOT NULL,
    `options` MEDIUMTEXT NULL,
    `cancelled_at` INTEGER NULL,
    `created_at` INTEGER NOT NULL,
    `finished_at` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `queue` VARCHAR(255) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `attempts` TINYINT UNSIGNED NOT NULL,
    `reserved_at` INTEGER UNSIGNED NULL,
    `available_at` INTEGER UNSIGNED NOT NULL,
    `created_at` INTEGER UNSIGNED NOT NULL,

    INDEX `jobs_queue_index`(`queue`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lote_ingrediente` (
    `id_lote` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ingrediente` INTEGER NOT NULL,
    `numero_lote` VARCHAR(40) NULL,
    `fecha_ingreso` DATE NULL,
    `fecha_vencimiento` DATE NULL,
    `stock_inicial` DECIMAL(10, 3) NULL,
    `stock_actual` DECIMAL(10, 3) NULL,
    `costo_promedio` DECIMAL(10, 2) NULL,
    `observaciones` VARCHAR(500) NULL,
    `fecha_registro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `numero_lote`(`numero_lote`),
    INDEX `id_ingrediente`(`id_ingrediente`),
    PRIMARY KEY (`id_lote`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `migrations` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `migration` VARCHAR(255) NOT NULL,
    `batch` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orden_compra` (
    `id_orden_compra` INTEGER NOT NULL AUTO_INCREMENT,
    `id_proveedor` INTEGER NOT NULL,
    `id_usuario` INTEGER NOT NULL,
    `fecha_orden` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_entrega_esperada` DATE NULL,
    `fecha_entrega_real` DATE NULL,
    `estado` VARCHAR(30) NULL DEFAULT 'PENDIENTE',
    `observaciones` VARCHAR(500) NULL,

    INDEX `id_proveedor`(`id_proveedor`),
    INDEX `id_usuario`(`id_usuario`),
    PRIMARY KEY (`id_orden_compra`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pago` (
    `id_pago` INTEGER NOT NULL AUTO_INCREMENT,
    `id_factura` INTEGER NOT NULL,
    `id_usuario_cajero` INTEGER NOT NULL,
    `fecha_pago` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `metodo` VARCHAR(30) NULL,
    `monto` DECIMAL(10, 2) NULL,
    `referencia` VARCHAR(80) NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'APROBADO',
    `id_turno` INTEGER NULL,

    INDEX `id_factura`(`id_factura`),
    INDEX `id_turno`(`id_turno`),
    INDEX `id_usuario_cajero`(`id_usuario_cajero`),
    PRIMARY KEY (`id_pago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido` (
    `id_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `id_cliente` INTEGER NULL,
    `id_mesero` INTEGER NULL,
    `Fecha_hora` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `estado` VARCHAR(20) NULL DEFAULT 'ABIERTO',
    `Tipo_pedido` VARCHAR(20) NULL,
    `Mesa_num` INTEGER NULL,
    `notas` VARCHAR(500) NULL,

    INDEX `id_cliente`(`id_cliente`),
    INDEX `id_mesero`(`id_mesero`),
    PRIMARY KEY (`id_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `personal_access_tokens` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tokenable_type` VARCHAR(255) NOT NULL,
    `tokenable_id` BIGINT UNSIGNED NOT NULL,
    `name` TEXT NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `abilities` TEXT NULL,
    `last_used_at` TIMESTAMP(0) NULL,
    `expires_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `personal_access_tokens_token_unique`(`token`),
    INDEX `personal_access_tokens_expires_at_index`(`expires_at`),
    INDEX `personal_access_tokens_tokenable_type_tokenable_id_index`(`tokenable_type`, `tokenable_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedor` (
    `id_proveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NULL,
    `nombre_contacto` VARCHAR(100) NULL,
    `telefono` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `direccion` VARCHAR(200) NULL,
    `nit` VARCHAR(30) NULL,
    `tipo_proveedor` VARCHAR(50) NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'ACTIVO',
    `fecha_registro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id_proveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedor_ingrediente` (
    `id_proveedor` INTEGER NOT NULL,
    `id_ingrediente` INTEGER NOT NULL,
    `precio_acordado` DECIMAL(10, 2) NULL,
    `tiempo_entrega_dias` INTEGER NULL,
    `calidad_rating` DECIMAL(2, 1) NULL,
    `es_proveedor_principal` BOOLEAN NULL DEFAULT false,
    `fecha_ultima_compra` DATETIME(0) NULL,

    INDEX `id_ingrediente`(`id_ingrediente`),
    PRIMARY KEY (`id_proveedor`, `id_ingrediente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rol` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(30) NULL,
    `descripcion` VARCHAR(200) NULL,

    UNIQUE INDEX `nombre`(`nombre`),
    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(255) NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `payload` LONGTEXT NOT NULL,
    `last_activity` INTEGER NOT NULL,

    INDEX `sessions_last_activity_index`(`last_activity`),
    INDEX `sessions_user_id_index`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turno_caja` (
    `id_turno` INTEGER NOT NULL AUTO_INCREMENT,
    `id_caja` INTEGER NOT NULL,
    `id_usuario_cajero` INTEGER NOT NULL,
    `fecha_apertura` DATETIME(0) NULL,
    `fecha_cierre` DATETIME(0) NULL,
    `efectivo_inicial` DECIMAL(10, 2) NULL,
    `efectivo_esperado` DECIMAL(10, 2) NULL,
    `efectivo_real` DECIMAL(10, 2) NULL,
    `diferencia` DECIMAL(10, 2) NULL,
    `notas` VARCHAR(500) NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'ABIERTA',

    INDEX `id_caja`(`id_caja`),
    INDEX `id_usuario_cajero`(`id_usuario_cajero`),
    PRIMARY KEY (`id_turno`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `email_verified_at` TIMESTAMP(0) NULL,
    `password` VARCHAR(255) NOT NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `users_email_unique`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `id_rol` INTEGER NOT NULL,
    `identificacion` VARCHAR(20) NULL,
    `nombre` VARCHAR(60) NULL,
    `apellido` VARCHAR(60) NULL,
    `email` VARCHAR(100) NULL,
    `telefono` VARCHAR(20) NULL,
    `contrasena_hash` VARCHAR(255) NULL,
    `activo` BOOLEAN NULL DEFAULT true,
    `fecha_registro` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    INDEX `id_rol`(`id_rol`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Detalle_pedido` ADD CONSTRAINT `Detalle_pedido_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id_pedido`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Detalle_pedido` ADD CONSTRAINT `Detalle_pedido_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `Producto`(`id_producto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Factura` ADD CONSTRAINT `Factura_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id_pedido`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Factura_item` ADD CONSTRAINT `Factura_item_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `Factura`(`id_factura`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Factura_item` ADD CONSTRAINT `Factura_item_ibfk_2` FOREIGN KEY (`id_detalle_pedido`) REFERENCES `Detalle_pedido`(`id_detalle`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `IA_INGREDIENTE` ADD CONSTRAINT `IA_INGREDIENTE_ibfk_1` FOREIGN KEY (`id_IA`) REFERENCES `IA`(`id_IA`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `IA_INGREDIENTE` ADD CONSTRAINT `IA_INGREDIENTE_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente`(`id_ingrediente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `IA_PRODUCTO` ADD CONSTRAINT `IA_PRODUCTO_ibfk_1` FOREIGN KEY (`id_IA`) REFERENCES `IA`(`id_IA`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `IA_PRODUCTO` ADD CONSTRAINT `IA_PRODUCTO_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `Producto`(`id_producto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Receta` ADD CONSTRAINT `Receta_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `Producto`(`id_producto`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `Receta` ADD CONSTRAINT `Receta_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente`(`id_ingrediente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_orden_compra` ADD CONSTRAINT `detalle_orden_compra_ibfk_1` FOREIGN KEY (`id_orden_compra`) REFERENCES `orden_compra`(`id_orden_compra`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `detalle_orden_compra` ADD CONSTRAINT `detalle_orden_compra_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente`(`id_ingrediente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `domicilio` ADD CONSTRAINT `domicilio_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido`(`id_pedido`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `domicilio` ADD CONSTRAINT `domicilio_ibfk_2` FOREIGN KEY (`id_repartidor`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `flujo_caja` ADD CONSTRAINT `flujo_caja_ibfk_1` FOREIGN KEY (`id_turno`) REFERENCES `turno_caja`(`id_turno`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `flujo_caja` ADD CONSTRAINT `flujo_caja_ibfk_2` FOREIGN KEY (`id_pago`) REFERENCES `pago`(`id_pago`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventario_mov` ADD CONSTRAINT `inventario_mov_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente`(`id_ingrediente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventario_mov` ADD CONSTRAINT `inventario_mov_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventario_mov` ADD CONSTRAINT `inventario_mov_ibfk_3` FOREIGN KEY (`id_lote`) REFERENCES `lote_ingrediente`(`id_lote`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `lote_ingrediente` ADD CONSTRAINT `lote_ingrediente_ibfk_1` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente`(`id_ingrediente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `orden_compra` ADD CONSTRAINT `orden_compra_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor`(`id_proveedor`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `orden_compra` ADD CONSTRAINT `orden_compra_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `Factura`(`id_factura`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_ibfk_2` FOREIGN KEY (`id_usuario_cajero`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pago` ADD CONSTRAINT `pago_ibfk_3` FOREIGN KEY (`id_turno`) REFERENCES `turno_caja`(`id_turno`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente`(`id_cliente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `pedido` ADD CONSTRAINT `pedido_ibfk_2` FOREIGN KEY (`id_mesero`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `proveedor_ingrediente` ADD CONSTRAINT `proveedor_ingrediente_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor`(`id_proveedor`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `proveedor_ingrediente` ADD CONSTRAINT `proveedor_ingrediente_ibfk_2` FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente`(`id_ingrediente`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `turno_caja` ADD CONSTRAINT `turno_caja_ibfk_1` FOREIGN KEY (`id_caja`) REFERENCES `caja`(`id_caja`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `turno_caja` ADD CONSTRAINT `turno_caja_ibfk_2` FOREIGN KEY (`id_usuario_cajero`) REFERENCES `usuario`(`id_usuario`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id_rol`) ON DELETE RESTRICT ON UPDATE RESTRICT;
