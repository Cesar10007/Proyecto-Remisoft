import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as productosController from '../controllers/productos.controller.js';

const router = Router();

router.use(authRequired);

const lectura = requireRole('SUPERADMIN', 'GERENTE', 'CAJERO', 'MESERO');
const escritura = requireRole('SUPERADMIN', 'GERENTE');

router.get('/vista', lectura, productosController.listarVista);
router.get('/sp', lectura, productosController.listarProcedimiento);
router.get('/', lectura, productosController.index);
router.get('/:id', lectura, productosController.show);
router.post('/', escritura, productosController.crear);
router.put('/:id', escritura, productosController.actualizar);
router.delete('/:id', escritura, productosController.eliminar);

export default router;