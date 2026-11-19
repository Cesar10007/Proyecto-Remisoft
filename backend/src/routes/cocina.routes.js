import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import * as cocinaController from '../controllers/cocina.controller.js';

const router = Router();

// No existe un rol COCINA en la tabla rol; el tablero lo ven los roles
// que atienden el servicio de cocina.
const verComandas = requireRole('SUPERADMIN', 'GERENTE', 'MESERO');

router.get('/comandas', verComandas, cocinaController.comandas);
router.patch('/items/:id/avanzar', verComandas, cocinaController.avanzarItem);

export default router;
