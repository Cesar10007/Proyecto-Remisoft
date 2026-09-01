-- ============================================================
-- PROCEDIMIENTO: sp_registrar_movimiento_inventario
-- Descripción: Registra una entrada o salida de inventario
-- para un ingrediente en un lote específico.
-- Actualiza el stock_actual del lote automáticamente.
-- Parámetros:
--   p_id_ingrediente INT    - ID del ingrediente
--   p_id_lote        INT    - ID del lote afectado
--   p_id_usuario     INT    - Usuario que registra el movimiento
--   p_tipo_movimiento VARCHAR - 'ENTRADA' o 'SALIDA'
--   p_cantidad       DECIMAL - Cantidad del movimiento
--   p_costo_unitario DECIMAL - Costo por unidad
--   p_observaciones  VARCHAR - Descripción del movimiento
--   p_origen_tipo    VARCHAR - Origen: 'COMPRA', 'VENTA', 'AJUSTE'
--   p_origen_id      INT    - ID del origen (id_orden_compra, etc.)
-- ============================================================

DROP PROCEDURE IF EXISTS sp_registrar_movimiento_inventario;

DELIMITER //

CREATE PROCEDURE sp_registrar_movimiento_inventario(
    IN p_id_ingrediente  INT,
    IN p_id_lote         INT,
    IN p_id_usuario      INT,
    IN p_tipo_movimiento VARCHAR(20),
    IN p_cantidad        DECIMAL(10,3),
    IN p_costo_unitario  DECIMAL(10,2),
    IN p_observaciones   VARCHAR(1000),
    IN p_origen_tipo     VARCHAR(30),
    IN p_origen_id       INT
)
BEGIN
    DECLARE v_stock_actual DECIMAL(10,3);

    -- Verificar stock disponible si es una SALIDA
    IF p_tipo_movimiento = 'SALIDA' THEN
        SELECT stock_actual INTO v_stock_actual
        FROM lote_ingrediente
        WHERE id_lote = p_id_lote;

        IF v_stock_actual < p_cantidad THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Stock insuficiente en el lote para registrar la salida.';
        END IF;
    END IF;

    -- Registrar el movimiento
    INSERT INTO inventario_mov (
        id_ingrediente,
        id_usuario,
        fecha_hora,
        tipo_movimiento,
        cantidad,
        costo_unitario,
        observaciones,
        origen_tipo,
        origen_id,
        id_lote
    ) VALUES (
        p_id_ingrediente,
        p_id_usuario,
        NOW(),
        p_tipo_movimiento,
        p_cantidad,
        p_costo_unitario,
        p_observaciones,
        p_origen_tipo,
        p_origen_id,
        p_id_lote
    );

    -- Actualizar stock del lote
    IF p_tipo_movimiento = 'ENTRADA' THEN
        UPDATE lote_ingrediente
        SET stock_actual = stock_actual + p_cantidad
        WHERE id_lote = p_id_lote;
    ELSEIF p_tipo_movimiento = 'SALIDA' THEN
        UPDATE lote_ingrediente
        SET stock_actual = stock_actual - p_cantidad
        WHERE id_lote = p_id_lote;
    END IF;
END //

DELIMITER ;
