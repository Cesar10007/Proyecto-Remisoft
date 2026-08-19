import { Router } from 'express';
import { sendResetLink, resetPassword } from '../controllers/passwordReset.controller.js';

const router = Router();

/**
 * Rutas públicas para recuperación de contraseña.
 * No requieren autenticaciÓ¡n porque el usuario no tiene sesión activa.
 */

// POST /api/auth/send-reset-link
// Body: { email: string }
router.post('/send-reset-link', sendResetLink);

// POST /api/auth/reset-password
// Body: { token: string, email: string, password: string }
router.post('/reset-password', resetPassword);

export default router;
