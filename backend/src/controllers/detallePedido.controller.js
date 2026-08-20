import prisma from '../config/prisma.js';

export async function index(req, res, next) {
  try {
    const { id_pedido } = req.query;
    const where = id_pedido ? { id_pedido: parseInt(id_pedido) } : {};
    const items = await prisma.detalle_pedido.findMany({ where, include: { pedidos: true, productos: true } });
    res.status(200).json({ success: true, data: items, count: items.length });
  } catch (error) { next(error); }
}

export async function show(req, res, next) {
  try {
    const { id } = req.params;
    const item = await prisma.detalle_pedido.findUnique({ where: { id: parseInt(id) }, include: { pedidos: true, productos: true } });
    if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' });
    res.status(200).json({ success: true, data: item });
  } catch (error) { next(error); }
}

export async function store(req, res, next) {
  try {
    const { id_pedido, id_producto, cantidad, precio_unitario, subtotal } = req.body;
    if (!id_pedido || !id_producto) return res.status(400).json({ success: false, message: 'IDs requeridos', code: 'MISSING_IDS' });
    const item = await prisma.detalle_pedido.create({
      data: { id_pedido: parseInt(id_pedido), id_producto: parseInt(id_producto), cantidad: parseFloat(cantidad || 0), precio_unitario: precio_unitario ? parseFloat(precio_unitario) : 0, subtotal: subtotal ? parseFloat(subtotal) : 0 },
      include: { pedidos: true, productos: true }
    });
    res.status(201).json({ success: true, message: 'Creado', data: item });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { cantidad, precio_unitario, subtotal } = req.body;
    const item = await prisma.detalle_pedido.update({
      where: { id: parseInt(id) },
      data: { cantidad: cantidad !== undefined ? parseFloat(cantidad) : undefined, precio_unitario: precio_unitario !== undefined ? parseFloat(precio_unitario) : undefined, subtotal: subtotal !== undefined ? parseFloat(subtotal) : undefined }
    });
    res.status(200).json({ success: true, message: 'Actualizado', data: item });
  } catch (error) { next(error); }
}

export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.detalle_pedido.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) { next(error); }
}
