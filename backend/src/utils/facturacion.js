import { ErrorSalon, IVA_TASA, ivaEnCentavos } from './salon.js';

// Un documento antiguo sin importes no se convierte implícitamente en un cobro de cero pesos.
export const esBorrador = (f) => f?.estado === 'PENDIENTE' && f.tasa_iva != null && f.total != null;

// La factura conserva cantidades, nombres y precios: cambiar la carta después de cobrar no altera un comprobante.
export function consumoFacturado(f) {
  return f.Factura_item.filter((i) => i.Detalle_pedido.id_pedido === f.id_pedido).map((i) => ({
    id_detalle: i.id_detalle_pedido,
    cantidad: Number(i.cantidad_facturada),
    nombre: i.nombre_producto ?? i.Detalle_pedido.Producto?.Nombre ?? 'Producto sin nombre',
    precio_unitario: Number(i.precio_unitario ?? i.Detalle_pedido.Precio_unitario ?? 0),
  }));
}
const MAX_CENTAVOS = 9999999999; // DECIMAL(10,2)
function centavos(valor, campo) {
  if (!['string', 'number'].includes(typeof valor) || !/^\d+(\.\d{1,2})?$/.test(String(valor)))
    throw new ErrorSalon(422, `${campo}: usa un importe no negativo con máximo dos decimales.`);
  const n = Math.round(Number(valor) * 100);
  if (n > MAX_CENTAVOS) throw new ErrorSalon(422, `${campo} excede el importe máximo.`);
  return n;
}
export function importesFactura(items, descuento = 0, propina = 0, tasa = IVA_TASA) {
  if (!items.length) throw new ErrorSalon(422, 'No se puede facturar un pedido sin artículos.');
  const sub = items.reduce((n, i) => {
    if (!Number.isInteger(i.cantidad) || i.cantidad < 1)
      throw new ErrorSalon(422, 'Hay un renglón sin cantidad facturable.');
    return n + i.cantidad * centavos(i.precio_unitario, 'Precio unitario');
  }, 0);
  const d = centavos(descuento, 'Descuento'),
    p = centavos(propina, 'Propina');
  if (d > sub) throw new ErrorSalon(422, 'El descuento no puede superar el subtotal del consumo.');
  if (!Number.isFinite(tasa) || tasa < 0 || tasa > 1)
    throw new ErrorSalon(422, 'La tasa de IVA no es válida.');
  const iva = ivaEnCentavos(sub - d, tasa),
    total = sub - d + iva + p;
  if (sub > MAX_CENTAVOS || total > MAX_CENTAVOS)
    throw new ErrorSalon(422, 'El importe de la factura excede el máximo permitido.');
  return { Descuento: d / 100, Propina: p / 100, IVA: iva / 100, total: total / 100 };
}
