import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import * as usuariosController from '../controllers/usuarios.controller.js';

const router = Router();

// Roles con acceso a /api/usuarios
router.use(requireRole('SUPERADMIN', 'GERENTE'));

router.get('/', usuariosController.index);
router.get('/:id', usuariosController.show);
router.post('/', usuariosController.crear);
router.put('/:id', usuariosController.actualizar);
router.delete('/:id', usuariosController.eliminar);

export default router;