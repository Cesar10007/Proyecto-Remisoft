import prisma from '../config/prisma.js';

const ESTADOS_CERRADOS = ['CERRADO', 'CANCELADO'];

/**
 * GET /api/mesas
 * Lista las mesas con su estado según los pedidos en curso.
 * Una mesa está ocupada si tiene al menos un pedido que no esté CERRADO ni CANCELADO.
 */
export async function index(req, res, next) {
  try {
    const mesas = await prisma.mesa.findMany({ orderBy: { numero: 'asc' } });

    const pedidos = await prisma.pedido.findMany({
      where: {
        Mesa_num: { not: null },
        OR: [{ estado: null }, { estado: { notIn: ESTADOS_CERRADOS } }],
      },
      include: { usuario: true, Detalle_pedido: true },
      orderBy: { Fecha_hora: 'asc' },
    });

    const pedidosPorMesa = new Map();
    for (const pedido of pedidos) {
      const grupo = pedidosPorMesa.get(pedido.Mesa_num) ?? [];
      grupo.push(pedido);
      pedidosPorMesa.set(pedido.Mesa_num, grupo);
    }

    const data = mesas.map((mesa) => {
      const grupo = pedidosPorMesa.get(mesa.numero) ?? [];

      if (grupo.length === 0) {
        return {
          numero: mesa.numero,
          capacidad: mesa.capacidad,
          estado: 'available',
          pedidos: 0,
          articulos: 0,
          total: 0,
          id_pedido: null,
          mesero: null,
          fecha_hora: null,
        };
      }

      const detalles = grupo.flatMap((pedido) =>
        pedido.Detalle_pedido.filter((d) => d.estado_item !== 'CANCELADO'),
      );
      const primero = grupo[0];

      return {
        numero: mesa.numero,
        capacidad: mesa.capacidad,
        estado: 'occupied',
        pedidos: grupo.length,
        articulos: detalles.reduce((acc, d) => acc + Number(d.Cantidad ?? 0), 0),
        total: detalles.reduce(
          (acc, d) => acc + Number(d.Cantidad ?? 0) * Number(d.Precio_unitario ?? 0),
          0,
        ),
        id_pedido: primero.id_pedido,
        mesero: primero.usuario?.nombre ?? null,
        fecha_hora: primero.Fecha_hora,
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
