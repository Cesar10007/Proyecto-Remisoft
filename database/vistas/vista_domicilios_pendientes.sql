-- ============================================================
-- VISTA: vista_domicilios_pendientes
-- Descripción: Lista los domicilios que aún no han sido
-- entregados, junto con datos del repartidor asignado
-- y del cliente destinatario.
-- ============================================================

CREATE OR REPLACE VIEW vista_domicilios_pendientes AS
SELECT
    d.id_domicilio,
    d.estado,
    d.Fecha_asignacion,
    d.direccion                         AS direccion_entrega,
    d.coordenadas_gps,
    CONCAT(c.Nombre, ' ', c.Apellido)   AS nombre_cliente,
    c.Telefono                          AS telefono_cliente,
    CONCAT(u.nombre, ' ', u.apellido)   AS nombre_repartidor,
    u.telefono                          AS telefono_repartidor
FROM domicilio d
INNER JOIN pedido  pe ON d.id_pedido      = pe.id_pedido
LEFT  JOIN Cliente c  ON pe.id_cliente    = c.id_cliente
LEFT  JOIN usuario u  ON d.id_repartidor  = u.id_usuario
WHERE d.estado IN ('ASIGNADO', 'EN_CAMINO')
ORDER BY d.Fecha_asignacion ASC;
