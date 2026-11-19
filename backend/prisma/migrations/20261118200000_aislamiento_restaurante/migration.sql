-- NULL queda reservado a registros históricos de dueño desconocido. Nunca se
-- asignan catálogos compartidos al primer restaurante ni a las altas posteriores.
ALTER TABLE `Producto`
  ADD COLUMN `id_restaurante` INT NULL,
  ADD INDEX `idx_producto_restaurante` (`id_restaurante`),
  ADD CONSTRAINT `Producto_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `Ingrediente`
  ADD COLUMN `id_restaurante` INT NULL,
  ADD INDEX `idx_ingrediente_restaurante` (`id_restaurante`),
  ADD CONSTRAINT `Ingrediente_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `Cliente`
  ADD COLUMN `id_restaurante` INT NULL,
  DROP INDEX `Email`,
  ADD UNIQUE INDEX `cliente_sede_email_key` (`id_restaurante`, `Email`),
  ADD CONSTRAINT `Cliente_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `IA`
  ADD COLUMN `id_restaurante` INT NULL,
  ADD INDEX `idx_ia_restaurante` (`id_restaurante`),
  ADD CONSTRAINT `IA_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `categoria_productos`
  ADD COLUMN `id_restaurante` INT NULL,
  DROP INDEX `categoria_productos_nombre_key`,
  ADD UNIQUE INDEX `categoria_sede_nombre_key` (`id_restaurante`, `nombre`),
  ADD CONSTRAINT `categoria_productos_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `lote_ingrediente`
  DROP INDEX `numero_lote`,
  ADD UNIQUE INDEX `lote_sede_numero_key` (`id_restaurante`, `numero_lote`);

ALTER TABLE `mesa`
  ADD COLUMN `id_restaurante` INT NULL,
  ADD INDEX `idx_mesa_restaurante` (`id_restaurante`),
  ADD CONSTRAINT `mesa_id_restaurante_fkey` FOREIGN KEY (`id_restaurante`) REFERENCES `restaurante` (`id_restaurante`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `solicitud_registro` ADD COLUMN `nombre_establecimiento` VARCHAR(100) NULL;

-- Materializar la misma sede que antes resolvía salón a través del mesero.
-- Un cambio de sede del empleado no debe trasladar el historial de ventas.
UPDATE pedido p JOIN usuario u ON u.id_usuario = p.id_mesero
SET p.id_restaurante = u.id_restaurante WHERE p.id_restaurante IS NULL;
UPDATE turno_caja t JOIN usuario u ON u.id_usuario = t.id_usuario_cajero
JOIN caja c ON c.id_caja = t.id_caja
SET t.id_restaurante = COALESCE(c.id_restaurante, u.id_restaurante)
WHERE t.id_restaurante IS NULL
  AND (c.id_restaurante IS NULL OR u.id_restaurante IS NULL OR c.id_restaurante = u.id_restaurante);

-- Antes el número era global. Preservar las mesas usadas en cada sede sin
-- poblar las sedes vacías con las doce mesas de la migración de demostración.
ALTER TABLE mesa_atencion DROP FOREIGN KEY mesa_atencion_numero_fkey;
ALTER TABLE mesa DROP INDEX mesa_numero_key, ADD UNIQUE INDEX mesa_numero_sede_key (numero, id_restaurante);
INSERT INTO mesa (numero, capacidad, id_restaurante)
SELECT uso.numero, m.capacidad, uso.id_restaurante
FROM (
  SELECT numero, id_restaurante FROM mesa_atencion WHERE id_restaurante IS NOT NULL
  UNION
  SELECT Mesa_num, id_restaurante FROM pedido WHERE Mesa_num IS NOT NULL AND id_restaurante IS NOT NULL
) uso LEFT JOIN mesa m ON m.numero = uso.numero AND m.id_restaurante IS NULL;
ALTER TABLE mesa_atencion ADD CONSTRAINT mesa_atencion_mesa_sede_fkey
  FOREIGN KEY (numero, id_restaurante) REFERENCES mesa (numero, id_restaurante) ON DELETE RESTRICT ON UPDATE RESTRICT;
