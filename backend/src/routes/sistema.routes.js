import { Router } from 'express';
import prisma from '../config/prisma.js';
import { requireRole } from '../middleware/requireRole.js';
import { escritura } from '../services/actividad.service.js';
import { pendientesDeCierre, SistemaCerrado } from '../services/sistema.service.js';
import { ErrorSalon } from '../utils/salon.js';

const router = Router();
const ruta = fn => (req, res, next) => fn(req, res).catch(next);
const campos = { sistema_abierto: true, version_sistema: true };
const leer = (tx, id) => tx.restaurante.findUniqueOrThrow({ where: { id_restaurante: id }, select: campos });
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); return req.sede.id_restaurante ? next() : res.status(422).json({ message: 'Selecciona un establecimiento.' }); });
router.get('/', ruta(async (req, res) => res.json(await leer(prisma, req.sede.id_restaurante))));
router.use(requireRole('GERENTE'));
router.get('/revision', ruta(async (req, res) => {
  const id = req.sede.id_restaurante;
  res.json(await prisma.$transaction(async tx => ({ ...await leer(tx, id), pendientes: await pendientesDeCierre(tx, id) }), { isolationLevel: 'RepeatableRead' }));
}));
for (const abrir of [false, true]) {
  router.post(abrir ? '/abrir' : '/cerrar', ruta(async (req, res) => {
    const id = req.sede.id_restaurante, version = req.body?.version_sistema;
    if (!Number.isInteger(version) || version < 0) throw new ErrorSalon(422, 'Revisa el estado actual del sistema antes de confirmar.');
    const resultado = await escritura(req.user, async tx => {
      const [{ version_sistema, sistema_abierto }] = await tx.$queryRaw`SELECT sistema_abierto,version_sistema FROM restaurante WHERE id_restaurante=${id} FOR UPDATE`;
      if (Boolean(Number(sistema_abierto)) === abrir || version_sistema !== version) throw new ErrorSalon(409, 'El estado del sistema cambió. Actualiza la revisión.');
      const pendientes = abrir ? [] : await pendientesDeCierre(tx, id);
      if (pendientes.length) return { pendientes };
      return tx.restaurante.update({ where: { id_restaurante: id }, data: { sistema_abierto: abrir, version_sistema: { increment: 1 } }, select: campos });
    }, { permiteSedeCerrada: true, isolationLevel: 'ReadCommitted' });
    if (resultado.pendientes) return res.status(409).json({ message: 'Hay pendientes. Resuélvelos antes del cierre total.', ...resultado });
    res.json({ ...resultado, message: abrir ? 'Sistema abierto.' : 'cierre de sistema exitoso' });
  }));
}

// También se aplica a personal y solicitudes, no solo a los controladores operativos.
export async function bloquearSistemaCerrado(req, res, next) {
  try {
    if (req.user.id_restaurante && !(await leer(prisma, req.user.id_restaurante)).sistema_abierto) throw new SistemaCerrado();
    next();
  } catch (err) { next(err); }
}
export default router;
