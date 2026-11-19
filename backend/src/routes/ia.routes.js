import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { index, crear } from '../controllers/ia.controller.js';

const router = Router();
router.use(requireRole('GERENTE', 'SUPERADMIN'));
router.get('/', index);
router.post('/', crear);
export default router;
