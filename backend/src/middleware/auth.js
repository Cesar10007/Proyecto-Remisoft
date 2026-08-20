import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../generated/prisma/client.js';

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const [, bearer] = header.match(/^Bearer\s+(.+)$/) || [];
  return bearer || null;
}

function buildUserPayload(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    id_rol: usuario.id_rol,
    rol: usuario.rol?.nombre ?? null,
  };
}

async function authenticateWithJwt(token) {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET no está configurado');
    error.statusCode = 500;
    throw error;
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const error = new Error('Token expirado');
      error.statusCode = 401;
      throw error;
    }

    const error = new Error('Token inválido');
    error.statusCode = 401;
    throw error;
  }

  const idUsuario = Number(payload.sub || payload.id_usuario);

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    const error = new Error('Token inválido');
    error.statusCode = 401;
    throw error;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
    include: { rol: true },
  });

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 401;
    throw error;
  }

  if (usuario.activo === false) {
    const error = new Error('Usuario inactivo');
    error.statusCode = 403;
    throw error;
  }

  return buildUserPayload(usuario);
}

async function authenticateWithSanctum(token) {
  const [id, plainText] = token.split('|');

  if (!id || !plainText) {
    const error = new Error('Token inválido');
    error.statusCode = 401;
    throw error;
  }

  const hashed = crypto.createHash('sha256').update(plainText).digest('hex');

  const tokenRow = await prisma.personal_access_tokens.findFirst({
    where: { id: BigInt(id), token: hashed },
  });

  if (!tokenRow) {
    const error = new Error('Token inválido');
    error.statusCode = 401;
    throw error;
  }

  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    const error = new Error('Token expirado');
    error.statusCode = 401;
    throw error;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: Number(tokenRow.tokenable_id) },
    include: { rol: true },
  });

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 401;
    throw error;
  }

  if (usuario.activo === false) {
    const error = new Error('Usuario inactivo');
    error.statusCode = 403;
    throw error;
  }

  return buildUserPayload(usuario);
}

export async function authRequired(req, res, next) {
  try {
    const bearer = getBearerToken(req);

    if (!bearer) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (bearer.includes('|')) {
      req.user = await authenticateWithSanctum(bearer);
    } else {
      req.user = await authenticateWithJwt(bearer);
    }

    next();
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    next(err);
  }
}

// Alias temporal para no tener que cambiar todas las rutas actuales.
// Las rutas existentes todavía importan authSanctum.
export const authSanctum = authRequired;