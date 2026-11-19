-- Una venta electrónica sí es un ingreso, pero no aumenta el efectivo del cajón.
-- Algunos turnos históricos anotaron también el fondo inicial como movimiento.
CREATE OR REPLACE VIEW vista_arqueo_turno AS
SELECT t.id_turno, t.id_restaurante,
       COALESCE(SUM(m.ingresos), 0) AS ingresos,
       COALESCE(SUM(m.egresos), 0) AS egresos,
       COALESCE(t.efectivo_inicial, 0) + COALESCE(SUM(CASE WHEN m.metodo = 'EFECTIVO'
         THEN COALESCE(m.ingresos, 0) - COALESCE(m.egresos, 0) ELSE 0 END), 0) AS efectivo_esperado
FROM turno_caja t
LEFT JOIN flujo_caja m ON m.id_turno = t.id_turno
  AND NOT (m.id_pago IS NULL AND m.concepto <=> 'Apertura de caja')
GROUP BY t.id_turno, t.id_restaurante, t.efectivo_inicial;
