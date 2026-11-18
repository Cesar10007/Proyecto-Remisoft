import { consumoFacturado, esBorrador } from '../utils/facturacion.js';
import { guardarConsumo, lineasDeFactura, origenDeFactura } from '../services/facturacion.service.js';
import { formatCuenta, conPago, itemsFacturables, round2, deSede, ESTADOS_EN_MESA } from '../utils/salon.js';
import { bloquearPedido, transaccionSalon } from '../services/salon.service.js';
import prisma from '../config/prisma.js';
import { verificarStockSuficiente, registrarSalidasPorConsumo } from '../services/inventario.service.js';

// Flujo de cobro del tablero Cajero (RF-003 · HU-009, HU-011, HU-012).
// Al cerrar una cuenta se crea o confirma su factura, se registra el pago
// y el pedido pasa a CERRADO en una sola transacción.

// Estados de pedido que siguen abiertos para la operación (salón y cocina).
const ESTADOS_COBRABLES = ESTADOS_EN_MESA;
// id_pedido es único en Factura: una factura que no esté pagada se reutiliza
// en lugar de crear una segunda para el mismo pedido.
const ESTADOS_FACTURA_REUTILIZABLE = ['EMITIDA', 'ANULADA'];
const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'];

function parseId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

// GET /api/cobro/pendientes
// La vista y la transacción de pago usan la misma fuente del importe. Si hay borrador,
// mandan sus renglones y ajustes guardados, no la suma sin descuento de la comanda.
function cuentaParaCobro(pedido) {
  const cuenta = formatCuenta(pedido);
  const f = pedido.Factura;
  if (!esBorrador(f)) return { ...cuenta, descuento: 0, propina: 0, version_factura: null };
  const items = consumoFacturado(f, pedido.id_restaurante).map((i) => ({ ...i, subtotal: round2(i.cantidad * i.precio_unitario) }));
  return {
    ...cuenta,
    items,
    subtotal: round2(items.reduce((s, i) => s + i.subtotal, 0)),
    iva: Number(f.IVA),
    total: Number(f.total),
    descuento: Number(f.Descuento),
    propina: Number(f.Propina),
    receptor: f.receptor,
    consecutivo: f.consecutivo,
    version_factura: f.version_edicion,
  };
}

export async function pendientes(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        estado: { in: ESTADOS_COBRABLES },
        AND: [deSede(req.user), { OR: [{ version_salon: null }, { estado: 'POR_COBRAR' }] }],
        OR: [
          { Factura: { is: null } },
          {
            Factura: {
              is: {
                OR: [
                  { estado: { in: ESTADOS_FACTURA_REUTILIZABLE } },
                  { estado: 'PENDIENTE', tasa_iva: { not: null }, total: { not: null } },
                ],
                pago: { none: { estado: 'APROBADO' } },
              },
            },
          },
        ],
      },
      include: {
        Detalle_pedido: { include: { Producto: true } },
        Factura: { include: { Factura_item: lineasDeFactura } },
        usuario: { where: req.sede, select: { nombre: true, apellido: true, id_restaurante: true } },
      },
      orderBy: { Fecha_hora: 'asc' },
    });

    const cuentas = pedidos.map(cuentaParaCobro).filter((cuenta) => cuenta.items.length > 0);

    res.json(cuentas);
  } catch (err) {
    next(err);
  }
}

// POST /api/cobro/cerrar-cuenta
// Para un borrador, version_factura debe ser la revisión vista por caja en /pendientes.
export async function cerrarCuenta(req, res, next) {
  try {
    const idPedido = parseId(req.body?.id_pedido);
    if (!idPedido) {
      return res.status(422).json({ message: 'id_pedido debe ser un entero válido.' });
    }

    const metodo = typeof req.body?.metodo === 'string' ? req.body.metodo.trim().toUpperCase() : '';
    if (!METODOS_PAGO.includes(metodo)) {
      return res.status(422).json({
        message: 'Debes seleccionar un método de pago: EFECTIVO, TARJETA o TRANSFERENCIA.',
      });
    }

    const referencia = req.body?.referencia ? String(req.body.referencia).trim().slice(0, 80) || null : null;

    const idUsuario = req.user.id_usuario;
    const resultado = await transaccionSalon(async (tx) => {
      // Serializa pagos de un mismo turno para no perder saldo ni cobrar en una caja cerrada.
      const [turno] = await tx.$queryRaw`SELECT id_turno, efectivo_inicial FROM turno_caja
        WHERE id_usuario_cajero = ${idUsuario} AND id_restaurante = ${req.sede.id_restaurante} AND estado = 'ABIERTA' ORDER BY id_turno DESC LIMIT 1 FOR UPDATE`;
      if (!turno) return { status: 409, message: 'Debes tener un turno de caja abierto para cobrar.' };
      await bloquearPedido(tx, idPedido, req.sede.id_restaurante);
      const pedido = await tx.pedido.findFirst({
        where: { id_pedido: idPedido, ...deSede(req.user) },
        include: {
          ...origenDeFactura,
          Factura: {
            include: {
              Factura_item: lineasDeFactura,
              pago: { where: { estado: 'APROBADO' }, select: { estado: true }, take: 1 },
            },
          },
        },
      });

      if (!pedido) {
        return { status: 404, message: 'Pedido no encontrado.' };
      }

      const facturaExistente = pedido.Factura;
      if (conPago(facturaExistente))
        return { status: 409, message: 'El pedido ya tiene una factura pagada.' };
      const conBorrador = esBorrador(facturaExistente);
      if (
        facturaExistente &&
        !conBorrador &&
        !ESTADOS_FACTURA_REUTILIZABLE.includes(facturaExistente.estado)
      ) {
        return { status: 409, message: 'Esta factura no se puede cobrar. Revisa su estado y sus importes.' };
      }

      if (
        !ESTADOS_COBRABLES.includes(pedido.estado) ||
        (pedido.version_salon !== null && pedido.estado !== 'POR_COBRAR')
      ) {
        return {
          status: 409,
          message: `El pedido está en estado ${pedido.estado} y no se puede cobrar.`,
        };
      }

      const cuenta = cuentaParaCobro(pedido);
      if ((req.body.version_factura ?? null) !== cuenta.version_factura)
        return {
          status: 409,
          message: 'La factura cambió. Actualiza y confirma el importe antes de cobrar.',
        };
      const detalles = itemsFacturables(pedido.Detalle_pedido);
      if (cuenta.items.length === 0 || detalles.length === 0) {
        return {
          status: 422,
          message: 'No se puede cerrar una cuenta sin productos consumidos.',
        };
      }

      // Regla de negocio: no se cobra si no hay stock suficiente de los
      // ingredientes que consume la receta (réplica de la validación de
      // sp_registrar_movimiento_inventario).
      // Las cuentas confirmadas por salón ya registraron su consumo.
      const { requerimientos } =
        pedido.version_salon !== null
          ? { requerimientos: [] }
          : await verificarStockSuficiente(
              tx,
              detalles.map((d) => ({
                id_producto: d.id_producto,
                cantidad: Number(d.Cantidad ?? 0),
              })),
              req.sede.id_restaurante,
            );

      const { subtotal, iva, total, descuento, propina } = cuenta;

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

      const factura = conBorrador
        ? await tx.factura.update({
            where: { id_factura: facturaExistente.id_factura },
            data: { estado: 'PAGADA', Fecha_emision: new Date() },
          })
        : await guardarConsumo(tx, pedido, {}, 'PAGADA', facturaExistente);
      const consecutivo = factura.consecutivo;

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
      const saldoAnterior = Number(ultimoMovimiento?.saldo ?? turno.efectivo_inicial ?? 0);

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

      // Descuento de inventario por consumo (una sola vez por cobro).
      await registrarSalidasPorConsumo(tx, requerimientos, {
        id_usuario: idUsuario,
        ...req.sede,
        origen_tipo: 'VENTA',
        origen_id: factura.id_factura,
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
          items: cuenta.items,
          receptor: factura.receptor,
          descuento,
          propina,
          fecha_emision: factura.Fecha_emision,
        },
      };
    });

    if (resultado.status !== 201) {
      return res.status(resultado.status).json({ message: resultado.message });
    }

    return res.status(201).json({
      message: 'Cuenta cerrada y factura pagada.',
      factura: resultado.data,
    });
  } catch (err) {
    next(err);
  }
}
