-- ============================================================
-- VISTA: vista_listado_productos
-- Lista productos con su identificador para permitir editar
-- y eliminar desde el frontend.
-- Compatible con MySQL / MariaDB
-- ============================================================

CREATE OR REPLACE VIEW vista_listado_productos AS
SELECT
    id_restaurante,
    id_producto,
    Nombre,
    Descripcion,
    precio_venta,
    Categoria,
    Tiempo_preparacion,
    Estado
FROM Producto;
