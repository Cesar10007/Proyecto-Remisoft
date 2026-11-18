-- Catálogo técnico requerido por autenticación y altas, independiente de datos.sql.
-- Las instalaciones que ya tienen estos roles conservan sus filas y permisos.
INSERT INTO rol (id_rol, nombre, descripcion)
SELECT base.id_rol, base.nombre, base.descripcion FROM (
    SELECT 1 AS id_rol, 'SUPERADMIN' AS nombre, 'Acceso total al sistema' AS descripcion
    UNION ALL SELECT 2, 'GERENTE', 'Administrador del restaurante'
    UNION ALL SELECT 3, 'CAJERO', 'Gestión de caja y pagos'
    UNION ALL SELECT 4, 'MESERO', 'Toma y gestión de pedidos en mesa'
    UNION ALL SELECT 5, 'REPARTIDOR', 'Entrega de pedidos a domicilio'
) base WHERE NOT EXISTS (SELECT 1 FROM rol r WHERE r.id_rol = base.id_rol OR r.nombre = base.nombre);
