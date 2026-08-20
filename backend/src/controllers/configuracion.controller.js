import prisma from '../config/prisma.js';
export async function index(req, res, next) {
  try { const items = await prisma.configuracion.findMany({ orderBy: { clave: 'asc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { clave, valor, descripcion } = req.body; if (!clave) return res.status(400).json({ success: false, message: 'Clave requerida', code: 'MISSING_CLAVE' }); const item = await prisma.configuracion.create({ data: { clave, valor: valor || null, descripcion: descripcion || null } }); res.status(201).json({ success: true, message: 'Creada', data: item }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.configuracion.findUnique({ where: { id_configuracion: parseInt(id) } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrada', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { valor, descripcion } = req.body; const item = await prisma.configuracion.update({ where: { id_configuracion: parseInt(id) }, data: { valor: valor !== undefined ? valor : undefined, descripcion: descripcion !== undefined ? descripcion : undefined } }); res.status(200).json({ success: true, message: 'Actualizada', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.configuracion.delete({ where: { id_configuracion: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminada' }); }
  catch (error) { next(error); }
}
export async function getByKey(req, res, next) {
  try { const { clave } = req.params; const item = await prisma.configuracion.findFirst({ where: { clave } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrada', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
