import { Router } from 'express';
import { authSanctum } from '../middleware/auth.js';
import * as domiciliosController from '../controllers/domicilios.controller.js';

const router = Router();

router.use(authSanctum);

router.get('/', domiciliosController.index);
router.post('/', domiciliosController.crear);
router.put('/:id', domiciliosController.actualizar);
router.delete('/:id', domiciliosController.eliminar);

export default router;