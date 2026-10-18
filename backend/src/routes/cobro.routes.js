import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as cobroController from '../controllers/cobro.controller.js';

const router = Router();

router.use(authRequired);

const cobrar = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');

router.get('/pendientes', cobrar, cobroController.pendientes);
router.post('/cerrar-cuenta', cobrar, cobroController.cerrarCuenta);

export default router;
