import prisma from '../config/prisma.js';
import {
  alcanceFacturacion,
  generarFactura,
  editarFactura,
  lineasDeFactura,
} from '../services/facturacion.service.js';
import { consumoFacturado, esBorrador } from '../utils/facturacion.js';
import { conPago, entero, ErrorSalon } from '../utils/salon.js';
import { registrarAuditoria } from '../utils/auditoria.js';

function presentar(f) {
  const pagada = conPago(f);
  return { ...f, pagada, editable: !pagada && esBorrador(f) };
}
const alcance = (req) => ({ pedido: alcanceFacturacion(req.user) });
const idFactura = (req) => entero(Number(req.params.id), 'La factura');

export async function index(req, res, next) {
  try {
    const facturas = await prisma.factura.findMany({
      where: alcance(req),
      orderBy: { id_factura: 'desc' },
      include: { pedido: true, pago: true },
    });
    res.json({ success: true, data: facturas.map(presentar), count: facturas.length });
  } catch (err) {
    next(err);
  }
}
export async function show(req, res, next) {
  try {
    const f = await prisma.factura.findFirst({
      where: { id_factura: idFactura(req), ...alcance(req) },
      include: {
        pedido: true,
        pago: { select: { metodo: true, monto: true, estado: true, fecha_pago: true } },
        Factura_item: lineasDeFactura,
      },
    });
    if (!f) throw new ErrorSalon(404, 'Factura no encontrada.');
    const items = consumoFacturado(f);
    // Los consumidores antiguos del detalle también ven el precio y nombre históricos.
    const Factura_item = items.map((i) => ({
      id_factura: f.id_factura,
      id_detalle_pedido: i.id_detalle,
      cantidad_facturada: i.cantidad,
      nombre_producto: i.nombre,
      precio_unitario: i.precio_unitario,
      Detalle_pedido: {
        id_pedido: f.id_pedido,
        Precio_unitario: i.precio_unitario,
        Producto: { Nombre: i.nombre },
      },
    }));
    res.json({ success: true, data: { ...presentar(f), Factura_item, items } });
  } catch (err) {
    next(err);
  }
}
function registrada(req, res, f, creada) {
  registrarAuditoria({
    evento: creada ? 'FACTURA_GENERADA' : 'FACTURA_EDITADA',
    id_usuario: req.user.id_usuario,
    extra: { id_factura: f.id_factura, id_pedido: f.id_pedido, version: f.version_edicion },
  });
  res.status(creada ? 201 : 200).json({ success: true, data: f });
}
export async function store(req, res, next) {
  try {
    registrada(req, res, await generarFactura(req.user, req.body), true);
  } catch (err) {
    next(err);
  }
}
export async function update(req, res, next) {
  try {
    registrada(req, res, await editarFactura(req.user, idFactura(req), req.body), false);
  } catch (err) {
    next(err);
  }
}
export async function destroy(req, res, next) {
  try {
    const f = await prisma.factura.findFirst({
      where: { id_factura: idFactura(req), ...alcance(req) },
      select: { id_factura: true },
    });
    if (!f) throw new ErrorSalon(404, 'Factura no encontrada.');
    throw new ErrorSalon(409, 'Las facturas se conservan en el historial. No se permite eliminarlas.');
  } catch (err) {
    next(err);
  }
}
