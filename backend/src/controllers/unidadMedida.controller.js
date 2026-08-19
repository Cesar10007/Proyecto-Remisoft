import prisma from '../config/db.js';

export async function index(req, res, next) {
  try {
    const unidades = await prisma.unidad_medida.findMany({ orderBy: { nombre: 'asc' } });
    res.status(200).json({ success: true, data: unidades, count: unidades.length });
  } catch (error) { next(error); }
}

export async function show(req, res, next) {
  try {
    const { id } = req.params;
    const unidad = await prisma.unidad_medida.findUnique({ where: { id_unidad_medida: parseInt(id) } });
    if (!unidad) return res.status(404).json({ success: false, message: 'No encontrada', code: 'NOT_FOUND' });
    res.status(200).json({ success: true, data: unidad });
  } catch (error) { next(error); }
}

export async function store(req, res, next) {
  try {
    const { nombre, abreviatura, factor_conversion } = req.body;
    if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido', code: 'MISSING_NAME' });
    const unidad = await prisma.unidad_medida.create({ data: { nombre, abreviatura: abreviatura || null, factor_conversion: factor_conversion ? parseFloat(factor_conversion) : 1 } });
    res.status(201).json({ success: true, message: 'Creada', data: unidad });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, abreviatura, factor_conversion } = req.body;
    const unidad = await prisma.unidad_medida.update({ where: { id_unidad_medida: parseInt(id) }, data: { nombre: nombre || undefined, abreviatura: abreviatura !== undefined ? abreviatura : undefined, factor_conversion: factor_conversion !== undefined ? parseFloat(factor_conversion) : undefined } });
    res.status(200).json({ success: true, message: 'Actualizada', data: unidad });
  } catch (error) { next(error); }
}

export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.unidad_medida.delete({ where: { id_unidad_medida: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Eliminada' });
  } catch (error) { next(error); }
}
