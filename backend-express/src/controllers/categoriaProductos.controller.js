import prisma from '../config/db.js';

export async function index(req, res, next) {
  try {
    const categorias = await prisma.categoria_productos.findMany({ orderBy: { nombre: 'asc' } });
    res.status(200).json({ success: true, data: categorias, count: categorias.length });
  } catch (error) { next(error); }
}

export async function show(req, res, next) {
  try {
    const { id } = req.params;
    const categoria = await prisma.categoria_productos.findUnique({ where: { id_categoria: parseInt(id) } });
    if (!categoria) return res.status(404).json({ success: false, message: 'No encontrada', code: 'NOT_FOUND' });
    res.status(200).json({ success: true, data: categoria });
  } catch (error) { next(error); }
}

export async function store(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido', code: 'MISSING_NAME' });
    const categoria = await prisma.categoria_productos.create({ data: { nombre, descripcion: descripcion || null } });
    res.status(201).json({ success: true, message: 'Creada', data: categoria });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const categoria = await prisma.categoria_productos.update({
      where: { id_categoria: parseInt(id) },
      data: { nombre: nombre || undefined, descripcion: descripcion !== undefined ? descripcion : undefined }
    });
    res.status(200).json({ success: true, message: 'Actualizada', data: categoria });
  } catch (error) { next(error); }
}

export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.categoria_productos.delete({ where: { id_categoria: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Eliminada' });
  } catch (error) { next(error); }
}
