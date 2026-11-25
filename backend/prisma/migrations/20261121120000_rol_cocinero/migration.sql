-- Rol operativo COCINERO: acceso unico al tablero de cocina (/api/cocina).
-- Se agrega al catalogo tecnico igual que en 20261118201000_roles_base:
-- no toca los roles que ya existan.
INSERT INTO rol (id_rol, nombre, descripcion)
SELECT base.id_rol, base.nombre, base.descripcion FROM (
    SELECT 6 AS id_rol, 'COCINERO' AS nombre, 'Preparacion de platos en cocina' AS descripcion
) base WHERE NOT EXISTS (SELECT 1 FROM rol r WHERE r.id_rol = base.id_rol OR r.nombre = base.nombre);