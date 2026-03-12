CREATE TABLE `rol` (
  `id_rol` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(30) UNIQUE,
  `descripcion` VARCHAR(200)
);

CREATE TABLE `usuario` (
  `id_usuario` INT PRIMARY KEY AUTO_INCREMENT,
  `id_rol` INT NOT NULL,
  `identificacion` VARCHAR(20),
  `nombre` VARCHAR(60),
  `apellido` VARCHAR(60),
  `email` VARCHAR(100) UNIQUE,
  `telefono` VARCHAR(20),
  `contrasena_hash` VARCHAR(255),
  `activo` BOOLEAN DEFAULT true,
  `fecha_registro` DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `Cliente` (
  `id_cliente` INT PRIMARY KEY AUTO_INCREMENT,
  `Nombre` VARCHAR(50),
  `Apellido` VARCHAR(50),
  `Email` VARCHAR(60) UNIQUE,
  `Telefono` VARCHAR(20),
  `Direccion` VARCHAR(120),
  `coordenadas_gps` VARCHAR(80),
  `tipo_documento` VARCHAR(30),
  `Num_documento` VARCHAR(30),
  `fecha_registro` DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `caja` (
  `id_caja` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(40),
  `estado` VARCHAR(20) DEFAULT (ACTIVA),
  `fecha_registro` DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `turno_caja` (
  `id_turno` INT PRIMARY KEY AUTO_INCREMENT,
  `id_caja` INT NOT NULL,
  `id_usuario_cajero` INT NOT NULL,
  `fecha_apertura` DATETIME,
  `fecha_cierre` DATETIME,
  `efectivo_inicial` DECIMAL(10,2),
  `efectivo_esperado` DECIMAL(10,2),
  `efectivo_real` DECIMAL(10,2),
  `diferencia` DECIMAL(10,2),
  `notas` VARCHAR(500),
  `estado` VARCHAR(20) DEFAULT (ABIERTA)
);

CREATE TABLE `flujo_caja` (
  `id_flujo` INT PRIMARY KEY AUTO_INCREMENT,
  `id_turno` INT NOT NULL,
  `fecha` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  `concepto` VARCHAR(100),
  `ingresos` DECIMAL(10,2) DEFAULT (0),
  `egresos` DECIMAL(10,2) DEFAULT (0),
  `saldo` DECIMAL(10,2),
  `metodo` VARCHAR(30),
  `referencia` VARCHAR(80),
  `id_pago` INT
);

CREATE TABLE `proveedor` (
  `id_proveedor` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(100),
  `nombre_contacto` VARCHAR(100),
  `telefono` VARCHAR(20),
  `email` VARCHAR(100),
  `direccion` VARCHAR(200),
  `nit` VARCHAR(30),
  `tipo_proveedor` VARCHAR(50),
  `estado` VARCHAR(20) DEFAULT (ACTIVO),
  `fecha_registro` DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `Producto` (
  `id_producto` INT PRIMARY KEY AUTO_INCREMENT,
  `Nombre` VARCHAR(50),
  `Descripcion` VARCHAR(500),
  `precio_venta` DECIMAL(10,2),
  `Categoria` VARCHAR(30),
  `Tiempo_preparacion` TIME,
  `Estado` INT DEFAULT (1)
);

CREATE TABLE `Ingrediente` (
  `id_ingrediente` INT PRIMARY KEY AUTO_INCREMENT,
  `nombre` VARCHAR(50),
  `descripcion` VARCHAR(500),
  `unidad_medida` VARCHAR(20),
  `costo_unitario_ref` DECIMAL(10,2),
  `stock_minimo` DECIMAL(10,2) DEFAULT (0)
);

CREATE TABLE `lote_ingrediente` (
  `id_lote` INT PRIMARY KEY AUTO_INCREMENT,
  `id_ingrediente` INT NOT NULL,
  `numero_lote` VARCHAR(40) UNIQUE,
  `fecha_ingreso` DATE,
  `fecha_vencimiento` DATE,
  `stock_inicial` DECIMAL(10,3),
  `stock_actual` DECIMAL(10,3),
  `costo_promedio` DECIMAL(10,2),
  `observaciones` VARCHAR(500),
  `fecha_registro` DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `pedido` (
  `id_pedido` INT PRIMARY KEY AUTO_INCREMENT,
  `id_cliente` INT,
  `id_mesero` INT,
  `Fecha_hora` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  `estado` VARCHAR(20) DEFAULT (ABIERTO),
  `Tipo_pedido` VARCHAR(20),
  `Mesa_num` INT,
  `notas` VARCHAR(500)
);

CREATE TABLE `Detalle_pedido` (
  `id_detalle` INT PRIMARY KEY AUTO_INCREMENT,
  `id_pedido` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `Cantidad` INT,
  `Precio_unitario` DECIMAL(10,2),
  `estado_item` VARCHAR(20) DEFAULT (PENDIENTE)
);

CREATE TABLE `Factura` (
  `id_factura` INT PRIMARY KEY AUTO_INCREMENT,
  `id_pedido` INT UNIQUE NOT NULL,
  `Fecha_emision` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  `consecutivo` VARCHAR(40),
  `CUFE` VARCHAR(80),
  `IVA` DECIMAL(10,2),
  `Descuento` DECIMAL(10,2) DEFAULT (0),
  `Propina` DECIMAL(10,2) DEFAULT (0),
  `total` DECIMAL(10,2),
  `estado` VARCHAR(20) DEFAULT (EMITIDA)
);

CREATE TABLE `pago` (
  `id_pago` INT PRIMARY KEY AUTO_INCREMENT,
  `id_factura` INT NOT NULL,
  `id_usuario_cajero` INT NOT NULL,
  `fecha_pago` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  `metodo` VARCHAR(30),
  `monto` DECIMAL(10,2),
  `referencia` VARCHAR(80),
  `estado` VARCHAR(20) DEFAULT (APROBADO),
  `id_turno` INT
);

CREATE TABLE `Factura_item` (
  `id_factura` INT,
  `id_detalle_pedido` INT,
  `cantidad_facturada` INT,
  PRIMARY KEY (`id_factura`, `id_detalle_pedido`)
);

CREATE TABLE `orden_compra` (
  `id_orden_compra` INT PRIMARY KEY AUTO_INCREMENT,
  `id_proveedor` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `fecha_orden` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  `fecha_entrega_esperada` DATE,
  `fecha_entrega_real` DATE,
  `estado` VARCHAR(30) DEFAULT (PENDIENTE),
  `observaciones` VARCHAR(500)
);

CREATE TABLE `detalle_orden_compra` (
  `id_detalle_compra` INT PRIMARY KEY AUTO_INCREMENT,
  `id_orden_compra` INT NOT NULL,
  `id_ingrediente` INT NOT NULL,
  `cantidad_solicitada` DECIMAL(10,2),
  `cantidad_recibida` DECIMAL(10,2) DEFAULT (0),
  `precio_unitario` DECIMAL(10,2)
);

CREATE TABLE `proveedor_ingrediente` (
  `id_proveedor` INT,
  `id_ingrediente` INT,
  `precio_acordado` DECIMAL(10,2),
  `tiempo_entrega_dias` INT,
  `calidad_rating` DECIMAL(2,1),
  `es_proveedor_principal` BOOLEAN DEFAULT (false),
  `fecha_ultima_compra` DATETIME,
  PRIMARY KEY (`id_proveedor`, `id_ingrediente`)
);

CREATE TABLE `Receta` (
  `id_receta` INT PRIMARY KEY AUTO_INCREMENT,
  `id_producto` INT NOT NULL,
  `id_ingrediente` INT NOT NULL,
  `Cantidad_necesaria` DECIMAL(10,3),
  `Unidad` VARCHAR(20)
);

CREATE TABLE `inventario_mov` (
  `id_movimiento` INT PRIMARY KEY AUTO_INCREMENT,
  `id_ingrediente` INT NOT NULL,
  `id_usuario` INT,
  `fecha_hora` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  `tipo_movimiento` VARCHAR(20),
  `cantidad` DECIMAL(10,3),
  `costo_unitario` DECIMAL(10,2),
  `observaciones` VARCHAR(1000),
  `origen_tipo` VARCHAR(30),
  `origen_id` INT,
  `id_lote` INT
);

CREATE TABLE `domicilio` (
  `id_domicilio` INT PRIMARY KEY AUTO_INCREMENT,
  `id_pedido` INT UNIQUE NOT NULL,
  `direccion` VARCHAR(150),
  `coordenadas_gps` VARCHAR(80),
  `estado` VARCHAR(20) DEFAULT (ASIGNADO),
  `Fecha_asignacion` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  `fecha_entrega` DATETIME,
  `id_repartidor` INT
);

CREATE TABLE `IA` (
  `id_IA` INT PRIMARY KEY AUTO_INCREMENT,
  `Fecha_generacion` DATETIME DEFAULT (CURRENT_TIMESTAMP),
  `Tipo_prediccion` VARCHAR(50),
  `Resultado_generado` VARCHAR(500),
  `Recomendaciones_generales` VARCHAR(500),
  `Nivel_confianza` DECIMAL(4,3),
  `periodo_inicio` DATE,
  `periodo_fin` DATE
);

CREATE TABLE `IA_INGREDIENTE` (
  `id_IA_ingrediente` INT PRIMARY KEY AUTO_INCREMENT,
  `id_IA` INT NOT NULL,
  `id_ingrediente` INT NOT NULL,
  `Demanda_predicha_ingrediente` DECIMAL(10,2),
  `Nivel_confianza` DECIMAL(4,3),
  `Ingrediente_critico` BOOLEAN DEFAULT (false)
);

CREATE TABLE `IA_PRODUCTO` (
  `id_IA_producto` INT PRIMARY KEY AUTO_INCREMENT,
  `id_IA` INT NOT NULL,
  `id_producto` INT NOT NULL,
  `demanda_predicho_producto` DECIMAL(10,2),
  `nivel_confianza_producto` DECIMAL(4,3),
  `Producto_critico` BOOLEAN DEFAULT (false),
  `Recomendacion_producto` VARCHAR(200)
);

ALTER TABLE `usuario` ADD FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`);

ALTER TABLE `pedido` ADD FOREIGN KEY (`id_cliente`) REFERENCES `Cliente` (`id_cliente`);

ALTER TABLE `pedido` ADD FOREIGN KEY (`id_mesero`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `Detalle_pedido` ADD FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

ALTER TABLE `Detalle_pedido` ADD FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`);

ALTER TABLE `Factura` ADD FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

ALTER TABLE `pago` ADD FOREIGN KEY (`id_factura`) REFERENCES `Factura` (`id_factura`);

ALTER TABLE `pago` ADD FOREIGN KEY (`id_usuario_cajero`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `Factura_item` ADD FOREIGN KEY (`id_factura`) REFERENCES `Factura` (`id_factura`);

ALTER TABLE `Factura_item` ADD FOREIGN KEY (`id_detalle_pedido`) REFERENCES `Detalle_pedido` (`id_detalle`);

ALTER TABLE `domicilio` ADD FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

ALTER TABLE `domicilio` ADD FOREIGN KEY (`id_repartidor`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `inventario_mov` ADD FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`);

ALTER TABLE `inventario_mov` ADD FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `proveedor_ingrediente` ADD FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`);

ALTER TABLE `proveedor_ingrediente` ADD FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`);

ALTER TABLE `orden_compra` ADD FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`);

ALTER TABLE `orden_compra` ADD FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `detalle_orden_compra` ADD FOREIGN KEY (`id_orden_compra`) REFERENCES `orden_compra` (`id_orden_compra`);

ALTER TABLE `detalle_orden_compra` ADD FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`);

ALTER TABLE `Receta` ADD FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`);

ALTER TABLE `Receta` ADD FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`);

ALTER TABLE `IA_INGREDIENTE` ADD FOREIGN KEY (`id_IA`) REFERENCES `IA` (`id_IA`);

ALTER TABLE `IA_INGREDIENTE` ADD FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`);

ALTER TABLE `IA_PRODUCTO` ADD FOREIGN KEY (`id_IA`) REFERENCES `IA` (`id_IA`);

ALTER TABLE `IA_PRODUCTO` ADD FOREIGN KEY (`id_producto`) REFERENCES `Producto` (`id_producto`);

ALTER TABLE `turno_caja` ADD FOREIGN KEY (`id_caja`) REFERENCES `caja` (`id_caja`);

ALTER TABLE `turno_caja` ADD FOREIGN KEY (`id_usuario_cajero`) REFERENCES `usuario` (`id_usuario`);

ALTER TABLE `flujo_caja` ADD FOREIGN KEY (`id_turno`) REFERENCES `turno_caja` (`id_turno`);

ALTER TABLE `flujo_caja` ADD FOREIGN KEY (`id_pago`) REFERENCES `pago` (`id_pago`);

ALTER TABLE `pago` ADD FOREIGN KEY (`id_turno`) REFERENCES `turno_caja` (`id_turno`);

ALTER TABLE `lote_ingrediente` ADD FOREIGN KEY (`id_ingrediente`) REFERENCES `Ingrediente` (`id_ingrediente`);

ALTER TABLE `inventario_mov` ADD FOREIGN KEY (`id_lote`) REFERENCES `lote_ingrediente` (`id_lote`);
