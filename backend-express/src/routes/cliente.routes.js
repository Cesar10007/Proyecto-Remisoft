import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as clienteController from '../controllers/cliente.controller.js';

const router = Router();

router.use(authRequired);

router.get('/', clienteController.index);
router.get('/:id', clienteController.show);
router.post('/', clienteController.crear);
router.put('/:id', clienteController.actualizar);
router.delete('/:id', clienteController.eliminar);

export default router;