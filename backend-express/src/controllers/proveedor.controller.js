import prisma from '../config/db.js';

// GET /api/proveedores
export async function index(req, res, next) {
  try {
    const proveedores = await prisma.proveedor.findMany();
    res.json(proveedores);
  } catch (err) {
    next(err);
  }
}

// GET /api/proveedores/:id
export async function show(req, res, next) {
  const { id } = req.params;
  try {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id_proveedor: parseInt(id) },
    });
    if (!proveedor) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json(proveedor);
  } catch (err) {
    next(err);
  }
}

// POST /api/proveedores
export async function store(req, res, next) {
  try {
    const nuevoProveedor = await prisma.proveedor.create({
      data: req.body,
    });
    res.status(201).json(nuevoProveedor);
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(400).json({ message: 'Referencia invalida al crear el proveedor' });
    }
    next(err);
  }
}

// PUT /api/proveedores/:id
export async function update(req, res, next) {
  const { id } = req.params;
  try {
    const proveedorActualizado = await prisma.proveedor.update({
      where: { id_proveedor: parseInt(id) },
      data: req.body,
    });
    res.json(proveedorActualizado);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Proveedor no encontrado para actualizar' });
    }
    next(err);
  }
}

// DELETE /api/proveedores/:id
export async function destroy(req, res, next) {
  const { id } = req.params;
  try {
    await prisma.proveedor.delete({
      where: { id_proveedor: parseInt(id) },
    });
    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    if (err.code === 'P2003') {
      return res.status(409).json({ message: 'No se puede eliminar: el proveedor tiene registros asociados' });
    }
    next(err);
  }
}