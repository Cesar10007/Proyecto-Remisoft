import prisma from '../config/db.js';

export async function index(req, res, next) {
  try {
    const items = await prisma.proveedor_ingrediente.findMany({ include: { proveedores: true, ingredientes: true } });
    res.status(200).json({ success: true, data: items, count: items.length });
  } catch (error) { next(error); }
}

export async function show(req, res, next) {
  try {
    const { id } = req.params;
    const item = await prisma.proveedor_ingrediente.findUnique({ where: { id: parseInt(id) }, include: { proveedores: true, ingredientes: true } });
    if (!item) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' });
    res.status(200).json({ success: true, data: item });
  } catch (error) { next(error); }
}

export async function store(req, res, next) {
  try {
    const { id_proveedor, id_ingrediente, precio, tiempo_entrega } = req.body;
    if (!id_proveedor || !id_ingrediente) return res.status(400).json({ success: false, message: 'IDs requeridos', code: 'MISSING_IDS' });
    const item = await prisma.proveedor_ingrediente.create({
      data: { id_proveedor: parseInt(id_proveedor), id_ingrediente: parseInt(id_ingrediente), precio: precio ? parseFloat(precio) : null, tiempo_entrega: tiempo_entrega || null },
      include: { proveedores: true, ingredientes: true }
    });
    res.status(201).json({ success: true, message: 'Creado', data: item });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { precio, tiempo_entrega } = req.body;
    const item = await prisma.proveedor_ingrediente.update({
      where: { id: parseInt(id) },
      data: { precio: precio !== undefined ? parseFloat(precio) : undefined, tiempo_entrega: tiempo_entrega !== undefined ? tiempo_entrega : undefined }
    });
    res.status(200).json({ success: true, message: 'Actualizado', data: item });
  } catch (error) { next(error); }
}

export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.proveedor_ingrediente.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) { next(error); }
}
