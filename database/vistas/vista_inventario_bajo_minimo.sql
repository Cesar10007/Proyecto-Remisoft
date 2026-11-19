-- El libro de inventario_mov es el mismo saldo que utilizan el conteo y las comandas.
-- Los movimientos ya incluyen los de lote: ni sumar otra vez sus fotos de stock ni ignorarlos.
CREATE OR REPLACE VIEW vista_saldos_alertas_stock AS
SELECT id_restaurante, id_ingrediente,
  CASE tipo_movimiento WHEN 'ENTRADA' THEN cantidad WHEN 'SALIDA' THEN -cantidad ELSE 0 END AS cantidad
FROM inventario_mov;

CREATE OR REPLACE VIEW vista_inventario_bajo_minimo AS
SELECT i.id_restaurante, i.id_ingrediente, i.nombre AS ingrediente,
       COALESCE(i.unidad_presentacion,i.unidad_medida) AS unidad_medida,
       ROUND(COALESCE(i.stock_minimo,0)*i.factor_unidad/i.cantidad_base,9) AS stock_minimo,
       ROUND(COALESCE(SUM(s.cantidad),0)*i.factor_unidad/i.cantidad_base,9) AS stock_total_actual,
       CASE WHEN COALESCE(SUM(s.cantidad),0)<=0 THEN 'SIN STOCK' ELSE 'BAJO MÍNIMO' END AS alerta
FROM Ingrediente i LEFT JOIN vista_saldos_alertas_stock s
  ON s.id_restaurante <=> i.id_restaurante AND s.id_ingrediente=i.id_ingrediente
GROUP BY i.id_restaurante,i.id_ingrediente,i.nombre,i.unidad_medida,i.unidad_presentacion,i.factor_unidad,i.cantidad_base,i.stock_minimo
HAVING COALESCE(SUM(s.cantidad),0)<=COALESCE(i.stock_minimo,0);
