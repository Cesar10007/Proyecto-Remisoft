import pool from '../config/db.js';

export async function index(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM `Ingrediente`');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const { nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 50) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 50 caracteres)' });
    }
    if (descripcion && (typeof descripcion !== 'string' || descripcion.length > 500)) {
      return res.status(422).json({ message: 'El campo descripcion no puede superar 500 caracteres' });
    }
    if (unidad_medida && (typeof unidad_medida !== 'string' || unidad_medida.length > 20)) {
      return res.status(422).json({ message: 'El campo unidad_medida no puede superar 20 caracteres' });
    }
    if (costo_unitario_ref !== undefined && costo_unitario_ref !== null && isNaN(Number(costo_unitario_ref))) {
      return res.status(422).json({ message: 'El campo costo_unitario_ref debe ser numérico' });
    }
    if (stock_minimo !== undefined && stock_minimo !== null && isNaN(Number(stock_minimo))) {
      return res.status(422).json({ message: 'El campo stock_minimo debe ser numérico' });
    }

    await pool.query(
      'INSERT INTO `Ingrediente` (nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo) VALUES (?, ?, ?, ?, ?)',
      [nombre, descripcion ?? null, unidad_medida ?? null, costo_unitario_ref ?? null, stock_minimo ?? 0]
    );

    res.status(201).json({ message: 'Ingrediente creado' });
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, unidad_medida, costo_unitario_ref, stock_minimo } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.length > 50) {
      return res.status(422).json({ message: 'El campo nombre es requerido (máx. 50 caracteres)' });
    }
    if (descripcion && (typeof descripcion !== 'string' || descripcion.length > 500)) {
      return res.status(422).json({ message: 'El campo descripcion no puede superar 500 caracteres' });
    }
    if (unidad_medida && (typeof unidad_medida !== 'string' || unidad_medida.length > 20)) {
      return res.status(422).json({ message: 'El campo unidad_medida no puede superar 20 caracteres' });
    }
    if (costo_unitario_ref !== undefined && costo_unitario_ref !== null && isNaN(Number(costo_unitario_ref))) {
      return res.status(422).json({ message: 'El campo costo_unitario_ref debe ser numérico' });
    }
    if (stock_minimo !== undefined && stock_minimo !== null && isNaN(Number(stock_minimo))) {
      return res.status(422).json({ message: 'El campo stock_minimo debe ser numérico' });
    }

    await pool.query(
      'UPDATE `Ingrediente` SET nombre = ?, descripcion = ?, unidad_medida = ?, costo_unitario_ref = ?, stock_minimo = ? WHERE id_ingrediente = ?',
      [nombre, descripcion ?? null, unidad_medida ?? null, costo_unitario_ref ?? null, stock_minimo ?? 0, id]
    );

    res.json({ message: 'Ingrediente actualizado' });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM `Ingrediente` WHERE id_ingrediente = ?', [id]);
    res.json({ message: 'Ingrediente eliminado' });
  } catch (err) {
    if (err.errno === 1451) {
      return res.status(409).json({
        message: 'No se puede eliminar: este ingrediente está en uso (inventario, recetas, órdenes de compra o lotes).',
      });
    }
    next(err);
  }
}