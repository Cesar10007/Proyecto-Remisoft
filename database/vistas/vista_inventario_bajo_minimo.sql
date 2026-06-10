-- ============================================================
-- VISTA: vista_inventario_bajo_minimo
-- Descripción: Lista los ingredientes cuyo stock total en lotes
-- activos es menor o igual al stock mínimo definido.
-- Útil para alertas de reabastecimiento.
-- ============================================================

CREATE OR REPLACE VIEW vista_inventario_bajo_minimo AS
SELECT
    i.id_ingrediente,
    i.nombre                          AS ingrediente,
    i.unidad_medida,
    i.stock_minimo,
    COALESCE(SUM(l.stock_actual), 0)  AS stock_total_actual,
    CASE
        WHEN COALESCE(SUM(l.stock_actual), 0) = 0 THEN 'SIN STOCK'
        ELSE 'BAJO MÍNIMO'
    END AS alerta
FROM Ingrediente i
LEFT JOIN lote_ingrediente l
    ON i.id_ingrediente = l.id_ingrediente
    AND l.stock_actual > 0
GROUP BY
    i.id_ingrediente,
    i.nombre,
    i.unidad_medida,
    i.stock_minimo
HAVING COALESCE(SUM(l.stock_actual), 0) <= i.stock_minimo
ORDER BY stock_total_actual ASC;
