// Reglas compartidas por el salón, el pase de cocina y caja.
export const ESTADOS_EN_COCINA = ['ABIERTO', 'EN_PROCESO', 'EN_PREPARACION', 'LISTO'];
export const ESTADOS_EN_MESA = [...ESTADOS_EN_COCINA, 'ENTREGADO', 'POR_COBRAR'];
export const CUENTA_ABIERTA = { OR: [{ estado: null }, { estado: { notIn: ['CERRADO', 'CANCELADO'] } }] };
export const IVA_TASA = Number(process.env.IVA_TASA ?? 0.19);
export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export class ErrorSalon extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Las cuentas antiguas no siempre tenían restaurante. En ese caso manda la sede del mesero.
function filtroSede(sede) {
  const heredado = { id_restaurante: null, usuario: { is: { id_restaurante: sede } } };
  return sede === null ? heredado : { OR: [{ id_restaurante: sede }, heredado] };
}
export function deSede(user) {
  return user.rol === 'SUPERADMIN' ? {} : filtroSede(user.id_restaurante ?? null);
}
// Para comprobar ocupación importa la sede del pedido, no la del administrador que lo edita.
export function mesasDeSede(sede) {
  return sede != null
    ? filtroSede(sede)
    : { id_restaurante: null, OR: [{ id_mesero: null }, { usuario: { is: { id_restaurante: null } } }] };
}
export function alcanceMesero(user) {
  return user.rol === 'MESERO' ? { ...deSede(user), id_mesero: user.id_usuario } : {};
}
export function misPedidos(user) {
  return { ...deSede(user), id_mesero: user.id_usuario, Mesa_num: { not: null } };
}

// Algunas facturas históricas conservan el estado EMITIDA aunque ya tengan un pago aprobado.
export const indicadorPago = {
  select: { estado: true, pago: { where: { estado: 'APROBADO' }, select: { id_pago: true }, take: 1 } },
};
export const conPago = (factura) => factura?.estado === 'PAGADA' || Boolean(factura?.pago?.length);

export const itemsFacturables = (detalles) =>
  detalles.filter((d) => d.estado_item !== 'CANCELADO' && Number(d.Cantidad) > 0);
export function calcularTotales(detalles) {
  const subtotal = round2(detalles.reduce((s, d) => s + Number(d.Cantidad) * Number(d.Precio_unitario), 0));
  const iva = round2(subtotal * IVA_TASA);
  return { subtotal, iva, total: round2(subtotal + iva) };
}
export function estadoSegunItems(estados) {
  if (estados.length && estados.every((e) => e === 'ENTREGADO')) return 'ENTREGADO';
  if (estados.length && estados.every((e) => e === 'LISTO' || e === 'ENTREGADO')) return 'LISTO';
  return estados.some((e) => e && e !== 'PENDIENTE') ? 'EN_PREPARACION' : 'ABIERTO';
}
export function texto(value, max, nombre) {
  if (value == null) return null;
  if (typeof value !== 'string' || value.trim().length > max)
    throw new ErrorSalon(422, `${nombre}: máximo ${max} caracteres.`);
  return value.trim() || null;
}
export function entero(value, nombre, max = 2147483647) {
  if (!Number.isInteger(value) || value < 1 || value > max)
    throw new ErrorSalon(422, `${nombre} debe ser un entero entre 1 y ${max}.`);
  return value;
}
export function leerLineas(items) {
  if (!Array.isArray(items) || !items.length || items.length > 100)
    throw new ErrorSalon(422, 'La comanda debe tener entre 1 y 100 renglones.');
  const ids = new Set();
  return items.map((i) => {
    const id = i?.id_detalle == null ? null : entero(i.id_detalle, 'El detalle');
    if (id !== null && ids.has(id)) throw new ErrorSalon(422, 'Hay un detalle repetido en la comanda.');
    ids.add(id);
    return {
      id_detalle: id,
      id_producto: entero(i?.id_producto, 'El producto'),
      cantidad: entero(i?.cantidad, 'La cantidad', 99),
      nota: texto(i?.nota, 200, 'Indicaciones del plato'),
    };
  });
}

export function formatCuenta(pedido) {
  const detalles = itemsFacturables(pedido.Detalle_pedido);
  const totales = calcularTotales(detalles);

  return {
    id_pedido: pedido.id_pedido,
    estado: pedido.estado ?? 'ABIERTO',
    mesa: pedido.Mesa_num,
    tipo_pedido: pedido.Tipo_pedido ?? '',
    fecha_hora: pedido.Fecha_hora,
    nombre_mesero: pedido.usuario
      ? `${pedido.usuario.nombre ?? ''} ${pedido.usuario.apellido ?? ''}`.trim()
      : null,
    items: detalles.map((d) => ({
      id_detalle: d.id_detalle,
      estado: d.estado_item ?? 'PENDIENTE',
      nota: d.nota ?? '',
      id_producto: d.id_producto,
      nombre: d.Producto?.Nombre ?? `Producto ${d.id_producto}`,
      cantidad: Number(d.Cantidad),
      precio_unitario: Number(d.Precio_unitario ?? 0),
      subtotal: round2(Number(d.Cantidad) * Number(d.Precio_unitario ?? 0)),
    })),
    ...totales,
  };
}
