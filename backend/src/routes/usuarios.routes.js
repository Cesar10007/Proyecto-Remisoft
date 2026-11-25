import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import * as usuariosController from '../controllers/usuarios.controller.js';

const router = Router();

// Roles con acceso a /api/usuarios
router.use(requireRole('SUPERADMIN', 'GERENTE'));

// Gerente multisede: las rutas literales van antes de /:id para que "mis-sedes"
// nunca se interprete como un id.
router.get('/mis-sedes', usuariosController.misSedes);
// Cambiar la sede ACTIVA es del propio usuario (sus sedes). Asignar sedes es del
// SUPERADMIN y se declara más abajo, en /:id/sedes.
router.patch('/me/sede', usuariosController.cambiarSede);

router.get('/', usuariosController.index);
router.get('/:id', usuariosController.show);
router.post('/', usuariosController.crear);
router.put('/:id', usuariosController.actualizar);

// Activar o desactivar usuario
router.patch('/:id/estado', usuariosController.cambiarEstado);

// Eliminación lógica
router.delete('/:id', usuariosController.eliminar);

// Conjunto de sedes de un usuario (solo SUPERADMIN).
router.get('/:id/sedes', usuariosController.sedesDeUsuario);
router.put('/:id/sedes', usuariosController.asignarSedes);

export default router;
