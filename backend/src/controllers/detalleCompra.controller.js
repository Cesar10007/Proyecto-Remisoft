import prisma from '../config/prisma.js';
export async function index(req, res, next) {
  try { const { id_compra } = req.query; const where = id_compra ? { id_compra: parseInt(id_compra) } : {}; const items = await prisma.detalle_compra.findMany({ where, include: { compras: true, ingredientes: true } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.detalle_compra.findUnique({ where: { id: parseInt(id) }, include: { compras: true, ingredientes: true } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { id_compra, id_ingrediente, cantidad, costo_unitario } = req.body; if (!id_compra || !id_ingrediente) return res.status(400).json({ success: false, message: 'IDs requeridos', code: 'MISSING_IDS' }); const item = await prisma.detalle_compra.create({ data: { id_compra: parseInt(id_compra), id_ingrediente: parseInt(id_ingrediente), cantidad: parseFloat(cantidad || 0), costo_unitario: costo_unitario ? parseFloat(costo_unitario) : 0 } }); res.status(201).json({ success: true, message: 'Creado', data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { cantidad, costo_unitario } = req.body; const item = await prisma.detalle_compra.update({ where: { id: parseInt(id) }, data: { cantidad: cantidad !== undefined ? parseFloat(cantidad) : undefined, costo_unitario: costo_unitario !== undefined ? parseFloat(costo_unitario) : undefined } }); res.status(200).json({ success: true, message: 'Actualizado', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.detalle_compra.delete({ where: { id: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminado' }); }
  catch (error) { next(error); }
}
