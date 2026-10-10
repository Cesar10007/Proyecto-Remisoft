import prisma from '../config/prisma.js';

// Tablero de cocina (RF-002 · HU-008, HU-010).
// Cada ítem de pedido avanza solo hacia adelante:
// PENDIENTE → PREPARANDO → LISTO → ENTREGADO.

const ESTADOS_PEDIDO_ACTIVO = ['ABIERTO', 'EN_PROCESO', 'EN_PREPARACION', 'LISTO'];
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

// Mantiene el estado del pedido alineado con sus ítems:
// si algún ítem ya se está preparando el pedido pasa a EN_PREPARACION,
// y si todos están listos o entregados pasa a LISTO.
async function sincronizarEstadoPedido(idPedido) {
  const items = await prisma.Detalle_pedido.findMany({
    where: { id_pedido: idPedido, estado_item: { not: 'CANCELADO' } },
    select: { estado_item: true },
  });

  const estados = items.map((i) => i.estado_item ?? 'PENDIENTE');
  let nuevoEstado = null;

  if (estados.length > 0 && estados.every((e) => e === 'LISTO' || e === 'ENTREGADO')) {
    nuevoEstado = 'LISTO';
  } else if (estados.some((e) => e !== 'PENDIENTE')) {
    nuevoEstado = 'EN_PREPARACION';
  }

  if (nuevoEstado) {
    await prisma.pedido.updateMany({
      where: { id_pedido: idPedido, estado: { in: ESTADOS_PEDIDO_ACTIVO } },
      data: { estado: nuevoEstado },
    });
  }
}

// GET /api/cocina/comandas
// Pedidos activos con al menos un ítem que todavía no se entregó.
export async function comandas(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        estado: { in: ESTADOS_PEDIDO_ACTIVO },
        Detalle_pedido: {
          some: { estado_item: { in: ESTADOS_ITEM_EN_COCINA } },
        },
      },
      include: {
        Detalle_pedido: {
          where: { estado_item: { not: 'CANCELADO' } },
          include: { Producto: true },
          orderBy: { id_detalle: 'asc' },
        },
        usuario: true,
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
        nombre_mesero: p.usuario
          ? `${p.usuario.nombre ?? ''} ${p.usuario.apellido ?? ''}`.trim()
          : null,
        items: p.Detalle_pedido.map((d) => ({
          id_detalle: d.id_detalle,
          nombre: d.Producto?.Nombre ?? `Producto ${d.id_producto}`,
          cantidad: Number(d.Cantidad ?? 0),
          estado: d.estado_item ?? 'PENDIENTE',
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

    const detalle = await prisma.Detalle_pedido.findUnique({
      where: { id_detalle: idDetalle },
      include: { pedido: true, Producto: true },
    });

    if (!detalle) {
      return res.status(404).json({ message: 'Ítem no encontrado.' });
    }

    if (!ESTADOS_PEDIDO_ACTIVO.includes(detalle.pedido.estado)) {
      return res.status(409).json({
        message: `El pedido está en estado ${detalle.pedido.estado} y ya no se puede modificar.`,
      });
    }

    const actual = detalle.estado_item ?? 'PENDIENTE';
    const siguiente = SIGUIENTE_ESTADO_ITEM[actual];

    if (!siguiente) {
      return res.status(409).json({ message: `El ítem ya está en estado ${actual}.` });
    }

    const solicitado = req.body?.estado_item;
    if (solicitado !== undefined && solicitado !== siguiente) {
      return res.status(422).json({
        message: `Transición no válida: de ${actual} solo se puede pasar a ${siguiente}.`,
      });
    }

    const actualizado = await prisma.Detalle_pedido.update({
      where: { id_detalle: idDetalle },
      data: { estado_item: siguiente },
    });

    await sincronizarEstadoPedido(detalle.id_pedido);

    res.json({
      id_detalle: actualizado.id_detalle,
      id_pedido: actualizado.id_pedido,
      nombre: detalle.Producto?.Nombre ?? `Producto ${detalle.id_producto}`,
      estado: actualizado.estado_item,
    });
  } catch (err) {
    next(err);
  }
}
