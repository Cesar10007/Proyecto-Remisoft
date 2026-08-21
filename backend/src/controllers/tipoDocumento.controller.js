import prisma from '../config/prisma.js';

export async function index(req, res, next) {
  try {
    const tipos = await prisma.tipo_documento.findMany({ orderBy: { nombre: 'asc' } });
    res.status(200).json({ success: true, data: tipos, count: tipos.length });
  } catch (error) { next(error); }
}

export async function show(req, res, next) {
  try {
    const { id } = req.params;
    const tipo = await prisma.tipo_documento.findUnique({ where: { id_tipo_documento: parseInt(id) } });
    if (!tipo) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' });
    res.status(200).json({ success: true, data: tipo });
  } catch (error) { next(error); }
}

export async function store(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido', code: 'MISSING_NAME' });
    const tipo = await prisma.tipo_documento.create({ data: { nombre, descripcion: descripcion || null } });
    res.status(201).json({ success: true, message: 'Creado', data: tipo });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const tipo = await prisma.tipo_documento.update({ where: { id_tipo_documento: parseInt(id) }, data: { nombre: nombre || undefined, descripcion: descripcion !== undefined ? descripcion : undefined } });
    res.status(200).json({ success: true, message: 'Actualizado', data: tipo });
  } catch (error) { next(error); }
}

export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.tipo_documento.delete({ where: { id_tipo_documento: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) { next(error); }
}
