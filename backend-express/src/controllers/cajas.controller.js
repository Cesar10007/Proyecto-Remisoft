import pool from '../config/db.js';

export async function index(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM caja');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const { nombre, estado } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 40) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 40 caracteres)' });
    }
    if (estado && (typeof estado !== 'string' || estado.length > 20)) {
      return res.status(422).json({ message: 'El campo estado no puede superar 20 caracteres' });
    }

    await pool.query(
      'INSERT INTO caja (nombre, estado) VALUES (?, ?)',
      [nombre, estado || 'ACTIVA']
    );

    res.status(201).json({ message: 'Caja creada' });
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, estado } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 40) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 40 caracteres)' });
    }
    if (estado && (typeof estado !== 'string' || estado.length > 20)) {
      return res.status(422).json({ message: 'El campo estado no puede superar 20 caracteres' });
    }

    await pool.query(
      'UPDATE caja SET nombre = ?, estado = ? WHERE id_caja = ?',
      [nombre, estado || 'ACTIVA', id]
    );

    res.json({ message: 'Caja actualizada' });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE caja SET estado = 'INACTIVA' WHERE id_caja = ?",
      [id]
    );

    res.json({ message: 'Caja desactivada' });
  } catch (err) {
    next(err);
  }
}