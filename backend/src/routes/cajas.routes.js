import { Router } from 'express';
import { authSanctum } from '../middleware/auth.js';
import * as cajasController from '../controllers/cajas.controller.js';

const router = Router();

router.use(authSanctum);

router.get('/', cajasController.index);
router.post('/', cajasController.crear);
router.put('/:id', cajasController.actualizar);
router.delete('/:id', cajasController.eliminar);

export default router;