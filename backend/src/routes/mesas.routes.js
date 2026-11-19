import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { index, crear, editar, eliminar } from '../controllers/mesas.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO'));

// GET /api/mesas
router.get('/', index);
const gestionar = requireRole('SUPERADMIN', 'GERENTE');
router.post('/', gestionar, crear);
router.put('/:numero', gestionar, editar);
router.delete('/:numero', gestionar, eliminar);

export default router;
