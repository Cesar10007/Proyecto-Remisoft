import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import * as proveedorController from '../controllers/proveedor.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE'));

router.get('/', proveedorController.index);
router.get('/:id', proveedorController.show);
router.post('/', proveedorController.store);
router.put('/:id', proveedorController.update);
router.delete('/:id', proveedorController.destroy);

export default router;