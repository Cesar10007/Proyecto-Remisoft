import prisma from '../config/prisma.js';
import { abrirMesa, cambiarComanda, cambiarEstadoMesa } from '../services/salon.service.js';
import { entero, indicadorPago, conPago, IVA_TASA, misPedidos, CUENTA_ABIERTA } from '../utils/salon.js';
import {
  pedidosDelComedor,
  atencionesDelComedor,
  datosDelConsumo,
  consumoPublico,
  presentarMesas,
} from '../utils/lecturaMesas.js';
import { registrarAuditoria } from '../utils/auditoria.js';

export async function tablero(req, res, next) {
  try {
    const [mesas, pedidos, privados, sede] = await prisma.$transaction(
      [
        prisma.mesa.findMany({ orderBy: { numero: 'asc' }, include: atencionesDelComedor(req.user) }),
        prisma.pedido.findMany({
          where: pedidosDelComedor(req.user),
          include: datosDelConsumo,
          orderBy: { id_pedido: 'asc' },
        }),
        prisma.pedido.findMany({
          where: { AND: [misPedidos(req.user), CUENTA_ABIERTA] },
          select: {
            id_pedido: true,
            id_cliente: true,
            version_salon: true,
            Factura: indicadorPago,
            Cliente: { select: { Nombre: true, Apellido: true } },
          },
          orderBy: { id_pedido: 'asc' },
        }),
        prisma.restaurante.findFirst({
          where: { id_restaurante: req.user.id_restaurante ?? -1 },
          select: { nombre: true },
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    const consumos = pedidos.map(consumoPublico);
    const consumosPorId = new Map(consumos.map((p) => [p.id_pedido, p]));
    res.json({
      sede: sede?.nombre ?? 'Salón principal',
      tasa_iva: IVA_TASA,
      mesas: presentarMesas(mesas, consumos, req.user),
      // Mis pedidos sigue siendo privado. La lectura compartida no cambia el alcance de las mutaciones.
      pedidos: privados.map((p) => ({
        ...consumosPorId.get(p.id_pedido),
        version: p.version_salon ?? 0,
        pago_registrado: conPago(p.Factura),
        id_cliente: p.id_cliente,
        cliente: [p.Cliente?.Nombre, p.Cliente?.Apellido].filter(Boolean).join(' '),
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function carta(_req, res, next) {
  try {
    const [productos, clientes] = await Promise.all([
      prisma.producto.findMany({
        where: { Estado: 1, precio_venta: { not: null } },
        select: {
          id_producto: true,
          Nombre: true,
          Descripcion: true,
          precio_venta: true,
          Categoria: true,
          categoria: { select: { nombre: true } },
        },
        orderBy: { Nombre: 'asc' },
      }),
      prisma.cliente.findMany({
        select: { id_cliente: true, Nombre: true, Apellido: true },
        orderBy: { Nombre: 'asc' },
      }),
    ]);
    res.json({
      productos: productos.map((p) => ({
        id: p.id_producto,
        nombre: p.Nombre || `Producto ${p.id_producto}`,
        descripcion: p.Descripcion,
        precio: Number(p.precio_venta),
        categoria: p.categoria?.nombre || p.Categoria || 'Otros',
      })),
      clientes: clientes.map((c) => ({
        id: c.id_cliente,
        nombre: [c.Nombre, c.Apellido].filter(Boolean).join(' ') || `Cliente ${c.id_cliente}`,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export const operar = (accion) => async (req, res, next) => {
  try {
    const crear = accion === 'abrir';
    const id = crear
      ? await abrirMesa(req.user, req.body)
      : await cambiarComanda(req.user, entero(Number(req.params.id), 'El pedido'), req.body, accion);
    registrarAuditoria({
      evento: `SALON_${accion.toUpperCase()}`,
      id_usuario: req.user.id_usuario,
      extra: { id_pedido: id },
    });
    res.status(crear ? 201 : 200).json({ id_pedido: id });
  } catch (err) {
    next(err);
  }
};

export async function actualizarMesa(req, res, next) {
  try {
    const resultado = await cambiarEstadoMesa(
      req.user,
      entero(Number(req.params.numero), 'La mesa'),
      req.body,
    );
    registrarAuditoria({ evento: 'SALON_ESTADO_MESA', id_usuario: req.user.id_usuario, extra: resultado });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
