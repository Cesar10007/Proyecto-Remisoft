-- ============================================================
-- VISTA: vista_resumen_ventas_diarias
-- Descripción: Agrupa las facturas emitidas por día,
-- mostrando total de pedidos, ingresos brutos, IVA total
-- y total de descuentos aplicados.
-- ============================================================

CREATE OR REPLACE VIEW vista_resumen_ventas_diarias AS
SELECT
    DATE(f.Fecha_emision)      AS fecha,
    COUNT(f.id_factura)        AS total_pedidos,
    SUM(f.total)               AS ingresos_brutos,
    SUM(f.IVA)                 AS total_iva,
    SUM(f.Descuento)           AS total_descuentos,
    SUM(f.Propina)             AS total_propinas,
    SUM(f.total - f.Descuento) AS ingresos_netos
FROM Factura f
WHERE f.estado = 'EMITIDA'
GROUP BY DATE(f.Fecha_emision)
ORDER BY fecha DESC;
