-- ============================================================
-- VISTA: vista_listado_productos
-- Muestra todos los campos de la tabla Producto
-- excepto el campo id_producto
-- Compatible con MySQL / MariaDB
-- ============================================================

CREATE OR REPLACE VIEW vista_listado_productos AS
SELECT
    Nombre,
    Descripcion,
    precio_venta,
    Categoria,
    Tiempo_preparacion,
    Estado
FROM Producto;

-- ============================================================
-- USO DE LA VISTA:
-- ============================================================
-- Consultar todos los productos:
SELECT * FROM vista_listado_productos;

-- Consultar solo productos activos:
SELECT * FROM vista_listado_productos
WHERE Estado = 1;