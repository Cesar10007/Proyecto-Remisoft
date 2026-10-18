import prisma from '../config/prisma.js';

// Flujo de cobro del tablero Cajero (RF-003 · HU-009, HU-011, HU-012).
// Al cerrar una cuenta se crea la factura, sus ítems, el pago y el movimiento
// de caja en una sola transacción, y el pedido pasa a CERRADO (la mesa queda libre).

// Estados de pedido que siguen abiertos para la operación (salón y cocina).
const ESTADOS_COBRABLES = ['ABIERTO', 'EN_PROCESO', 'EN_PREPARACION', 'LISTO'];
// id_pedido es único en Factura: una factura que no esté pagada se reutiliza
// en lugar de crear una segunda para el mismo pedido.
const ESTADOS_FACTURA_REUTILIZABLE = ['EMITIDA', 'ANULADA'];
const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];
const IVA_TASA = Number(process.env.IVA_TASA ?? 0.19);

function parseId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function itemsFacturables(detalles) {
  return detalles.filter(
    (d) => d.estado_item !== 'CANCELADO' && Number(d.Cantidad ?? 0) > 0,
  );
}

function calcularTotales(detalles) {
  const subtotal = round2(
    detalles.reduce(
      (acc, d) => acc + Number(d.Cantidad ?? 0) * Number(d.Precio_unitario ?? 0),
      0,
    ),
  );
  const iva = round2(subtotal * IVA_TASA);
  return { subtotal, iva, total: round2(subtotal + iva) };
}

function formatCuenta(pedido) {
  const detalles = itemsFacturables(pedido.Detalle_pedido);
  const totales = calcularTotales(detalles);

  return {
    id_pedido: pedido.id_pedido,
    estado: pedido.estado,
    mesa: pedido.Mesa_num,
    tipo_pedido: pedido.Tipo_pedido ?? '',
    fecha_hora: pedido.Fecha_hora,
    nombre_mesero: pedido.usuario
      ? `${pedido.usuario.nombre ?? ''} ${pedido.usuario.apellido ?? ''}`.trim()
      : null,
    items: detalles.map((d) => ({
      id_detalle: d.id_detalle,
      id_producto: d.id_producto,
      nombre: d.Producto?.Nombre ?? `Producto ${d.id_producto}`,
      cantidad: Number(d.Cantidad),
      precio_unitario: Number(d.Precio_unitario ?? 0),
      subtotal: round2(Number(d.Cantidad) * Number(d.Precio_unitario ?? 0)),
    })),
    ...totales,
  };
}

// GET /api/cobro/pendientes
// Cuentas abiertas que todavía no tienen factura.
export async function pendientes(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        estado: { in: ESTADOS_COBRABLES },
        OR: [
          { Factura: { is: null } },
          { Factura: { is: { estado: { in: ESTADOS_FACTURA_REUTILIZABLE } } } },
        ],
      },
      include: {
        Detalle_pedido: { include: { Producto: true } },
        usuario: true,
      },
      orderBy: { Fecha_hora: 'asc' },
    });

    const cuentas = pedidos
      .map(formatCuenta)
      .filter((cuenta) => cuenta.items.length > 0);

    res.json(cuentas);
  } catch (err) {
    next(err);
  }
}

// POST /api/cobro/cerrar-cuenta
// Body: { id_pedido, metodo: 'EFECTIVO'|'TARJETA'|'TRANSFERENCIA', monto_recibido?, referencia? }
export async function cerrarCuenta(req, res, next) {
  try {
    const idPedido = parseId(req.body?.id_pedido);
    if (!idPedido) {
      return res.status(422).json({ message: 'id_pedido debe ser un entero válido.' });
    }

    const metodo =
      typeof req.body?.metodo === 'string' ? req.body.metodo.trim().toUpperCase() : '';
    if (!METODOS_PAGO.includes(metodo)) {
      return res.status(422).json({
        message: 'Debes seleccionar un método de pago: EFECTIVO, TARJETA o TRANSFERENCIA.',
      });
    }

    const referencia = req.body?.referencia
      ? String(req.body.referencia).trim().slice(0, 80) || null
      : null;

    const idUsuario = req.user.id_usuario;
    const turno = await prisma.turno_caja.findFirst({
      where: { id_usuario_cajero: idUsuario, estado: 'ABIERTA' },
      orderBy: { id_turno: 'desc' },
    });

    if (!turno) {
      return res.status(409).json({
        message: 'Debes tener un turno de caja abierto para cobrar.',
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({
        where: { id_pedido: idPedido },
        include: {
          Detalle_pedido: { include: { Producto: true } },
          Factura: true,
        },
      });

      if (!pedido) {
        return { status: 404, message: 'Pedido no encontrado.' };
      }

      const facturaExistente = pedido.Factura;
      if (facturaExistente && !ESTADOS_FACTURA_REUTILIZABLE.includes(facturaExistente.estado)) {
        return { status: 409, message: 'El pedido ya tiene una factura pagada.' };
      }

      if (!ESTADOS_COBRABLES.includes(pedido.estado)) {
        return {
          status: 409,
          message: `El pedido está en estado ${pedido.estado} y no se puede cobrar.`,
        };
      }

      const detalles = itemsFacturables(pedido.Detalle_pedido);
      if (detalles.length === 0) {
        return {
          status: 422,
          message: 'No se puede cerrar una cuenta sin productos consumidos.',
        };
      }

      const { subtotal, iva, total } = calcularTotales(detalles);

      let montoRecibido = total;
      let cambio = 0;

      if (metodo === 'EFECTIVO') {
        montoRecibido = Number(req.body?.monto_recibido);
        if (!Number.isFinite(montoRecibido)) {
          return {
            status: 422,
            message: 'Para pago en efectivo debes indicar el monto recibido.',
          };
        }
        if (montoRecibido < total) {
          return {
            status: 422,
            message: `El monto recibido ($${montoRecibido}) es menor al total ($${total}).`,
          };
        }
        cambio = round2(montoRecibido - total);
      }

      const datosFactura = {
        Fecha_emision: new Date(),
        IVA: iva,
        Descuento: 0,
        Propina: 0,
        total,
        estado: 'PAGADA',
      };

      let factura;
      if (facturaExistente) {
        await tx.Factura_item.deleteMany({
          where: { id_factura: facturaExistente.id_factura },
        });
        factura = await tx.Factura.update({
          where: { id_factura: facturaExistente.id_factura },
          data: datosFactura,
        });
      } else {
        factura = await tx.Factura.create({
          data: { ...datosFactura, id_pedido: idPedido },
        });
      }

      let consecutivo = factura.consecutivo;
      if (!consecutivo) {
        consecutivo = `FAC-${new Date().getFullYear()}-${String(factura.id_factura).padStart(4, '0')}`;
        await tx.Factura.update({
          where: { id_factura: factura.id_factura },
          data: { consecutivo },
        });
      }

      await tx.Factura_item.createMany({
        data: detalles.map((d) => ({
          id_factura: factura.id_factura,
          id_detalle_pedido: d.id_detalle,
          cantidad_facturada: d.Cantidad,
        })),
      });

      const pago = await tx.pago.create({
        data: {
          id_factura: factura.id_factura,
          id_usuario_cajero: idUsuario,
          metodo,
          monto: total,
          referencia,
          estado: 'APROBADO',
          id_turno: turno.id_turno,
        },
      });

      const ultimoMovimiento = await tx.flujo_caja.findFirst({
        where: { id_turno: turno.id_turno },
        orderBy: { id_flujo: 'desc' },
      });
      const saldoAnterior = Number(
        ultimoMovimiento?.saldo ?? turno.efectivo_inicial ?? 0,
      );

      await tx.flujo_caja.create({
        data: {
          id_turno: turno.id_turno,
          concepto: `Cobro ${consecutivo} (mesa ${pedido.Mesa_num ?? 'N/A'})`,
          ingresos: total,
          egresos: 0,
          saldo: round2(saldoAnterior + total),
          metodo,
          referencia,
          id_pago: pago.id_pago,
        },
      });

      await tx.pedido.update({
        where: { id_pedido: idPedido },
        data: { estado: 'CERRADO' },
      });

      return {
        status: 201,
        data: {
          id_factura: factura.id_factura,
          consecutivo,
          id_pedido: idPedido,
          mesa: pedido.Mesa_num,
          subtotal,
          iva,
          total,
          metodo,
          monto_recibido: montoRecibido,
          cambio,
          items: detalles.map((d) => ({
            nombre: d.Producto?.Nombre ?? `Producto ${d.id_producto}`,
            cantidad: Number(d.Cantidad),
            precio_unitario: Number(d.Precio_unitario ?? 0),
          })),
          fecha_emision: factura.Fecha_emision,
        },
      };
    });

    if (resultado.status !== 201) {
      return res.status(resultado.status).json({ message: resultado.message });
    }

    return res.status(201).json({
      message: 'Cuenta cerrada y factura emitida. La mesa quedó libre.',
      factura: resultado.data,
    });
  } catch (err) {
    next(err);
  }
}
