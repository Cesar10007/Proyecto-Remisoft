import { escritura } from '../services/actividad.service.js';
import { entero, ErrorSalon } from '../utils/salon.js';
import prisma from '../config/prisma.js';

function estadoValido(estado) {
  if (!['ACTIVA', 'INACTIVA'].includes(estado)) throw new ErrorSalon(422, 'El estado debe ser ACTIVA o INACTIVA.');
  return estado;
}
function nombreValido(nombre) {
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.trim().length > 40) throw new ErrorSalon(422, 'El nombre es obligatorio (máximo 40 caracteres).');
  return nombre.trim();
}
export async function index(req, res, next) {
  try {
    const estado = req.query.estado === undefined ? {} : { estado: estadoValido(req.query.estado) };
    const cajas = await prisma.caja.findMany({ where: { ...req.sede, ...estado }, orderBy: { id_caja: 'asc' },
      include: { turno_caja: { where: { ...req.sede, estado: 'ABIERTA' }, select: { id_turno: true, id_restaurante: true }, orderBy: { id_turno: 'desc' } } } });
    res.json(cajas.map(({ turno_caja, ...caja }) => ({ ...caja, turno_activo: turno_caja.find(t => t.id_restaurante === caja.id_restaurante)?.id_turno ?? null })));
  } catch (err) { next(err); }
}
export async function crear(req, res, next) {
  try {
    const nombre = nombreValido(req.body.nombre), estado = estadoValido(req.body.estado ?? 'ACTIVA');
    await escritura(req.user, tx => tx.caja.create({ data: { ...req.sede, nombre, estado } }));
    res.status(201).json({ message: 'Caja creada' });
  } catch (err) { next(err); }
}

// Mismo bloqueo que la apertura de turno: una caja no queda inactiva con un turno en curso.
async function guardarCaja(req, datos) {
  const id = entero(Number(req.params.id), 'La caja');
  return escritura(req.user, async tx => {
    const [caja] = await tx.$queryRaw`SELECT id_caja FROM caja WHERE id_caja=${id} AND id_restaurante=${req.sede.id_restaurante} FOR UPDATE`;
    if (!caja) throw new ErrorSalon(404, 'Caja no encontrada.');
    if (datos.estado === 'INACTIVA' && await tx.turno_caja.count({ where: { ...req.sede, id_caja: id, estado: 'ABIERTA' } })) throw new ErrorSalon(409, 'Cierra primero el turno activo de esta caja.');
    return tx.caja.update({ where: { ...req.sede, id_caja: id }, data: datos });
  });
}
export async function actualizar(req, res, next) {
  try {
    const datos = { nombre: nombreValido(req.body.nombre) };
    if (req.body.estado !== undefined) datos.estado = estadoValido(req.body.estado);
    res.json(await guardarCaja(req, datos));
  } catch (err) { next(err); }
}
export async function cambiarEstado(req, res, next) {
  try {
    const estado = req.method === 'DELETE' ? 'INACTIVA' : estadoValido(req.body.estado);
    res.json(await guardarCaja(req, { estado }));
  } catch (err) { next(err); }
}
