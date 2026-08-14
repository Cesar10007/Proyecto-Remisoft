import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as pedidosController from '../controllers/pedidos.controller.js';

const router = Router();

router.use(authRequired);

router.get('/', pedidosController.index);
router.get('/:id', pedidosController.show);
router.post('/', pedidosController.crear);
router.put('/:id', pedidosController.actualizar);
router.delete('/:id', pedidosController.eliminar);

export default router;
