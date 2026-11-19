import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { esperarCambio } from '../services/actividad.service.js';
import prisma from '../config/prisma.js';
import { entero } from '../utils/salon.js';

const router = Router();
router.use(requireRole('GERENTE', 'SUPERADMIN'));
router.use((req, res, next) => req.sede.id_restaurante ? next() : res.status(422).json({ message: 'Selecciona un establecimiento para consultar su historial.' }));
router.get('/cambios', esperarCambio);
router.get('/', async (req, res, next) => {
  try {
    const antes = req.query.antes === undefined ? null : entero(Number(req.query.antes), 'El cursor');
    const filas = await prisma.actividad_sede.findMany({ where: { ...req.sede, ...(antes && { id_evento: { lt: antes } }) },
      orderBy: { id_evento: 'desc' }, take: 51 });
    const data = filas.slice(0, 50);
    res.set('Cache-Control', 'no-store').json({ data, siguiente: filas.length > 50 ? data.at(-1).id_evento : null });
  } catch (err) { next(err); }
});
export default router;
