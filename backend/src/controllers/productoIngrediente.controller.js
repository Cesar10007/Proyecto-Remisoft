import prisma from '../config/prisma.js';

export async function index(req, res, next) {
  try {
    const items = await prisma.producto_ingrediente.findMany({
      include: { productos: true, ingredientes: true },
      orderBy: { id_producto: 'asc' }
    });
    res.status(200).json({ success: true, data: items, count: items.length });
  } catch (error) { next(error); }
}

export async function show(req, res, next) {
  try {
    const { id } = req.params;
    const item = await prisma.producto_ingrediente.findUnique({
      where: { id: parseInt(id) },
      include: { productos: true, ingredientes: true }
    });
    if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' });
    res.status(200).json({ success: true, data: item });
  } catch (error) { next(error); }
}

export async function store(req, res, next) {
  try {
    const { id_producto, id_ingrediente, cantidad, unidad_medida } = req.body;
    if (!id_producto || !id_ingrediente) {
      return res.status(400).json({ success: false, message: 'IDs requeridos', code: 'MISSING_IDS' });
    }
    const item = await prisma.producto_ingrediente.create({
      data: { id_producto: parseInt(id_producto), id_ingrediente: parseInt(id_ingrediente), cantidad: parseFloat(cantidad || 0), unidad_medida: unidad_medida || null },
      include: { productos: true, ingredientes: true }
    });
    res.status(201).json({ success: true, message: 'Creado exitosamente', data: item });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { cantidad, unidad_medida } = req.body;
    const item = await prisma.producto_ingrediente.update({
      where: { id: parseInt(id) },
      data: { cantidad: cantidad !== undefined ? parseFloat(cantidad) : undefined, unidad_medida: unidad_medida !== undefined ? unidad_medida : undefined },
      include: { productos: true, ingredientes: true }
    });
    res.status(200).json({ success: true, message: 'Actualizado', data: item });
  } catch (error) { next(error); }
}

export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.producto_ingrediente.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) { next(error); }
}
