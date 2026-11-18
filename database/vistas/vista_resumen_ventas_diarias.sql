-- ============================================================
-- VISTA: vista_resumen_ventas_diarias
-- Descripción: Agrupa las facturas pagadas por día (estado PAGADA),
-- mostrando total de pedidos, ingresos brutos, IVA total
-- y total de descuentos aplicados.
-- ============================================================

CREATE OR REPLACE VIEW vista_resumen_ventas_diarias AS
SELECT
    DATE(CONVERT_TZ(f.Fecha_emision, '+00:00', '-05:00')) AS fecha,
    COUNT(f.id_factura)        AS total_pedidos,
    SUM(f.total + COALESCE(f.Descuento, 0)) AS ingresos_brutos,
    SUM(f.IVA)                 AS total_iva,
    SUM(f.Descuento)           AS total_descuentos,
    SUM(f.Propina)             AS total_propinas,
    SUM(f.total)               AS ingresos_netos
FROM Factura f
WHERE f.estado = 'PAGADA'
GROUP BY DATE(CONVERT_TZ(f.Fecha_emision, '+00:00', '-05:00'))
ORDER BY fecha DESC;
