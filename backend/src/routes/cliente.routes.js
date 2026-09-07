import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as clienteController from '../controllers/cliente.controller.js';

const router = Router();

router.use(authRequired);

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO', 'REPARTIDOR');
const crear = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO');
const escritura = requireRole('SUPERADMIN', 'GERENTE');

router.get('/', lectura, clienteController.index);
router.get('/buscar', lectura, clienteController.buscarPorTelefono);
router.get('/:id', lectura, clienteController.show);
router.post('/', crear, clienteController.crear);
router.put('/:id', escritura, clienteController.actualizar);
router.delete('/:id', escritura, clienteController.eliminar);

export default router;