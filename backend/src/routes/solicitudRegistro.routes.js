import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import {
  listarSolicitudes,
  historialSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
} from '../controllers/solicitudRegistro.controller.js';

const router = Router();

router.use(requireRole('SUPERADMIN', 'GERENTE'));

router.get('/', listarSolicitudes);
router.get('/historial', historialSolicitudes);
router.patch('/:id/aprobar', aprobarSolicitud);
router.patch('/:id/rechazar', rechazarSolicitud);

export default router;