import crypto from 'crypto';
import pool from '../config/db.js';

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

    const [rows] = await pool.query(
      `SELECT pat.id, pat.tokenable_id, pat.expires_at
       FROM personal_access_tokens pat
       WHERE pat.id = ? AND pat.token = ?`,
      [id, hashed]
    );

    const tokenRow = rows[0];
    if (!tokenRow) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Token expirado' });
    }

    const [usuarios] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.apellido, u.email, u.id_rol, r.nombre AS rol
       FROM usuario u
       JOIN rol r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = ?`,
      [tokenRow.tokenable_id]
    );

    const usuario = usuarios[0];
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = usuario;
    next();
  } catch (err) {
    next(err);
  }
}