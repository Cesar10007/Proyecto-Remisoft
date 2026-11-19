import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import {
  index,
  show,
  stockBajo,
  ajuste,
} from '../controllers/inventario.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO'));

// Solo la gerencia puede hacer ajustes manuales de inventario.
const soloGerencia = requireRole('SUPERADMIN', 'GERENTE');

// GET /api/inventario
router.get('/', index);

// Debe declararse antes de /:id.
router.get('/alertas/stock-bajo', stockBajo);

// POST /api/inventario/ajuste
// (también antes de /:id para que no lo capture la ruta paramétrica)
router.post('/ajuste', soloGerencia, ajuste);

// GET /api/inventario/:id
router.get('/:id', show);

export default router;
