import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import * as cocinaController from '../controllers/cocina.controller.js';

const router = Router();

// El rol COCINERO existe solo para este tablero; ademas entran los roles
// que atienden el servicio de cocina.
const verComandas = requireRole('SUPERADMIN', 'GERENTE', 'MESERO', 'COCINERO');

router.get('/comandas', verComandas, cocinaController.comandas);
router.get('/historial', verComandas, cocinaController.historial);
router.patch('/items/:id/avanzar', verComandas, cocinaController.avanzarItem);

export default router;
