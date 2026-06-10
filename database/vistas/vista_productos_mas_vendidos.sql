-- ============================================================
-- VISTA: vista_productos_mas_vendidos
-- Descripción: Muestra la cantidad total vendida y el ingreso
-- generado por cada producto, en orden descendente de ventas.
-- ============================================================

CREATE OR REPLACE VIEW vista_productos_mas_vendidos AS
SELECT
    p.id_producto,
    p.Nombre                      AS producto,
    p.Categoria,
    SUM(dp.Cantidad)              AS unidades_vendidas,
    SUM(dp.Cantidad * dp.Precio_unitario) AS ingreso_total
FROM Producto p
INNER JOIN Detalle_pedido dp ON p.id_producto = dp.id_producto
INNER JOIN pedido pe         ON dp.id_pedido  = pe.id_pedido
WHERE pe.estado NOT IN ('CANCELADO', 'ABIERTO')
GROUP BY
    p.id_producto,
    p.Nombre,
    p.Categoria
ORDER BY unidades_vendidas DESC;
