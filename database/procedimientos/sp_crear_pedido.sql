-- ============================================================
-- PROCEDIMIENTO: sp_crear_pedido
-- Descripción: Crea un nuevo pedido para un cliente.
-- Parámetros:
--   p_id_cliente   INT    - ID del cliente (puede ser NULL para pedido anónimo)
--   p_id_mesero    INT    - ID del mesero que toma el pedido
--   p_tipo_pedido  VARCHAR - 'MESA', 'DOMICILIO', 'LLEVAR'
--   p_mesa_num     INT    - Número de mesa (NULL si no aplica)
--   p_notas        VARCHAR - Notas especiales del pedido
--   OUT p_id_pedido INT   - Retorna el ID del pedido creado
-- ============================================================

DROP PROCEDURE IF EXISTS sp_crear_pedido;

DELIMITER //

CREATE PROCEDURE sp_crear_pedido(
    IN  p_id_cliente   INT,
    IN  p_id_mesero    INT,
    IN  p_tipo_pedido  VARCHAR(20),
    IN  p_mesa_num     INT,
    IN  p_notas        VARCHAR(500),
    OUT p_id_pedido    INT
)
BEGIN
    DECLARE v_sede INT;
    SELECT id_restaurante INTO v_sede FROM usuario WHERE id_usuario = p_id_mesero;
    IF v_sede IS NULL OR (p_id_cliente IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM Cliente WHERE id_cliente = p_id_cliente AND id_restaurante = v_sede
    )) OR (p_mesa_num IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM mesa WHERE numero = p_mesa_num AND id_restaurante = v_sede
    )) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mesero, cliente o mesa no válidos para el establecimiento.';
    END IF;
    INSERT INTO pedido (
        id_restaurante,
        id_cliente,
        id_mesero,
        Fecha_hora,
        estado,
        Tipo_pedido,
        Mesa_num,
        notas
    ) VALUES (
        v_sede,
        p_id_cliente,
        p_id_mesero,
        NOW(),
        'ABIERTO',
        p_tipo_pedido,
        p_mesa_num,
        p_notas
    );

    SET p_id_pedido = LAST_INSERT_ID();
END //

DELIMITER ;
