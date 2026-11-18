-- ============================================================
-- PROCEDIMIENTO: sp_cerrar_turno_caja
-- Descripción: Cierra un turno de caja activo, calculando
-- automáticamente el efectivo esperado y la diferencia
-- respecto al efectivo real reportado por el cajero.
-- Parámetros:
--   p_id_turno      INT          - ID del turno a cerrar
--   p_efectivo_real DECIMAL(10,2)- Efectivo contado por el cajero
--   p_notas         VARCHAR(500) - Observaciones del cierre
--   p_id_restaurante INT         - Establecimiento de la sesión
-- ============================================================

DROP PROCEDURE IF EXISTS sp_cerrar_turno_caja;

DELIMITER //

CREATE PROCEDURE sp_cerrar_turno_caja(
    IN p_id_turno       INT,
    IN p_efectivo_real  DECIMAL(10,2),
    IN p_notas          VARCHAR(500),
    IN p_id_restaurante INT
)
BEGIN
    DECLARE v_efectivo_esperado DECIMAL(10,2);
    DECLARE v_diferencia        DECIMAL(10,2);
    DECLARE v_estado_turno      VARCHAR(20);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Serializar el cierre con los cobros del cajero y con un segundo cierre.
    START TRANSACTION;
    SELECT estado INTO v_estado_turno FROM turno_caja
    WHERE id_turno = p_id_turno AND id_restaurante = p_id_restaurante FOR UPDATE;

    IF v_estado_turno IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El turno no existe.';
    END IF;

    IF v_estado_turno != 'ABIERTA' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El turno ya fue cerrado.';
    END IF;

    SELECT efectivo_esperado INTO v_efectivo_esperado
    FROM vista_arqueo_turno
    WHERE id_turno = p_id_turno AND id_restaurante = p_id_restaurante;

    SET v_diferencia        = p_efectivo_real - v_efectivo_esperado;

    -- Actualizar el turno con el cierre
    UPDATE turno_caja
    SET
        fecha_cierre       = NOW(),
        efectivo_esperado  = v_efectivo_esperado,
        efectivo_real      = p_efectivo_real,
        diferencia         = v_diferencia,
        notas              = p_notas,
        estado             = 'CERRADA'
    WHERE id_turno = p_id_turno AND id_restaurante = p_id_restaurante;
    COMMIT;
END //

DELIMITER ;
