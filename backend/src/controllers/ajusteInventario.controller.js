import prisma from '../config/prisma.js';
export async function index(req, res, next) {
  try { const { id_ingrediente } = req.query; const where = id_ingrediente ? { id_ingrediente: parseInt(id_ingrediente) } : {}; const items = await prisma.ajuste_inventario.findMany({ where, include: { ingredientes: true, usuarios: true }, orderBy: { fecha: 'desc' } }); res.status(200).json({ success: true, data: items, count: items.length }); }
  catch (error) { next(error); }
}
export async function show(req, res, next) {
  try { const { id } = req.params; const item = await prisma.ajuste_inventario.findUnique({ where: { id_ajuste: parseInt(id) }, include: { ingredientes: true, usuarios: true } }); if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' }); res.status(200).json({ success: true, data: item }); }
  catch (error) { next(error); }
}
export async function store(req, res, next) {
  try { const { id_ingrediente, id_usuario, cantidad, tipo, razon } = req.body; if (!id_ingrediente || !cantidad || !tipo) return res.status(400).json({ success: false, message: 'Campos requeridos', code: 'MISSING_FIELDS' }); const item = await prisma.ajuste_inventario.create({ data: { id_ingrediente: parseInt(id_ingrediente), id_usuario: id_usuario ? parseInt(id_usuario) : null, cantidad: parseFloat(cantidad), tipo, razon: razon || null, fecha: new Date() } }); res.status(201).json({ success: true, message: 'Creado', data: item }); }
  catch (error) { next(error); }
}
export async function update(req, res, next) {
  try { const { id } = req.params; const { razon } = req.body; const item = await prisma.ajuste_inventario.update({ where: { id_ajuste: parseInt(id) }, data: { razon: razon !== undefined ? razon : undefined } }); res.status(200).json({ success: true, message: 'Actualizado', data: item }); }
  catch (error) { next(error); }
}
export async function destroy(req, res, next) {
  try { const { id } = req.params; await prisma.ajuste_inventario.delete({ where: { id_ajuste: parseInt(id) } }); res.status(200).json({ success: true, message: 'Eliminado' }); }
  catch (error) { next(error); }
}
