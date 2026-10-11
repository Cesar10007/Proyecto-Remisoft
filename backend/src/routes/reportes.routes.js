import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { gastosDelMes, pedidosActivos, ventasDiarias } from '../controllers/reportes.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE'));

// GET /api/reportes/ventas-diarias?desde&hasta
router.get('/ventas-diarias', ventasDiarias);

// GET /api/reportes/pedidos-activos
router.get('/pedidos-activos', pedidosActivos);

// GET /api/reportes/gastos-del-mes
router.get('/gastos-del-mes', gastosDelMes);

export default router;
