import prisma from '../config/prisma.js';
export async function index(req, res, next) {
  try { const items = await prisma.compra.findMany({ include: { proveedores: true }, orderBy: { fecha: 'desc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.compra.findUnique({ where: { id_compra: parseInt(id) }, include: { proveedores: true, detalle_compra: true } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrada', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { id_proveedor, fecha, total } = req.body; if (!id_proveedor) return res.status(400).json({ success: false, message: 'Proveedor requerido', code: 'MISSING_PROVEEDOR' }); const item = await prisma.compra.create({ data: { id_proveedor: parseInt(id_proveedor), fecha: fecha ? new Date(fecha) : new Date(), total: total ? parseFloat(total) : 0 } }); res.status(201).json({ success: true, message: 'Creada', data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { fecha, total } = req.body; const item = await prisma.compra.update({ where: { id_compra: parseInt(id) }, data: { fecha: fecha ? new Date(fecha) : undefined, total: total !== undefined ? parseFloat(total) : undefined } }); res.status(200).json({ success: true, message: 'Actualizada', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.compra.delete({ where: { id_compra: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminada' }); }
  catch (error) { next(error); }
}
