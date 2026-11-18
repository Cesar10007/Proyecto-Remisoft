import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { index, crear } from '../controllers/mesas.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO'));

// GET /api/mesas
router.get('/', index);
router.post('/', requireRole('SUPERADMIN', 'GERENTE'), crear);

export default router;
