import { mesaDisponible, transaccionSalon } from '../services/salon.service.js';
import { entero } from '../utils/salon.js';
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
        prisma.mesa.findMany({ where: req.sede, orderBy: { numero: 'asc' }, include: atencionesDelComedor(req.user) }),
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

// Las sedes nuevas no heredan el plano de la demo.
export async function crear(req, res, next) {
  try {
    const { numero, capacidad } = req.body ?? {};
    if (![numero, capacidad].every(n => Number.isInteger(n) && n > 0 && n <= 2147483647)) {
      return res.status(422).json({ message: 'Número y capacidad deben ser enteros positivos.' });
    }
    const mesa = await prisma.mesa.create({ data: { ...req.sede, numero, capacidad } });
    res.status(201).json({ success: true, data: mesa });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Ya existe una mesa con ese número en el establecimiento.' });
    next(err);
  }
}

// DELETE /api/mesas/:numero. Mismo bloqueo que sentar comensales o abrir una cuenta.
// El número del pedido es histórico: retirar la mesa del plano no modifica pedidos ni facturas.
export async function eliminar(req, res, next) {
  try {
    const numero = entero(Number(req.params.numero), 'La mesa');
    await transaccionSalon(async (tx) => {
      await mesaDisponible(tx, numero, req.sede);
      await tx.mesa.delete({ where: { numero_id_restaurante: { numero, id_restaurante: req.sede.id_restaurante } } });
    });
    res.json({ message: 'Mesa eliminada del plano.' });
  } catch (err) { next(err); }
}
