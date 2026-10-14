import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { index, show, store, update, destroy, cerrar, aperturas, gastos } from '../controllers/turnos.controller.js';

const router = Router();

router.use(authRequired);

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');
const escritura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');
const eliminar = requireRole('SUPERADMIN', 'GERENTE');

// Lectura para Mesero > Caja: solo datos de la apertura, sin el usuario completo.
const lecturaCaja = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO');

router.get('/', lectura, index);
router.get('/aperturas', lecturaCaja, aperturas);
router.get('/gastos', lecturaCaja, gastos);
router.get('/:id', lectura, show);
router.post('/', escritura, store);
router.post('/:id/cerrar', escritura, cerrar);
router.put('/:id', escritura, update);
router.delete('/:id', eliminar, destroy);

export default router;