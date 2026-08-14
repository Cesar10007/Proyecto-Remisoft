import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

/**
 * Paso 1: Recibe el email, genera un token y lo guarda en password_reset_tokens.
 * En producción, aquí se enviará¡¡ un email con el enlace de reseteo.
 */
export async function sendResetLink(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido',
        code: 'MISSING_EMAIL'
      });
    }

    // Verificar que el usuario existe
    const user = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({
        success: true,
        message: 'Si el email está registrado, recibirÁ¡s un enlace de recuperación'
      });
    }

    // Generar token aleatorio
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar o actualizar el token en password_reset_tokens
    await prisma.password_reset_tokens.upsert({
      where: { email },
      update: { token, created_at: expiresAt },
      create: { email, token, created_at: expiresAt }
    });

    // TODO: Enviar email con el enlace de reseteo
    // Ejemplo: https://tu-frontend.com/reset-password?token=...&email=...
    console.log(`[PasswordReset] Token generado para ${email}: ${token}`);

    res.status(200).json({
      success: true,
      message: 'Si el email está registrado, recibirÁ¡s un enlace de recuperación'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Paso 2: Recibe token + email + nueva contraseña, valida y actualiza.
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, email, password } = req.body;

    // Validaciones básicas
    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token, email y contraseña son requeridos',
        code: 'MISSING_FIELDS'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    // Verificar que el token existe y no expiró¡¢³
    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { email }
    });

    if (!resetToken || resetToken.token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Token invlido o expirado',
        code: 'INVALID_TOKEN'
      });
    }

    if (new Date(resetToken.created_at) < new Date()) {
      // Token expirado
      await prisma.password_reset_tokens.delete({ where: { email } });
      return res.status(400).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Hashear la nueva contraseña con bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Actualizar contraseña del usuario
    await prisma.usuarios.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Eliminar el token usado
    await prisma.password_reset_tokens.delete({
      where: { email }
    });

    res.status(200).json({
      success: true,
      message: 'Contraseñ¡¡¡ actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
}
