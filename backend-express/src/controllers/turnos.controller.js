import prisma from '../config/db.js';

export async function index(req, res, next) {
  try {
    const turnos = await prisma.turnos.findMany({ include: { usuarios: true }, orderBy: { fecha_inicio: 'desc' } });
    res.status(200).json({ success: true, data: turnos, count: turnos.length });
  } catch (error) { next(error); }
}

export async function show(req, res, next) {
  try {
    const { id } = req.params;
    const turno = await prisma.turnos.findUnique({ where: { id_turno: parseInt(id) }, include: { usuarios: true } });
    if (!turno) return res.status(404).json({ success: false, message: 'No encontrado', code: 'NOT_FOUND' });
    res.status(200).json({ success: true, data: turno });
  } catch (error) { next(error); }
}

export async function store(req, res, next) {
  try {
    const { id_usuario, fecha_inicio, fecha_fin, estado } = req.body;
    if (!id_usuario) return res.status(400).json({ success: false, message: 'Usuario requerido', code: 'MISSING_USER' });
    const turno = await prisma.turnos.create({
      data: { id_usuario: parseInt(id_usuario), fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : new Date(), fecha_fin: fecha_fin ? new Date(fecha_fin) : null, estado: estado || 'abierto' },
      include: { usuarios: true }
    });
    res.status(201).json({ success: true, message: 'Turno creado', data: turno });
  } catch (error) { next(error); }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { fecha_fin, estado } = req.body;
    const turno = await prisma.turnos.update({
      where: { id_turno: parseInt(id) },
      data: { fecha_fin: fecha_fin ? new Date(fecha_fin) : undefined, estado: estado || undefined },
      include: { usuarios: true }
    });
    res.status(200).json({ success: true, message: 'Actualizado', data: turno });
  } catch (error) { next(error); }
}

export async function destroy(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.turnos.delete({ where: { id_turno: parseInt(id) } });
    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) { next(error); }
}
