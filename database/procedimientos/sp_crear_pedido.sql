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
    INSERT INTO pedido (
        id_cliente,
        id_mesero,
        Fecha_hora,
        estado,
        Tipo_pedido,
        Mesa_num,
        notas
    ) VALUES (
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
