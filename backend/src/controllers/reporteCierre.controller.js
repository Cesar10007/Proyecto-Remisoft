import prisma from '../config/prisma.js';
export async function index(req, res, next) {
  try { const { id_turno, fecha_desde, fecha_hasta } = req.query; const where = {}; if (id_turno) where.id_turno = parseInt(id_turno); if (fecha_desde || fecha_hasta) { where.fecha = {}; if (fecha_desde) where.fecha.gte = new Date(fecha_desde); if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta); } const items = await prisma.reporte_cierre.findMany({ where, include: { turnos: true, usuarios: true }, orderBy: { fecha: 'desc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { id_turno, id_usuario, total_ventas, total_gastos, observaciones } = req.body; if (!id_turno) return res.status(400).json({ success: false, message: 'Turno requerido', code: 'MISSING_TURNO' }); const item = await prisma.reporte_cierre.create({ data: { id_turno: parseInt(id_turno), id_usuario: id_usuario ? parseInt(id_usuario) : null, total_ventas: total_ventas ? parseFloat(total_ventas) : 0, total_gastos: total_gastos ? parseFloat(total_gastos) : 0, observaciones: observaciones || null, fecha: new Date() } }); res.status(201).json({ success: true, message: 'Creado', data: item }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.reporte_cierre.findUnique({ where: { id_reporte: parseInt(id) }, include: { turnos: true, usuarios: true } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { observaciones } = req.body; const item = await prisma.reporte_cierre.update({ where: { id_reporte: parseInt(id) }, data: { observaciones: observaciones !== undefined ? observaciones : undefined } }); res.status(200).json({ success: true, message: 'Actualizado', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.reporte_cierre.delete({ where: { id_reporte: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminado' }); }
  catch (error) { next(error); }
}
