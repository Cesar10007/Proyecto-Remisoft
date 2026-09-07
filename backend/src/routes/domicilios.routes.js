import { Router } from 'express';
import { authSanctum } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as domiciliosController from '../controllers/domicilios.controller.js';

const router = Router();

router.use(authSanctum);

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'REPARTIDOR');
const crear = requireRole('SUPERADMIN', 'GERENTE');
const actualizar = requireRole('SUPERADMIN', 'GERENTE', 'REPARTIDOR');

router.get('/', lectura, domiciliosController.index);
router.post('/', crear, domiciliosController.crear);
router.put('/:id', actualizar, domiciliosController.actualizar);
router.delete('/:id', crear, domiciliosController.eliminar);

export default router;