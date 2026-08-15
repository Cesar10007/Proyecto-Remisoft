import prisma from '../config/db.js';
export async function index(req, res, next) {
  try { const { id_usuario, fecha_desde, fecha_hasta } = req.query; const where = {}; if (id_usuario) where.id_usuario = parseInt(id_usuario); if (fecha_desde || fecha_hasta) { where.fecha = {}; if (fecha_desde) where.fecha.gte = new Date(fecha_desde); if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta); } const items = await prisma.log_actividad.findMany({ where, include: { usuarios: true }, orderBy: { fecha: 'desc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { id_usuario, accion, tabla, id_registro, descripcion } = req.body; if (!accion) return res.status(400).json({ success: false, message: 'Accin requerida', code: 'MISSING_ACCION' }); const item = await prisma.log_actividad.create({ data: { id_usuario: id_usuario ? parseInt(id_usuario) : null, accion, tabla: tabla || null, id_registro: id_registro ? parseInt(id_registro) : null, descripcion: descripcion || null, fecha: new Date() } }); res.status(201).json({ success: true, message: 'Creado', data: item }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.log_actividad.findUnique({ where: { id_log: parseInt(id) }, include: { usuarios: true } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { descripcion } = req.body; const item = await prisma.log_actividad.update({ where: { id_log: parseInt(id) }, data: { descripcion: descripcion !== undefined ? descripcion : undefined } }); res.status(200).json({ success: true, message: 'Actualizado', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.log_actividad.delete({ where: { id_log: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminado' }); }
  catch (error) { next(error); }
}
