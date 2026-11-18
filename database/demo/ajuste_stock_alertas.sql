-- ============================================================
-- AJUSTE DE DATOS DE PRUEBA: alertas de stock bajo
-- Descripción: deja tres lotes por debajo del stock mínimo para
-- que el panel de alertas del Gerente muestre casos de demo:
--   Pechuga de Pollo -> BAJO MÍNIMO (3.5 de mínimo 4)
--   Espagueti        -> SIN STOCK   (0 de mínimo 5)
--   Huevo            -> BAJO MÍNIMO (25 de mínimo 30)
-- Los valores son absolutos: ejecutarlo varias veces da el mismo resultado.
-- Para bases nuevas ya viene incluido en datos.sql.
-- Solo en una BD desechable: indicar explícitamente la sede de demo en la MISMA sesión.
--   SET @sede_demo = ...; SOURCE database/demo/ajuste_stock_alertas.sql;
-- Sin @sede_demo no se cambia nada. No usar para inicializar establecimientos.
-- ============================================================

UPDATE lote_ingrediente SET stock_actual = 3.500 WHERE id_restaurante = @sede_demo AND numero_lote = 'LOTE-POLLO-001';
UPDATE lote_ingrediente SET stock_actual = 0.000 WHERE id_restaurante = @sede_demo AND numero_lote = 'LOTE-ESPAG-001';
UPDATE lote_ingrediente SET stock_actual = 25.000 WHERE id_restaurante = @sede_demo AND numero_lote = 'LOTE-HUEVO-001';
