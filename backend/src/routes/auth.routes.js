import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { crearSolicitud } from '../controllers/solicitudRegistro.controller.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/login', authController.login);
router.post('/solicitud-registro', crearSolicitud);
router.get('/me', authRequired, authController.me);
router.post('/logout', authRequired, authController.logout);

export default router;