-- ============================================================
-- VISTA: vista_inventario_bajo_minimo
-- Descripción: Lista los ingredientes cuyo stock en lotes más movimientos
-- sin lote es menor o igual al stock mínimo definido.
-- Útil para alertas de reabastecimiento.
-- ============================================================

CREATE OR REPLACE VIEW vista_saldos_alertas_stock AS
SELECT id_restaurante, id_ingrediente, stock_actual AS cantidad FROM lote_ingrediente WHERE stock_actual > 0
UNION ALL
SELECT id_restaurante, id_ingrediente, CASE tipo_movimiento WHEN 'ENTRADA' THEN cantidad ELSE -cantidad END
FROM inventario_mov WHERE id_lote IS NULL AND tipo_movimiento IN ('ENTRADA', 'SALIDA');

CREATE OR REPLACE VIEW vista_inventario_bajo_minimo AS
SELECT
    i.id_restaurante,
    i.id_ingrediente,
    i.nombre                          AS ingrediente,
    i.unidad_medida,
    i.stock_minimo,
    COALESCE(SUM(s.cantidad), 0)  AS stock_total_actual,
    CASE
        WHEN COALESCE(SUM(s.cantidad), 0) <= 0 THEN 'SIN STOCK'
        ELSE 'BAJO MÍNIMO'
    END AS alerta
FROM Ingrediente i
LEFT JOIN vista_saldos_alertas_stock s
    ON i.id_ingrediente = s.id_ingrediente
    AND i.id_restaurante = s.id_restaurante
GROUP BY
    i.id_restaurante,
    i.id_ingrediente,
    i.nombre,
    i.unidad_medida,
    i.stock_minimo
HAVING COALESCE(SUM(s.cantidad), 0) <= i.stock_minimo
ORDER BY stock_total_actual ASC;
