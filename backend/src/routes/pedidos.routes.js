import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as pedidosController from '../controllers/pedidos.controller.js';

const router = Router();

router.use(authRequired);

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO');
const crear = requireRole('SUPERADMIN', 'GERENTE', 'MESERO');
const actualizar = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO');
const cancelar = requireRole('SUPERADMIN', 'GERENTE', 'MESERO');

router.get('/', lectura, pedidosController.index);
router.get('/:id', lectura, pedidosController.show);
router.post('/', crear, pedidosController.crear);
router.put('/:id', actualizar, pedidosController.actualizar);
router.delete('/:id', cancelar, pedidosController.eliminar);

export default router;