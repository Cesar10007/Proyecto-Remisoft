import { relacionDeSede } from '../utils/restaurante.js';
import { consumoFacturado, esBorrador, importesFactura } from '../utils/facturacion.js';
import { bloquearPedido, transaccionSalon } from './salon.service.js';
import {
  conPago,
  deSede,
  entero,
  ErrorSalon,
  IVA_TASA,
  misPedidos,
  itemsFacturables,
  texto,
} from '../utils/salon.js';

export const alcanceFacturacion = (user) => (user.rol === 'MESERO' ? misPedidos(user) : deSede(user));
export const lineasDeFactura = {
  orderBy: { id_detalle_pedido: 'asc' },
  include: {
    Detalle_pedido: {
      select: { id_pedido: true, Precio_unitario: true, Producto: { select: { Nombre: true, id_restaurante: true } } },
    },
  },
};
export const origenDeFactura = {
  Cliente: { select: { Nombre: true, Apellido: true, id_restaurante: true } },
  Detalle_pedido: { orderBy: { id_detalle: 'asc' }, include: { Producto: { select: { Nombre: true, id_restaurante: true } } } },
};

function campos(body, permitidos) {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((k) => !permitidos.includes(k))
  )
    throw new ErrorSalon(
      422,
      'Solo se pueden modificar los datos de facturación. El estado, los platos y los totales los determina el servidor.',
    );
}
const editables = ['receptor', 'descuento', 'propina'];

// Bajo el bloqueo del pedido. El cobro directo (sin borrador) conserva el flujo de caja anterior.
export async function guardarConsumo(tx, pedido, ajustes, estado, anterior = null) {
  const cliente = relacionDeSede(pedido.Cliente, pedido.id_restaurante);
  const items = itemsFacturables(pedido.Detalle_pedido).map((d) => ({
    id_detalle: d.id_detalle,
    cantidad: d.Cantidad,
    precio_unitario: Number(d.Precio_unitario ?? 0),
    nombre: relacionDeSede(d.Producto, pedido.id_restaurante)?.Nombre || `Producto ${d.id_producto}`,
  }));
  const datos = {
    ...importesFactura(items, ajustes.descuento, ajustes.propina),
    receptor:
      texto(
        ajustes.receptor ?? [cliente?.Nombre, cliente?.Apellido].filter(Boolean).join(' '),
        120,
        'Nombre de facturación',
      ) || 'Consumidor final',
    tasa_iva: IVA_TASA,
    Fecha_emision: new Date(),
    estado,
  };
  let f;
  if (anterior) {
    // Solo caja reutiliza una cabecera histórica sin pago. Nunca se reconstruye un borrador al cobrarlo.
    f = await tx.factura.update({ where: { id_factura: anterior.id_factura }, data: datos });
    await tx.factura_item.deleteMany({ where: { id_factura: f.id_factura } });
  } else {
    f = await tx.factura.create({ data: { ...datos, id_pedido: pedido.id_pedido } });
  }
  if (!f.consecutivo) {
    const consecutivo = `FAC-${datos.Fecha_emision.getUTCFullYear()}-${String(f.id_factura).padStart(4, '0')}`;
    f = await tx.factura.update({ where: { id_factura: f.id_factura }, data: { consecutivo } });
  }
  await tx.factura_item.createMany({
    data: items.map((i) => ({
      id_factura: f.id_factura,
      id_detalle_pedido: i.id_detalle,
      cantidad_facturada: i.cantidad,
      nombre_producto: i.nombre,
      precio_unitario: i.precio_unitario,
    })),
  });
  return f;
}

export function generarFactura(user, body) {
  campos(body, ['id_pedido', ...editables]);
  const id = entero(body.id_pedido, 'El pedido');
  return transaccionSalon(async (tx) => {
    await bloquearPedido(tx, id, user.id_restaurante);
    const p = await tx.pedido.findFirst({
      where: { id_pedido: id, ...alcanceFacturacion(user) },
      include: { ...origenDeFactura, Factura: { select: { id_factura: true } } },
    });
    if (!p) throw new ErrorSalon(404, 'Pedido no encontrado.');
    if (p.Factura) throw new ErrorSalon(409, 'Este pedido ya tiene una factura. Consúltala en el historial.');
    if (
      p.estado !== 'POR_COBRAR' &&
      !(user.rol !== 'MESERO' && p.version_salon == null && p.estado === 'ENTREGADO')
    )
      throw new ErrorSalon(409, 'Envía la cuenta a caja antes de generar la factura.');
    return guardarConsumo(tx, p, body, 'PENDIENTE');
  });
}

// Crear, editar y cobrar serializan sobre la misma fila de pedido. Se relee el estado
// DESPUÉS de obtener el bloqueo para que un formulario abierto no pueda modificar un pago concurrente.
export function editarFactura(user, id, body) {
  return transaccionSalon(async (tx) => {
    const where = { id_factura: id, pedido: alcanceFacturacion(user) };
    const origen = await tx.factura.findFirst({ where, select: { id_pedido: true } });
    if (!origen) throw new ErrorSalon(404, 'Factura no encontrada.');
    await bloquearPedido(tx, origen.id_pedido, user.id_restaurante);
    const f = await tx.factura.findFirst({
      where,
      include: { pago: { select: { estado: true } }, Factura_item: lineasDeFactura },
    });
    if (!f) throw new ErrorSalon(404, 'Factura no encontrada.');
    if (conPago(f))
      throw new ErrorSalon(
        409,
        'La factura ya está pagada. Se conserva en el historial y no admite cambios.',
      );
    if (!esBorrador(f)) throw new ErrorSalon(409, 'Solo se puede editar una factura pendiente de pago.');
    campos(body, ['version_edicion', ...editables]);
    if (body.version_edicion !== f.version_edicion)
      throw new ErrorSalon(
        409,
        'Otra persona modificó la factura. Revisa la versión actual antes de guardar.',
      );
    if (!editables.some((k) => Object.hasOwn(body, k)))
      throw new ErrorSalon(422, 'Indica qué dato de la factura quieres editar.');
    const importes = importesFactura(
      consumoFacturado(f, user.id_restaurante),
      body.descuento === undefined ? Number(f.Descuento) : body.descuento,
      body.propina === undefined ? Number(f.Propina) : body.propina,
      Number(f.tasa_iva),
    );
    return tx.factura.update({
      where: { id_factura: id },
      data: {
        ...importes,
        receptor:
          body.receptor === undefined
            ? f.receptor
            : texto(body.receptor, 120, 'Nombre de facturación') || 'Consumidor final',
        version_edicion: { increment: 1 },
      },
    });
  });
}
