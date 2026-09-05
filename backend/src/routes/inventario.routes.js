import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import {
  index,
  show,
  stockBajo,
} from '../controllers/inventario.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO'));

// GET /api/inventario
router.get('/', index);

// Debe declararse antes de /:id.
router.get('/alertas/stock-bajo', stockBajo);

// GET /api/inventario/:id
router.get('/:id', show);

export default router;