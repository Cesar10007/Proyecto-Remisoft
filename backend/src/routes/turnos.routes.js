import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { index, show, store, update, destroy } from '../controllers/turnos.controller.js';

const router = Router();

router.use(authRequired);

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');
const escritura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');
const eliminar = requireRole('SUPERADMIN', 'GERENTE');

router.get('/', lectura, index);
router.get('/:id', lectura, show);
router.post('/', escritura, store);
router.put('/:id', escritura, update);
router.delete('/:id', eliminar, destroy);

export default router;