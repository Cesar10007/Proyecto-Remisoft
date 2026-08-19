import { Router } from 'express';
import { authSanctum } from '../middleware/auth.js';
import * as ingredientesController from '../controllers/ingredientes.controller.js';

const router = Router();

router.use(authSanctum);

router.get('/', ingredientesController.index);
router.post('/', ingredientesController.crear);
router.put('/:id', ingredientesController.actualizar);
router.delete('/:id', ingredientesController.eliminar);

export default router;