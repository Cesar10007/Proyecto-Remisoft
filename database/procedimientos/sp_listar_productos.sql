-- ============================================================
-- PROCEDIMIENTO: sp_listar_productos
-- Muestra todos los campos de la tabla Producto
-- excepto el campo id_producto
-- Compatible con MySQL / MariaDB
-- ============================================================

DELIMITER $$

CREATE PROCEDURE sp_listar_productos()
BEGIN
    SELECT
        Nombre,
        Descripcion,
        precio_venta,
        Categoria,
        Tiempo_preparacion,
        Estado
    FROM Producto;
END $$

DELIMITER ;

-- ============================================================
-- USO DEL PROCEDIMIENTO:
-- ============================================================
CALL sp_listar_productos();