import prisma from '../config/prisma.js';
export async function index(req, res, next) {
  try { const items = await prisma.tipo_usuario.findMany({ orderBy: { nombre: 'asc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { nombre, descripcion } = req.body; if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido', code: 'MISSING_NAME' }); const item = await prisma.tipo_usuario.create({ data: { nombre, descripcion: descripcion || null } }); res.status(201).json({ success: true, message: 'Creado', data: item }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.tipo_usuario.findUnique({ where: { id_tipo_usuario: parseInt(id) } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { nombre, descripcion } = req.body; const item = await prisma.tipo_usuario.update({ where: { id_tipo_usuario: parseInt(id) }, data: { nombre: nombre || undefined, descripcion: descripcion !== undefined ? descripcion : undefined } }); res.status(200).json({ success: true, message: 'Actualizado', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.tipo_usuario.delete({ where: { id_tipo_usuario: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminado' }); }
  catch (error) { next(error); }
}
