import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { index, show, store, update, destroy } from '../controllers/factura.controller.js';

const router = Router();

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO');
const crear = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');
const escritura = requireRole('SUPERADMIN', 'GERENTE');

router.get('/', lectura, index);
router.get('/:id', lectura, show);
router.post('/', crear, store);
router.put('/:id', escritura, update);
router.delete('/:id', escritura, destroy);

export default router;