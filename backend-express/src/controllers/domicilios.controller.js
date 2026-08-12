import pool from '../config/db.js';

export async function index(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, p.estado AS estado_pedido, c.Nombre AS nombre_cliente
       FROM domicilio d
       JOIN pedido p ON d.id_pedido = p.id_pedido
       LEFT JOIN \`Cliente\` c ON p.id_cliente = c.id_cliente`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const { id_pedido, direccion, estado, id_repartidor } = req.body;

    if (!id_pedido || !Number.isInteger(Number(id_pedido))) {
      return res.status(422).json({ message: 'El campo id_pedido es requerido y debe ser un número entero' });
    }
    if (!direccion || typeof direccion !== 'string' || direccion.length > 150) {
      return res.status(422).json({ message: 'El campo direccion es requerido (máx. 150 caracteres)' });
    }
    if (estado && (typeof estado !== 'string' || estado.length > 20)) {
      return res.status(422).json({ message: 'El campo estado no puede superar 20 caracteres' });
    }
    if (id_repartidor !== undefined && id_repartidor !== null && !Number.isInteger(Number(id_repartidor))) {
      return res.status(422).json({ message: 'El campo id_repartidor debe ser un número entero' });
    }

    await pool.query(
      'INSERT INTO domicilio (id_pedido, direccion, estado, id_repartidor) VALUES (?, ?, ?, ?)',
      [id_pedido, direccion, estado || 'ASIGNADO', id_repartidor ?? null]
    );

    res.status(201).json({ message: 'Domicilio creado' });
  } catch (err) {
    if (err.errno === 1452) {
      return res.status(422).json({ message: 'El pedido o el repartidor indicado no existe' });
    }
    if (err.errno === 1062) {
      return res.status(409).json({ message: 'Ese pedido ya tiene un domicilio asignado' });
    }
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { direccion, estado, id_repartidor } = req.body;

    if (!direccion || typeof direccion !== 'string' || direccion.length > 150) {
      return res.status(422).json({ message: 'El campo direccion es requerido (máx. 150 caracteres)' });
    }
    if (estado && (typeof estado !== 'string' || estado.length > 20)) {
      return res.status(422).json({ message: 'El campo estado no puede superar 20 caracteres' });
    }
    if (id_repartidor !== undefined && id_repartidor !== null && !Number.isInteger(Number(id_repartidor))) {
      return res.status(422).json({ message: 'El campo id_repartidor debe ser un número entero' });
    }

    await pool.query(
      'UPDATE domicilio SET direccion = ?, estado = ?, id_repartidor = ? WHERE id_domicilio = ?',
      [direccion, estado ?? null, id_repartidor ?? null, id]
    );

    res.json({ message: 'Domicilio actualizado' });
  } catch (err) {
    if (err.errno === 1452) {
      return res.status(422).json({ message: 'El repartidor indicado no existe' });
    }
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query("UPDATE domicilio SET estado = 'CANCELADO' WHERE id_domicilio = ?", [id]);
    res.json({ message: 'Domicilio cancelado' });
  } catch (err) {
    next(err);
  }
}