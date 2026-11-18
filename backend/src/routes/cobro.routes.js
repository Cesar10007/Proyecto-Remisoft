import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import * as cobroController from '../controllers/cobro.controller.js';

const router = Router();

const cobrar = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');

router.get('/pendientes', cobrar, cobroController.pendientes);
router.post('/cerrar-cuenta', cobrar, cobroController.cerrarCuenta);

export default router;
