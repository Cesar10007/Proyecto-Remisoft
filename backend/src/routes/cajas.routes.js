import { Router } from 'express';
import { authSanctum } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as cajasController from '../controllers/cajas.controller.js';

const router = Router();

router.use(authSanctum);

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');
const escritura = requireRole('SUPERADMIN', 'GERENTE');
const actualizar = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO');

router.get('/', lectura, cajasController.index);
router.post('/', escritura, cajasController.crear);
router.put('/:id', actualizar, cajasController.actualizar);
router.delete('/:id', escritura, cajasController.eliminar);

export default router;