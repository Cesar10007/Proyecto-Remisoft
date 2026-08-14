import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as usuariosController from '../controllers/usuarios.controller.js';

const router = Router();

router.use(authRequired);

router.get('/', usuariosController.index);
router.get('/:id', usuariosController.show);
router.post('/', usuariosController.crear);
router.put('/:id', usuariosController.actualizar);
router.delete('/:id', usuariosController.eliminar);

export default router;
