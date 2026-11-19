import { ErrorSalon } from '../utils/salon.js';

export class SistemaCerrado extends ErrorSalon {
  constructor() { super(423, 'El sistema de este establecimiento está cerrado. El gerente debe abrirlo para reanudar la operación.'); }
}

// Orden de bloqueo: sede, luego filas del negocio. Las operaciones normales pueden concurrir;
// el cierre espera a que confirmen y bloquea nuevas escrituras hasta terminar la revisión.
export async function exigirSedeAbierta(tx, id) {
  if (!id) return;
  const [sede] = await tx.$queryRaw`SELECT sistema_abierto FROM restaurante WHERE id_restaurante=${id} LOCK IN SHARE MODE`;
  if (!sede || !Number(sede.sistema_abierto)) throw new SistemaCerrado();
}

export async function pendientesDeCierre(tx, id) {
  // Los folios pueden pertenecer a jornadas anteriores. No usar una fecha de corte que los oculte.
  const filas = await tx.$queryRaw`SELECT tipo, COUNT(*) AS total, MIN(folio) AS ejemplo FROM (
    SELECT 'pedidos' tipo, id_pedido folio FROM pedido WHERE id_restaurante=${id} AND (estado IS NULL OR estado NOT IN ('CANCELADO','CERRADO'))
    UNION ALL SELECT 'mesas',numero FROM mesa_atencion WHERE id_restaurante=${id}
    UNION ALL SELECT 'turnos',id_turno FROM turno_caja WHERE id_restaurante=${id} AND (estado IS NULL OR estado<>'CERRADA')
    UNION ALL SELECT 'domicilios',d.id_domicilio FROM domicilio d JOIN pedido p USING(id_pedido)
      WHERE p.id_restaurante=${id} AND (d.estado IS NULL OR d.estado NOT IN ('ENTREGADO','CANCELADO'))
    UNION ALL SELECT 'facturas',f.id_factura FROM Factura f JOIN pedido p USING(id_pedido)
      WHERE p.id_restaurante=${id} AND (f.estado='PENDIENTE' OR (f.estado IN ('EMITIDA','PAGADA') AND (f.total IS NULL OR COALESCE(
        (SELECT SUM(pg.monto) FROM pago pg WHERE pg.id_factura=f.id_factura AND pg.estado='APROBADO'),-1)<f.total)))
    UNION ALL SELECT 'pagos',pg.id_pago FROM pago pg JOIN Factura f USING(id_factura) JOIN pedido p USING(id_pedido)
      WHERE p.id_restaurante=${id} AND (pg.estado IS NULL OR pg.estado IN ('PENDIENTE','EN_PROCESO'))
    UNION ALL SELECT 'asientos',pg.id_pago FROM pago pg JOIN Factura f USING(id_factura) JOIN pedido p USING(id_pedido)
      WHERE p.id_restaurante=${id} AND pg.estado='APROBADO' AND NOT EXISTS (
        SELECT 1 FROM flujo_caja m JOIN turno_caja t USING(id_turno) WHERE m.id_pago=pg.id_pago AND t.id_restaurante=p.id_restaurante
        AND m.id_turno=pg.id_turno GROUP BY m.id_pago HAVING SUM(COALESCE(m.ingresos,0)-COALESCE(m.egresos,0))=pg.monto)
  ) pendientes GROUP BY tipo ORDER BY tipo`;
  return filas.map(({ tipo, total, ejemplo }) => ({ tipo, total: Number(total), ejemplo: Number(ejemplo) }));
}
