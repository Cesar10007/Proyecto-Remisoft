import { ESTADOS_EN_COCINA, estadoSegunItems, ErrorSalon, deSede } from '../utils/salon.js';
import { bloquearPedido, transaccionSalon } from '../services/salon.service.js';
import prisma from '../config/prisma.js';

// Tablero de cocina (RF-002 · HU-008, HU-010).
// Cada ítem de pedido avanza solo hacia adelante:
// PENDIENTE → PREPARANDO → LISTO → ENTREGADO.

const alcance = (user) => ({
  ...deSede(user),
  ...(user.rol === 'MESERO' ? { id_mesero: user.id_usuario } : {}),
});
const ESTADOS_ITEM_EN_COCINA = ['PENDIENTE', 'PREPARANDO', 'LISTO'];
const SIGUIENTE_ESTADO_ITEM = {
  PENDIENTE: 'PREPARANDO',
  PREPARANDO: 'LISTO',
  LISTO: 'ENTREGADO',
};

function parseId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

// GET /api/cocina/comandas
// Pedidos activos con al menos un ítem que todavía no se entregó.
export async function comandas(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        AND: [alcance(req.user), { OR: [{ estado: null }, { estado: { in: ESTADOS_EN_COCINA } }] }],
        Detalle_pedido: {
          some: { OR: [{ estado_item: null }, { estado_item: { in: ESTADOS_ITEM_EN_COCINA } }] },
        },
      },
      include: {
        Detalle_pedido: {
          where: { OR: [{ estado_item: null }, { estado_item: { not: 'CANCELADO' } }] },
          include: { Producto: true },
          orderBy: { id_detalle: 'asc' },
        },
        usuario: { select: { nombre: true, apellido: true } },
      },
      orderBy: { Fecha_hora: 'asc' },
    });

    res.json(
      pedidos.map((p) => ({
        id_pedido: p.id_pedido,
        mesa: p.Mesa_num,
        tipo_pedido: p.Tipo_pedido ?? '',
        notas: p.notas ?? '',
        fecha_hora: p.Fecha_hora,
        nombre_mesero: p.usuario ? `${p.usuario.nombre ?? ''} ${p.usuario.apellido ?? ''}`.trim() : null,
        items: p.Detalle_pedido.map((d) => ({
          id_detalle: d.id_detalle,
          nombre: d.Producto?.Nombre ?? `Producto ${d.id_producto}`,
          cantidad: Number(d.Cantidad ?? 0),
          estado: d.estado_item ?? 'PENDIENTE',
          nota: d.nota ?? '',
        })),
      })),
    );
  } catch (err) {
    next(err);
  }
}

// PATCH /api/cocina/items/:id/avanzar
// Avanza el ítem al siguiente estado. Si se envía { estado_item }, debe ser
// exactamente el siguiente; no se permite saltar pasos ni retroceder.
export async function avanzarItem(req, res, next) {
  try {
    const idDetalle = parseId(req.params.id);
    if (!idDetalle) {
      return res.status(422).json({ message: 'El id del ítem debe ser un entero válido.' });
    }

    const item = await prisma.detalle_pedido.findUnique({
      where: { id_detalle: idDetalle },
      select: { id_pedido: true },
    });
    if (!item) throw new ErrorSalon(404, 'Ítem no encontrado.');
    const resultado = await transaccionSalon(async (tx) => {
      await bloquearPedido(tx, item.id_pedido);
      const p = await tx.pedido.findFirst({
        where: { id_pedido: item.id_pedido, ...alcance(req.user) },
        include: { Detalle_pedido: { include: { Producto: { select: { Nombre: true } } } } },
      });
      if (!p) throw new ErrorSalon(404, 'Comanda no encontrada.');
      if (!ESTADOS_EN_COCINA.includes(p.estado ?? 'ABIERTO'))
        throw new ErrorSalon(409, 'El pedido ya no está en cocina.');
      const d = p.Detalle_pedido.find((d) => d.id_detalle === idDetalle);
      if (!d) throw new ErrorSalon(404, 'Ítem no encontrado.');
      const siguiente = SIGUIENTE_ESTADO_ITEM[d.estado_item ?? 'PENDIENTE'];
      if (!siguiente || (req.body?.estado_item !== undefined && req.body.estado_item !== siguiente))
        throw new ErrorSalon(409, 'El plato cambió de estado. Actualiza la comanda.');
      await tx.detalle_pedido.update({ where: { id_detalle: idDetalle }, data: { estado_item: siguiente } });
      const estados = p.Detalle_pedido.filter((i) => i.estado_item !== 'CANCELADO').map((i) =>
        i.id_detalle === idDetalle ? siguiente : i.estado_item,
      );
      await tx.pedido.update({
        where: { id_pedido: p.id_pedido },
        data: { estado: estadoSegunItems(estados) },
      });
      return { id_detalle: idDetalle, id_pedido: p.id_pedido, nombre: d.Producto?.Nombre, estado: siguiente };
    });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
