import prisma from '../config/db.js';

export async function index(req, res, next) {
  try {
    const cajas = await prisma.caja.findMany();
    res.json(cajas);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const { nombre, estado } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 40) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 40 caracteres)' });
    }
    if (estado && (typeof estado !== 'string' || estado.length > 20)) {
      return res.status(422).json({ message: 'El campo estado no puede superar 20 caracteres' });
    }

    await prisma.caja.create({
      data: { nombre, estado: estado || 'ACTIVA' },
    });

    res.status(201).json({ message: 'Caja creada' });
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, estado } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 40) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 40 caracteres)' });
    }
    if (estado && (typeof estado !== 'string' || estado.length > 20)) {
      return res.status(422).json({ message: 'El campo estado no puede superar 20 caracteres' });
    }

    await prisma.caja.update({
      where: { id_caja: Number(id) },
      data: { nombre, estado: estado || 'ACTIVA' },
    });

    res.json({ message: 'Caja actualizada' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Caja no encontrada' });
    }
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.caja.update({
      where: { id_caja: Number(id) },
      data: { estado: 'INACTIVA' },
    });
    res.json({ message: 'Caja desactivada' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Caja no encontrada' });
    }
    next(err);
  }
}
