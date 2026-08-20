import prisma from '../config/prisma.js';
export async function index(req, res, next) {
  try { const items = await prisma.plantilla_email.findMany({ orderBy: { nombre: 'asc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { nombre, asunto, cuerpo, tipo } = req.body; if (!nombre || !cuerpo) return res.status(400).json({ success: false, message: 'Nombre y cuerpo requeridos', code: 'MISSING_FIELDS' }); const item = await prisma.plantilla_email.create({ data: { nombre, asunto: asunto || null, cuerpo, tipo: tipo || 'general' } }); res.status(201).json({ success: true, message: 'Creada', data: item }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.plantilla_email.findUnique({ where: { id_plantilla: parseInt(id) } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrada', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { asunto, cuerpo } = req.body; const item = await prisma.plantilla_email.update({ where: { id_plantilla: parseInt(id) }, data: { asunto: asunto !== undefined ? asunto : undefined, cuerpo: cuerpo !== undefined ? cuerpo : undefined } }); res.status(200).json({ success: true, message: 'Actualizada', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.plantilla_email.delete({ where: { id_plantilla: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminada' }); }
  catch (error) { next(error); }
}
