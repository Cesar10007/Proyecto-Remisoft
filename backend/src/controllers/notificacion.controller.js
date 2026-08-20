import prisma from '../config/prisma.js';
export async function index(req, res, next) {
  try { const { id_usuario, leida } = req.query; const where = {}; if (id_usuario) where.id_usuario = parseInt(id_usuario); if (leida !== undefined) where.leida = leida === 'true'; const items = await prisma.notificacion.findMany({ where, include: { usuarios: true }, orderBy: { fecha: 'desc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { id_usuario, titulo, mensaje, tipo } = req.body; if (!id_usuario || !mensaje) return res.status(400).json({ success: false, message: 'Usuario y mensaje requeridos', code: 'MISSING_FIELDS' }); const item = await prisma.notificacion.create({ data: { id_usuario: parseInt(id_usuario), titulo: titulo || null, mensaje, tipo: tipo || 'info', leida: false, fecha: new Date() } }); res.status(201).json({ success: true, message: 'Creada', data: item }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.notificacion.findUnique({ where: { id_notificacion: parseInt(id) }, include: { usuarios: true } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrada', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { leida, titulo, mensaje } = req.body; const item = await prisma.notificacion.update({ where: { id_notificacion: parseInt(id) }, data: { leida: leida !== undefined ? leida : undefined, titulo: titulo !== undefined ? titulo : undefined, mensaje: mensaje !== undefined ? mensaje : undefined } }); res.status(200).json({ success: true, message: 'Actualizada', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.notificacion.delete({ where: { id_notificacion: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminada' }); }
  catch (error) { next(error); }
}
