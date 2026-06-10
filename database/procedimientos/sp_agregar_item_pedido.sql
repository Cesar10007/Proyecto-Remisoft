-- ============================================================
-- PROCEDIMIENTO: sp_agregar_item_pedido
-- Descripción: Agrega un producto al detalle de un pedido.
-- Valida que el pedido exista y esté en estado ABIERTO.
-- Parámetros:
--   p_id_pedido    INT - ID del pedido destino
--   p_id_producto  INT - ID del producto a agregar
--   p_cantidad     INT - Cantidad solicitada
-- ============================================================

DELIMITER //

CREATE PROCEDURE sp_agregar_item_pedido(
    IN p_id_pedido   INT,
    IN p_id_producto INT,
    IN p_cantidad    INT
)
BEGIN
    DECLARE v_estado_pedido VARCHAR(20);
    DECLARE v_precio        DECIMAL(10,2);

    -- Verificar que el pedido existe y está abierto
    SELECT estado INTO v_estado_pedido
    FROM pedido
    WHERE id_pedido = p_id_pedido;

    IF v_estado_pedido IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El pedido no existe.';
    END IF;

    IF v_estado_pedido != 'ABIERTO' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede modificar un pedido que no está ABIERTO.';
    END IF;

    -- Obtener precio actual del producto
    SELECT precio_venta INTO v_precio
    FROM Producto
    WHERE id_producto = p_id_producto AND Estado = 1;

    IF v_precio IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El producto no existe o está inactivo.';
    END IF;

    -- Insertar ítem en el detalle
    INSERT INTO Detalle_pedido (
        id_pedido,
        id_producto,
        Cantidad,
        Precio_unitario,
        estado_item
    ) VALUES (
        p_id_pedido,
        p_id_producto,
        p_cantidad,
        v_precio,
        'PENDIENTE'
    );
END //

DELIMITER ;
