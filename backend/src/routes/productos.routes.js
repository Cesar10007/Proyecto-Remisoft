import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as productosController from '../controllers/productos.controller.js';

const router = Router();

router.use(authRequired);

router.get('/vista', productosController.listarVista);
router.get('/sp', productosController.listarProcedimiento);
router.get('/', productosController.index);
router.get('/:id', productosController.show);
router.post('/', productosController.crear);
router.put('/:id', productosController.actualizar);
router.delete('/:id', productosController.eliminar);

export default router;