import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { index, show } from '../controllers/categoriaProductos.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO'));

router.get('/', index);
router.get('/:id', show);

export default router;