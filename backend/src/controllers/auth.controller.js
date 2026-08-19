import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

function normalizeLaravelBcryptHash(hash) {
  if (!hash) return hash;

  // Los hashes bcrypt de Laravel pueden usar el prefijo $2y$.
  // bcryptjs acepta $2a$ y $2b$, por eso se normaliza al verificar.
  if (hash.startsWith('$2y$')) {
    return `$2a$${hash.slice(4)}`;
  }

  return hash;
}

function publicUser(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    id_rol: usuario.id_rol,
    identificacion: usuario.identificacion,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    activo: usuario.activo,
    fecha_registro: usuario.fecha_registro,
    rol: usuario.rol,
  };
}

function signJwt(usuario) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado');
  }

  return jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
      rol: usuario.rol?.nombre ?? null,
      email: usuario.email,
    },
    process.env.JWT_SECRET,
    {
      subject: String(usuario.id_usuario),
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    },
  );
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, contrasena } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(422).json({
        errors: { email: ['El campo email es requerido.'] },
      });
    }

    if (!contrasena || typeof contrasena !== 'string') {
      return res.status(422).json({
        errors: { contrasena: ['El campo contraseña es requerido.'] },
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNormalizado },
      include: { rol: true },
    });

    if (!usuario || !usuario.contrasena_hash) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    if (usuario.activo === false) {
      return res.status(403).json({ message: 'Usuario inactivo.' });
    }

    const hash = normalizeLaravelBcryptHash(usuario.contrasena_hash);
    const passwordOk = await bcrypt.compare(contrasena, hash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const token = signJwt(usuario);

    return res.json({
      token,
      token_type: 'Bearer',
      auth_provider: 'jwt',
      rol: usuario.rol?.nombre ?? null,
      user: publicUser(usuario),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function me(req, res) {
  return res.json({
    user: req.user,
  });
}

// POST /api/auth/logout
// JWT no guarda sesión de servidor; el cliente debe eliminar token y datos locales.
export async function logout(_req, res) {
  return res.json({
    message: 'Sesión cerrada. Elimina el token JWT del cliente.',
  });
}
