import prisma from '../config/prisma.js';

export async function index(req, res, next) {
  try {
    const ingredientes = await prisma.ingrediente.findMany();
    res.json(ingredientes);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const { nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 50) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 50 caracteres)' });
    }
    if (descripcion && (typeof descripcion !== 'string' || descripcion.length > 500)) {
      return res.status(422).json({ message: 'El campo descripcion no puede superar 500 caracteres' });
    }
    if (unidad_medida && (typeof unidad_medida !== 'string' || unidad_medida.length > 20)) {
      return res.status(422).json({ message: 'El campo unidad_medida no puede superar 20 caracteres' });
    }
    if (costo_unitario_ref !== undefined && costo_unitario_ref !== null && isNaN(Number(costo_unitario_ref))) {
      return res.status(422).json({ message: 'El campo costo_unitario_ref debe ser numérico' });
    }
    if (stock_minimo !== undefined && stock_minimo !== null && isNaN(Number(stock_minimo))) {
      return res.status(422).json({ message: 'El campo stock_minimo debe ser numérico' });
    }

    await prisma.ingrediente.create({
      data: {
        nombre,
        descripcion: descripcion ?? null,
        unidad_medida: unidad_medida ?? null,
        costo_unitario_ref: costo_unitario_ref ?? null,
        stock_minimo: stock_minimo ?? 0,
      },
    });

    res.status(201).json({ message: 'Ingrediente creado' });
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 50) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 50 caracteres)' });
    }
    if (descripcion && (typeof descripcion !== 'string' || descripcion.length > 500)) {
      return res.status(422).json({ message: 'El campo descripcion no puede superar 500 caracteres' });
    }
    if (unidad_medida && (typeof unidad_medida !== 'string' || unidad_medida.length > 20)) {
      return res.status(422).json({ message: 'El campo unidad_medida no puede superar 20 caracteres' });
    }
    if (costo_unitario_ref !== undefined && costo_unitario_ref !== null && isNaN(Number(costo_unitario_ref))) {
      return res.status(422).json({ message: 'El campo costo_unitario_ref debe ser numérico' });
    }
    if (stock_minimo !== undefined && stock_minimo !== null && isNaN(Number(stock_minimo))) {
      return res.status(422).json({ message: 'El campo stock_minimo debe ser numérico' });
    }

    await prisma.ingrediente.update({
      where: { id_ingrediente: Number(id) },
      data: {
        nombre,
        descripcion: descripcion ?? null,
        unidad_medida: unidad_medida ?? null,
        costo_unitario_ref: costo_unitario_ref ?? null,
        stock_minimo: stock_minimo ?? 0,
      },
    });

    res.json({ message: 'Ingrediente actualizado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.ingrediente.delete({ where: { id_ingrediente: Number(id) } });
    res.json({ message: 'Ingrediente eliminado' });
  } catch (err) {
    if (err.code === 'P2003' || err.code === 'P2014') {
      return res.status(409).json({
        message: 'No se puede eliminar: este ingrediente está en uso (inventario, recetas, órdenes de compra o lotes).',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
    next(err);
  }
}
