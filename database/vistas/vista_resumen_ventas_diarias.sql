-- Solo dinero efectivamente aprobado. La fecha de emisión puede ser de otro día.
-- Agrupar antes de unir renglones evita duplicar pagos, productos, propina o descuento.
CREATE OR REPLACE VIEW vista_cobros_factura_dia AS
SELECT pg.id_factura, DATE(CONVERT_TZ(pg.fecha_pago,'+00:00','-05:00')) AS fecha, SUM(pg.monto) AS cobrado
FROM pago pg JOIN Factura f ON f.id_factura=pg.id_factura
WHERE pg.estado='APROBADO' AND pg.fecha_pago IS NOT NULL AND pg.monto IS NOT NULL AND f.estado IN ('PAGADA','EMITIDA')
GROUP BY pg.id_factura,DATE(CONVERT_TZ(pg.fecha_pago,'+00:00','-05:00'));

CREATE OR REPLACE VIEW vista_primer_cobro_factura AS
SELECT id_factura,MIN(fecha) AS fecha FROM vista_cobros_factura_dia GROUP BY id_factura;

CREATE OR REPLACE VIEW vista_resumen_ventas_diarias AS
SELECT p.id_restaurante, c.fecha, COUNT(*) AS total_pedidos,
       SUM(c.cobrado + IF(c.fecha=primero.fecha,COALESCE(f.Descuento,0),0)) AS ingresos_brutos,
       SUM(IF(c.fecha=primero.fecha,COALESCE(f.IVA,0),0)) AS total_iva,
       SUM(IF(c.fecha=primero.fecha,COALESCE(f.Descuento,0),0)) AS total_descuentos,
       SUM(IF(c.fecha=primero.fecha,COALESCE(f.Propina,0),0)) AS total_propinas,
       SUM(c.cobrado) AS ingresos_netos
FROM vista_cobros_factura_dia c JOIN vista_primer_cobro_factura primero USING(id_factura)
JOIN Factura f USING(id_factura) JOIN pedido p USING(id_pedido)
GROUP BY p.id_restaurante,c.fecha;
