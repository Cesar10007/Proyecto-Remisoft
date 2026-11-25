-- Carga optativa e idempotente para la demo de Restaurante Norte.
-- Requiere los usuarios de ejemplo de datos.sql. No borrar ni recrear la base.
-- No ejecutar en producción.
START TRANSACTION;

SET @sede_norte = (SELECT id_restaurante FROM restaurante WHERE id_restaurante = 2 AND nombre = 'Restaurante Norte');
SET @gerente_norte = (SELECT id_usuario FROM usuario WHERE id_restaurante = @sede_norte AND email = 'sebastian.diaz@resto.com');
SET @mesero_norte = (SELECT id_usuario FROM usuario WHERE id_restaurante = @sede_norte AND id_rol = 4 ORDER BY id_usuario LIMIT 1);
SET @cajero_norte = (SELECT id_usuario FROM usuario WHERE id_restaurante = @sede_norte AND id_rol = 3 ORDER BY id_usuario LIMIT 1);
SET @demo_norte_habilitada = IF(
  @sede_norte IS NOT NULL AND @gerente_norte IS NOT NULL AND @mesero_norte IS NOT NULL AND @cajero_norte IS NOT NULL,
  1, 0
);

INSERT INTO mesa (numero, capacidad, id_restaurante)
SELECT m.numero, m.capacidad, @sede_norte
FROM (
  SELECT 1 AS numero, 2 AS capacidad
  UNION ALL SELECT 2, 4
  UNION ALL SELECT 3, 6
) m
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM mesa actual
    WHERE actual.id_restaurante = @sede_norte AND actual.numero = m.numero
  );

INSERT INTO Cliente (id_restaurante, Nombre, Apellido, Email, Telefono, Direccion, tipo_documento, Num_documento)
SELECT @sede_norte, 'Daniel', 'Rojas', 'daniel.rojas@norte.example.com', '3115550101',
    'Calle 80 # 12-40', 'CC', '1020304050'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM Cliente
    WHERE id_restaurante = @sede_norte AND Email = 'daniel.rojas@norte.example.com'
  );
SET @cliente_norte = (
  SELECT id_cliente FROM Cliente
  WHERE id_restaurante = @sede_norte AND Email = 'daniel.rojas@norte.example.com'
  ORDER BY id_cliente LIMIT 1
);

INSERT INTO caja (id_restaurante, nombre, estado)
SELECT @sede_norte, 'Caja Norte', 'ACTIVA'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM caja WHERE id_restaurante = @sede_norte AND nombre = 'Caja Norte'
  );
SET @caja_norte = (
  SELECT id_caja FROM caja
  WHERE id_restaurante = @sede_norte AND nombre = 'Caja Norte'
  ORDER BY id_caja LIMIT 1
);

INSERT INTO turno_caja (id_restaurante, id_caja, id_usuario_cajero, fecha_apertura, fecha_cierre,
    efectivo_inicial, efectivo_esperado, efectivo_real, diferencia, notas, estado)
SELECT @sede_norte, @caja_norte, @cajero_norte, NOW() - INTERVAL 1 HOUR, NOW(),
    50000.00, 118000.00, 118000.00, 0.00, 'Cierre demo de Restaurante Norte', 'CERRADA'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM turno_caja
    WHERE id_restaurante = @sede_norte AND id_caja = @caja_norte
      AND notas = 'Cierre demo de Restaurante Norte'
  );
SET @turno_norte = (
  SELECT id_turno FROM turno_caja
  WHERE id_restaurante = @sede_norte AND id_caja = @caja_norte
    AND notas = 'Cierre demo de Restaurante Norte'
  ORDER BY id_turno LIMIT 1
);

INSERT INTO proveedor (id_restaurante, nombre, nombre_contacto, telefono, email, direccion, tipo_proveedor, estado)
SELECT @sede_norte, 'Pesquera del Norte', 'Mariana Gil', '3105550202',
    'ventas@pesqueranorte.example.com', 'Zona de Abastos, local 12', 'MARISCOS', 'ACTIVO'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM proveedor WHERE id_restaurante = @sede_norte AND nombre = 'Pesquera del Norte'
  );
SET @proveedor_norte = (
  SELECT id_proveedor FROM proveedor
  WHERE id_restaurante = @sede_norte AND nombre = 'Pesquera del Norte'
  ORDER BY id_proveedor LIMIT 1
);

INSERT INTO Producto (id_restaurante, Nombre, Descripcion, precio_venta, Categoria, Tiempo_preparacion, Estado)
SELECT @sede_norte, 'Cazuela Norteña', 'Camarón, pescado y leche de coco',
    34000.00, 'PLATOS DE MAR', '00:20:00', 1
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM Producto WHERE id_restaurante = @sede_norte AND Nombre = 'Cazuela Norteña'
  );
SET @producto_norte = (
  SELECT id_producto FROM Producto
  WHERE id_restaurante = @sede_norte AND Nombre = 'Cazuela Norteña'
  ORDER BY id_producto LIMIT 1
);

INSERT INTO Ingrediente (id_restaurante, nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo)
SELECT @sede_norte, 'Camarón', 'Camarón limpio para platos de mar', 'KG', 25000.00, 3.00
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM Ingrediente WHERE id_restaurante = @sede_norte AND nombre = 'Camarón'
  );
SET @ingrediente_norte = (
  SELECT id_ingrediente FROM Ingrediente
  WHERE id_restaurante = @sede_norte AND nombre = 'Camarón'
  ORDER BY id_ingrediente LIMIT 1
);

INSERT INTO lote_ingrediente (id_restaurante, id_ingrediente, numero_lote, fecha_ingreso, fecha_vencimiento,
    stock_inicial, stock_actual, costo_promedio, observaciones)
SELECT @sede_norte, @ingrediente_norte, 'NORTE-CAM-001', CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 3 DAY), 12.000, 11.500, 25000.00,
    'Lote demo recibido en Restaurante Norte'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM lote_ingrediente
    WHERE id_restaurante = @sede_norte AND numero_lote = 'NORTE-CAM-001'
  );
SET @lote_norte = (
  SELECT id_lote FROM lote_ingrediente
  WHERE id_restaurante = @sede_norte AND numero_lote = 'NORTE-CAM-001'
  ORDER BY id_lote LIMIT 1
);

INSERT INTO Receta (id_producto, id_ingrediente, Cantidad_necesaria, Unidad)
SELECT @producto_norte, @ingrediente_norte, 0.250, 'KG'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM Receta
    WHERE id_producto = @producto_norte AND id_ingrediente = @ingrediente_norte
  );

INSERT INTO proveedor_ingrediente (id_proveedor, id_ingrediente, precio_acordado, tiempo_entrega_dias,
    calidad_rating, es_proveedor_principal, fecha_ultima_compra)
SELECT @proveedor_norte, @ingrediente_norte, 25000.00, 1, 4.8, 1, NOW()
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM proveedor_ingrediente
    WHERE id_proveedor = @proveedor_norte AND id_ingrediente = @ingrediente_norte
  );

INSERT INTO inventario_mov (id_restaurante, id_ingrediente, id_usuario, tipo_movimiento, cantidad,
    costo_unitario, observaciones, origen_tipo, id_lote)
SELECT @sede_norte, @ingrediente_norte, @gerente_norte, 'ENTRADA', 12.000, 25000.00,
    'Recepción de lote inicial', 'AJUSTE', @lote_norte
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM inventario_mov
    WHERE id_restaurante = @sede_norte AND id_ingrediente = @ingrediente_norte
      AND tipo_movimiento = 'ENTRADA' AND origen_tipo = 'AJUSTE'
      AND observaciones = 'Recepción de lote inicial' AND id_lote = @lote_norte
  );

INSERT INTO pedido (id_restaurante, id_cliente, id_mesero, estado, Tipo_pedido, Mesa_num, notas)
SELECT @sede_norte, @cliente_norte, @mesero_norte, 'CERRADO', 'MESA', 1,
    'Pedido de demostración de Restaurante Norte'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM pedido
    WHERE id_restaurante = @sede_norte
      AND notas = 'Pedido de demostración de Restaurante Norte'
  );
SET @pedido_cerrado_norte = (
  SELECT id_pedido FROM pedido
  WHERE id_restaurante = @sede_norte
    AND notas = 'Pedido de demostración de Restaurante Norte'
  ORDER BY id_pedido LIMIT 1
);

INSERT INTO Detalle_pedido (id_pedido, id_producto, Cantidad, Precio_unitario, estado_item)
SELECT @pedido_cerrado_norte, @producto_norte, 2, 34000.00, 'ENTREGADO'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM Detalle_pedido
    WHERE id_pedido = @pedido_cerrado_norte AND id_producto = @producto_norte
  );
SET @detalle_norte = (
  SELECT id_detalle FROM Detalle_pedido
  WHERE id_pedido = @pedido_cerrado_norte AND id_producto = @producto_norte
  ORDER BY id_detalle LIMIT 1
);

INSERT INTO Factura (id_pedido, consecutivo, IVA, Descuento, Propina, total, estado)
SELECT @pedido_cerrado_norte, 'FAC-NORTE-DEMO-0001', 10857.14, 0.00, 0.00, 68000.00, 'PAGADA'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (SELECT 1 FROM Factura WHERE id_pedido = @pedido_cerrado_norte);
SET @factura_norte = (
  SELECT id_factura FROM Factura WHERE id_pedido = @pedido_cerrado_norte LIMIT 1
);

INSERT INTO Factura_item (id_factura, id_detalle_pedido, cantidad_facturada, nombre_producto, precio_unitario)
SELECT @factura_norte, @detalle_norte, 2, 'Cazuela Norteña', 34000.00
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM Factura_item
    WHERE id_factura = @factura_norte AND id_detalle_pedido = @detalle_norte
  );

INSERT INTO pago (id_factura, id_usuario_cajero, metodo, monto, estado, id_turno)
SELECT @factura_norte, @cajero_norte, 'EFECTIVO', 68000.00, 'APROBADO', @turno_norte
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM pago
    WHERE id_factura = @factura_norte AND id_usuario_cajero = @cajero_norte
      AND metodo = 'EFECTIVO' AND monto = 68000.00 AND id_turno = @turno_norte
  );
SET @pago_norte = (
  SELECT id_pago FROM pago
  WHERE id_factura = @factura_norte AND id_usuario_cajero = @cajero_norte
    AND metodo = 'EFECTIVO' AND monto = 68000.00 AND id_turno = @turno_norte
  ORDER BY id_pago LIMIT 1
);

INSERT INTO flujo_caja (id_turno, concepto, ingresos, egresos, saldo, metodo, id_pago)
SELECT @turno_norte, 'Apertura de caja', 50000.00, 0.00, 50000.00, 'EFECTIVO', NULL
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM flujo_caja WHERE id_turno = @turno_norte AND concepto = 'Apertura de caja'
  );

INSERT INTO flujo_caja (id_turno, concepto, ingresos, egresos, saldo, metodo, id_pago)
SELECT @turno_norte, 'Pago factura FAC-NORTE-DEMO-0001', 68000.00, 0.00, 118000.00,
    'EFECTIVO', @pago_norte
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM flujo_caja
    WHERE id_turno = @turno_norte AND concepto = 'Pago factura FAC-NORTE-DEMO-0001'
  );

INSERT INTO inventario_mov (id_restaurante, id_ingrediente, id_usuario, tipo_movimiento, cantidad,
    costo_unitario, observaciones, origen_tipo, origen_id, id_lote)
SELECT @sede_norte, @ingrediente_norte, @mesero_norte, 'SALIDA', 0.500, 25000.00,
    'Consumo de Cazuela Norteña en pedido demo', 'PEDIDO', @pedido_cerrado_norte, @lote_norte
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM inventario_mov
    WHERE id_restaurante = @sede_norte AND id_ingrediente = @ingrediente_norte
      AND tipo_movimiento = 'SALIDA' AND origen_tipo = 'PEDIDO'
      AND origen_id = @pedido_cerrado_norte
  );

INSERT INTO pedido (id_restaurante, id_mesero, estado, Tipo_pedido, Mesa_num, notas)
SELECT @sede_norte, @mesero_norte, 'ABIERTO', 'MESA', 2,
    'Pedido activo de demostración de Restaurante Norte'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM pedido
    WHERE id_restaurante = @sede_norte
      AND notas = 'Pedido activo de demostración de Restaurante Norte'
  );
SET @pedido_abierto_norte = (
  SELECT id_pedido FROM pedido
  WHERE id_restaurante = @sede_norte
    AND notas = 'Pedido activo de demostración de Restaurante Norte'
  ORDER BY id_pedido LIMIT 1
);

INSERT INTO Detalle_pedido (id_pedido, id_producto, Cantidad, Precio_unitario, estado_item)
SELECT @pedido_abierto_norte, @producto_norte, 1, 34000.00, 'PENDIENTE'
FROM DUAL
WHERE @demo_norte_habilitada = 1
  AND NOT EXISTS (
    SELECT 1 FROM Detalle_pedido
    WHERE id_pedido = @pedido_abierto_norte AND id_producto = @producto_norte
  );

COMMIT;

SELECT @demo_norte_habilitada AS carga_habilitada,
    @sede_norte AS id_restaurante_norte,
    @gerente_norte AS gerente_sebastian,
    @producto_norte AS producto_demo,
    @ingrediente_norte AS ingrediente_demo,
    @pedido_cerrado_norte AS pedido_cerrado_demo,
    @pedido_abierto_norte AS pedido_abierto_demo;
