import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

function normalizeLaravelBcryptHash(hash) {
  if (!hash) return hash;

  // Laravel suele generar bcrypt con prefijo $2y$.
  // bcryptjs trabaja mejor con $2a$/$2b$, así que normalizamos.
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
      return res.status(422).json({ message: 'El campo email es requerido' });
    }

    if (!contrasena || typeof contrasena !== 'string') {
      return res.status(422).json({ message: 'El campo contrasena es requerido' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!usuario || !usuario.contrasena_hash) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (usuario.activo === false) {
      return res.status(403).json({ message: 'Usuario inactivo' });
    }

    const hash = normalizeLaravelBcryptHash(usuario.contrasena_hash);
    const passwordOk = await bcrypt.compare(contrasena, hash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = signJwt(usuario);

    res.json({
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
  res.json({
    user: req.user,
  });
}

// POST /api/auth/logout
//
// Con JWT simple, logout se hace eliminando el token en el frontend.
// Más adelante se puede implementar blacklist o refresh tokens.
export async function logout(req, res) {
  res.json({
    message: 'Sesión cerrada. Elimina el token JWT del cliente.',
  });
}