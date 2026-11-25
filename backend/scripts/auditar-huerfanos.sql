-- Auditoría de filas sin sede (id_restaurante IS NULL). SOLO LECTURA.
-- Ejecutar antes de cualquier migración a NOT NULL. No asigna sedes en bloque:
-- cada fila huérfana debe atribuirse con información verificada (ver
-- docs/aislamiento-sedes.md, plan por fases). Una fila NULL es invisible para
-- los gerentes y visible solo para SUPERADMIN (filtro {}).
--
-- Uso:  mysql ... < scripts/auditar-huerfanos.sql

SELECT 'Cliente' AS tabla, COUNT(*) AS huerfanas FROM Cliente WHERE id_restaurante IS NULL
UNION ALL SELECT 'Producto', COUNT(*) FROM Producto WHERE id_restaurante IS NULL
UNION ALL SELECT 'Ingrediente', COUNT(*) FROM Ingrediente WHERE id_restaurante IS NULL
UNION ALL SELECT 'categoria_productos', COUNT(*) FROM categoria_productos WHERE id_restaurante IS NULL
UNION ALL SELECT 'caja', COUNT(*) FROM caja WHERE id_restaurante IS NULL
UNION ALL SELECT 'turno_caja', COUNT(*) FROM turno_caja WHERE id_restaurante IS NULL
UNION ALL SELECT 'pedido', COUNT(*) FROM pedido WHERE id_restaurante IS NULL
UNION ALL SELECT 'proveedor', COUNT(*) FROM proveedor WHERE id_restaurante IS NULL
UNION ALL SELECT 'orden_compra', COUNT(*) FROM orden_compra WHERE id_restaurante IS NULL
UNION ALL SELECT 'inventario_mov', COUNT(*) FROM inventario_mov WHERE id_restaurante IS NULL
UNION ALL SELECT 'lote_ingrediente', COUNT(*) FROM lote_ingrediente WHERE id_restaurante IS NULL
UNION ALL SELECT 'mesa', COUNT(*) FROM mesa WHERE id_restaurante IS NULL
UNION ALL SELECT 'IA', COUNT(*) FROM IA WHERE id_restaurante IS NULL
UNION ALL SELECT 'usuario (no superadmin)', COUNT(*) FROM usuario WHERE id_restaurante IS NULL AND id_rol <> 1;

-- Muestra para atribuir a mano (revisar una por una, nunca UPDATE masivo):
SELECT id_producto, Nombre FROM Producto WHERE id_restaurante IS NULL LIMIT 20;
SELECT id_ingrediente, nombre FROM Ingrediente WHERE id_restaurante IS NULL LIMIT 20;
SELECT id_usuario, nombre, email FROM usuario WHERE id_restaurante IS NULL AND id_rol <> 1 LIMIT 20;
