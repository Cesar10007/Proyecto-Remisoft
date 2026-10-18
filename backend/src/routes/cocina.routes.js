import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as cocinaController from '../controllers/cocina.controller.js';

const router = Router();

router.use(authRequired);

// No existe un rol COCINA en la tabla rol; el tablero lo ven los roles
// que atienden el servicio de cocina.
const verComandas = requireRole('SUPERADMIN', 'GERENTE', 'MESERO');

router.get('/comandas', verComandas, cocinaController.comandas);
router.patch('/items/:id/avanzar', verComandas, cocinaController.avanzarItem);

export default router;
