import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { index, show, store, update, destroy } from '../controllers/detallePedido.controller.js';

const router = Router();

router.use(authRequired);

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO');
const escritura = requireRole('SUPERADMIN', 'GERENTE', 'MESERO');

router.get('/', lectura, index);
router.get('/:id', lectura, show);
router.post('/', escritura, store);
router.put('/:id', escritura, update);
router.delete('/:id', escritura, destroy);

export default router;