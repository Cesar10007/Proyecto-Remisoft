import prisma from '../config/prisma.js';
import {
  pedidosDelComedor,
  atencionesDelComedor,
  datosDelConsumo,
  consumoPublico,
  presentarMesas,
} from '../utils/lecturaMesas.js';

// GET /api/mesas: las tarjetas y sus fichas salen de la misma lectura consistente.
export async function index(req, res, next) {
  try {
    const [catalogo, pedidos] = await prisma.$transaction(
      [
        prisma.mesa.findMany({ orderBy: { numero: 'asc' }, include: atencionesDelComedor(req.user) }),
        prisma.pedido.findMany({
          where: pedidosDelComedor(req.user),
          include: datosDelConsumo,
          orderBy: { id_pedido: 'asc' },
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    res.json({ success: true, data: presentarMesas(catalogo, pedidos.map(consumoPublico), req.user) });
  } catch (err) {
    next(err);
  }
}
