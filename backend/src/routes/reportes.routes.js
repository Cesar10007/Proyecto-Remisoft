import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { ventasDiarias } from '../controllers/reportes.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE'));

// GET /api/reportes/ventas-diarias?desde&hasta
router.get('/ventas-diarias', ventasDiarias);

export default router;
