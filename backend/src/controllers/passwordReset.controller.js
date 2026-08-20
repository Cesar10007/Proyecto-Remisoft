import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { sendPasswordResetEmail } from '../services/mail.service.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

function passwordIsValid(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>_+\-]/.test(password)
  );
}

function genericResetMessage() {
  return {
    success: true,
    message:
      'Si el correo está registrado, recibirás un enlace de recuperación.',
  };
}

// POST /api/auth/send-reset-link
export async function sendResetLink(req, res, next) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(422).json({
        errors: {
          email: ['El correo electrónico es requerido.'],
        },
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const user = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      select: { id_usuario: true },
    });

    /*
     * No revela si una cuenta existe: la respuesta para un email
     * inexistente es exactamente la misma.
     */
    if (!user) {
      return res.status(200).json(genericResetMessage());
    }

    const token = crypto.randomBytes(32).toString('hex');
    const createdAt = new Date();

    await prisma.password_reset_tokens.upsert({
      where: { email: emailNormalizado },
      update: {
        token,
        created_at: createdAt,
      },
      create: {
        email: emailNormalizado,
        token,
        created_at: createdAt,
      },
    });

    /*
     * Si SMTP falla, se informa el error al middleware y no se entrega
     * una respuesta de éxito que sugiera equivocadamente que llegó el email.
     * El siguiente intento generará y reemplazará el token anterior.
     */
    await sendPasswordResetEmail(emailNormalizado, token);

    return res.status(200).json(genericResetMessage());
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req, res, next) {
  try {
    const { token, email, password } = req.body;
    const errors = {};

    if (!token || typeof token !== 'string') {
      errors.token = ['El token es requerido.'];
    }

    if (!email || typeof email !== 'string') {
      errors.email = ['El correo electrónico es requerido.'];
    }

    if (!passwordIsValid(password)) {
      errors.password = [
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.',
      ];
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ errors });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const resetToken = await prisma.password_reset_tokens.findUnique({
      where: { email: emailNormalizado },
    });

    if (
      !resetToken ||
      !resetToken.created_at ||
      !crypto.timingSafeEqual(
        Buffer.from(resetToken.token),
        Buffer.from(token),
      )
    ) {
      return res.status(400).json({
        message: 'El enlace de recuperación es inválido o expiró.',
      });
    }

    const expiresAt = new Date(
      resetToken.created_at.getTime() + RESET_TOKEN_TTL_MS,
    );

    if (expiresAt <= new Date()) {
      await prisma.password_reset_tokens.delete({
        where: { email: emailNormalizado },
      });

      return res.status(400).json({
        message: 'El enlace de recuperación expiró.',
      });
    }

    const contrasena_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.usuario.update({
        where: { email: emailNormalizado },
        data: { contrasena_hash },
      }),
      prisma.password_reset_tokens.delete({
        where: { email: emailNormalizado },
      }),
    ]);

    return res.status(200).json({
      message: 'Contraseña actualizada correctamente.',
    });
  } catch (error) {
    next(error);
  }
}