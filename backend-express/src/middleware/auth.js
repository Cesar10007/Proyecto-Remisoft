import crypto from 'crypto';
import prisma from '../config/db.js';

export async function authSanctum(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, bearer] = header.match(/^Bearer\s+(.+)$/) || [];

    if (!bearer) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const [id, plainText] = bearer.split('|');
    if (!id || !plainText) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const hashed = crypto.createHash('sha256').update(plainText).digest('hex');

    const tokenRow = await prisma.personal_access_tokens.findFirst({
      where: { id: BigInt(id), token: hashed },
    });

    if (!tokenRow) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Token expirado' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: Number(tokenRow.tokenable_id) },
      include: { rol: true },
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      id_rol: usuario.id_rol,
      rol: usuario.rol?.nombre,
    };

    next();
  } catch (err) {
    next(err);
  }
}
