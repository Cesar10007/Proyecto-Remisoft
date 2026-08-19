import prisma from '../config/db.js';
export async function index(req, res, next) {
  try { const { fecha_desde, fecha_hasta } = req.query; const where = {}; if (fecha_desde || fecha_hasta) { where.fecha = {}; if (fecha_desde) where.fecha.gte = new Date(fecha_desde); if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta); } const items = await prisma.gasto.findMany({ where, orderBy: { fecha: 'desc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.gasto.findUnique({ where: { id_gasto: parseInt(id) } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { descripcion, monto, fecha, tipo } = req.body; if (!descripcion || !monto) return res.status(400).json({ success: false, message: 'Descripcin y monto requeridos', code: 'MISSING_FIELDS' }); const item = await prisma.gasto.create({ data: { descripcion, monto: parseFloat(monto), fecha: fecha ? new Date(fecha) : new Date(), tipo: tipo || 'operativo' } }); res.status(201).json({ success: true, message: 'Creado', data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { descripcion, monto, fecha, tipo } = req.body; const item = await prisma.gasto.update({ where: { id_gasto: parseInt(id) }, data: { descripcion: descripcion || undefined, monto: monto !== undefined ? parseFloat(monto) : undefined, fecha: fecha ? new Date(fecha) : undefined, tipo: tipo || undefined } }); res.status(200).json({ success: true, message: 'Actualizado', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.gasto.delete({ where: { id_gasto: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminado' }); }
  catch (error) { next(error); }
}
