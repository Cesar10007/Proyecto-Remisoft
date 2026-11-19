import { escritura } from '../services/actividad.service.js';
import { mesaDisponible, transaccionSalon } from '../services/salon.service.js';
import { entero, ErrorSalon } from '../utils/salon.js';
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
    const mesa = await escritura(req.user, tx => tx.mesa.create({ data: { ...req.sede, numero, capacidad } }));
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
    await transaccionSalon(req.user, async (tx) => {
      await mesaDisponible(tx, numero, req.sede);
      await tx.mesa.delete({ where: { numero_id_restaurante: { numero, id_restaurante: req.sede.id_restaurante } } });
    });
    res.json({ message: 'Mesa eliminada del plano.' });
  } catch (err) { next(err); }
}

export async function editar(req, res, next) {
  try {
    const numero = entero(Number(req.params.numero), 'La mesa');
    const nuevo = entero(req.body.numero ?? numero, 'El número de mesa');
    const capacidad = entero(req.body.capacidad, 'La capacidad');
    const data = await transaccionSalon(req.user, async tx => {
      const mesa = await mesaDisponible(tx, numero, req.sede);
      if ((req.body.id_mesa !== undefined && mesa.id_mesa !== req.body.id_mesa) ||
        (req.body.capacidad_esperada !== undefined && req.body.capacidad_esperada !== mesa.capacidad)) {
        throw new ErrorSalon(409, 'El plano cambió. Vuelve a abrir la mesa.');
      }
      return tx.mesa.update({ where: { numero_id_restaurante: { numero, ...req.sede } }, data: { numero: nuevo, capacidad } });
    });
    res.json({ data });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Ese número de mesa ya está en uso.' });
    next(err);
  }
}
