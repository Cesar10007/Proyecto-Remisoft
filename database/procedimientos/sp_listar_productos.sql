-- ============================================================
-- PROCEDIMIENTO: sp_listar_productos
-- Lista productos con su identificador para permitir editar
-- y eliminar desde el frontend.
-- Compatible con MySQL / MariaDB
-- ============================================================

DROP PROCEDURE IF EXISTS sp_listar_productos;

DELIMITER $$

CREATE PROCEDURE sp_listar_productos(IN p_id_restaurante INT)
BEGIN
    SELECT
        id_producto,
        Nombre,
        Descripcion,
        precio_venta,
        Categoria,
        Tiempo_preparacion,
        Estado
    FROM Producto
    WHERE p_id_restaurante IS NULL OR id_restaurante = p_id_restaurante
    ORDER BY id_producto;
END $$

DELIMITER ;
