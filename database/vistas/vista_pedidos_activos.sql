-- ============================================================
-- VISTA: vista_pedidos_activos
-- Descripción: Muestra todos los pedidos en estado ABIERTO o
-- EN_PROCESO, incluyendo datos del cliente y del mesero asignado.
-- ============================================================

CREATE OR REPLACE VIEW vista_pedidos_activos AS
SELECT
    p.id_restaurante,
    p.id_pedido,
    p.Fecha_hora,
    p.estado,
    p.Tipo_pedido,
    p.Mesa_num,
    p.notas,
    CONCAT(c.Nombre, ' ', c.Apellido) AS nombre_cliente,
    c.Telefono                        AS telefono_cliente,
    CONCAT(u.nombre, ' ', u.apellido) AS nombre_mesero
FROM pedido p
LEFT JOIN Cliente c ON p.id_cliente = c.id_cliente AND c.id_restaurante = p.id_restaurante
LEFT JOIN usuario u ON p.id_mesero  = u.id_usuario AND u.id_restaurante = p.id_restaurante
WHERE p.estado IN ('ABIERTO', 'EN_PROCESO')
ORDER BY p.Fecha_hora ASC;
