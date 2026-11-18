-- Cambios aditivos: conservar consecutivos, importes, pagos e historial existentes.
ALTER TABLE `Factura`
  ADD COLUMN `receptor` VARCHAR(120) NULL,
  ADD COLUMN `tasa_iva` DECIMAL(7,6) NULL,
  ADD COLUMN `version_edicion` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `Factura_item`
  ADD COLUMN `nombre_producto` VARCHAR(50) NULL,
  ADD COLUMN `precio_unitario` DECIMAL(10,2) NULL;

-- Conservar los datos de consulta disponibles hoy, sin inventar renglones históricos.
UPDATE `Factura_item` fi
JOIN `Factura` f ON f.id_factura = fi.id_factura
JOIN `Detalle_pedido` d ON d.id_detalle = fi.id_detalle_pedido AND d.id_pedido = f.id_pedido
JOIN `Producto` p ON p.id_producto = d.id_producto
SET fi.nombre_producto = COALESCE(p.Nombre, CONCAT('Producto ', p.id_producto)), fi.precio_unitario = d.Precio_unitario;
