import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { index, show, store, update, destroy } from '../controllers/factura.controller.js';

const router = Router();

const facturacion = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO');
const escritura = requireRole('SUPERADMIN', 'GERENTE');

router.get('/', facturacion, index);
router.get('/:id', facturacion, show);
router.post('/', facturacion, store);
router.put('/:id', facturacion, update);
router.delete('/:id', escritura, destroy);

export default router;
