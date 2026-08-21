import prisma from '../config/prisma.js';

function parseId(id) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function validateString(value, field, max, required = false) {
  const cleaned = cleanString(value);

  if (required && isEmpty(cleaned)) {
    return `El campo ${field} es requerido`;
  }

  if (!isEmpty(cleaned) && typeof cleaned !== 'string') {
    return `El campo ${field} debe ser texto`;
  }

  if (!isEmpty(cleaned) && cleaned.length > max) {
    return `El campo ${field} no puede superar ${max} caracteres`;
  }

  return null;
}

function parseNullableInt(value, field) {
  if (isEmpty(value)) {
    return { value: null };
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return {
      error: `El campo ${field} debe ser un número entero válido`,
    };
  }

  return { value: parsed };
}

function formatPedido(pedido) {
  return {
    id_pedido: pedido.id_pedido,
    id_cliente: pedido.id_cliente,
    id_mesero: pedido.id_mesero,
    Fecha_hora: pedido.Fecha_hora,
    estado: pedido.estado ?? '',
    Tipo_pedido: pedido.Tipo_pedido ?? '',
    Mesa_num: pedido.Mesa_num,
    notas: pedido.notas ?? '',
    nombre_cliente: pedido.Cliente?.Nombre ?? null,
    nombre_mesero: pedido.usuario?.nombre ?? null,
  };
}

function validarPedido(body, { creating = false } = {}) {
  const idCliente = parseNullableInt(body.id_cliente, 'id_cliente');
  if (idCliente.error) return { error: idCliente.error };

  const idMesero = parseNullableInt(body.id_mesero, 'id_mesero');
  if (idMesero.error) return { error: idMesero.error };

  const mesaNum = parseNullableInt(body.Mesa_num, 'Mesa_num');
  if (mesaNum.error) return { error: mesaNum.error };

  const validations = [
    validateString(body.estado, 'estado', 20),
    validateString(body.Tipo_pedido, 'Tipo_pedido', 20),
    validateString(body.notas, 'notas', 500),
  ];

  const error = validations.find(Boolean);

  if (error) {
    return { error };
  }

  return {
    data: {
      id_cliente: idCliente.value,
      id_mesero: idMesero.value,
      estado: cleanString(body.estado) || (creating ? 'ABIERTO' : null),
      Tipo_pedido: cleanString(body.Tipo_pedido) || null,
      Mesa_num: mesaNum.value,
      notas: cleanString(body.notas) || null,
    },
  };
}

// GET /api/pedidos
export async function index(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        Cliente: true,
        usuario: true,
      },
      orderBy: {
        id_pedido: 'asc',
      },
    });

    res.json(pedidos.map(formatPedido));
  } catch (err) {
    next(err);
  }
}

// GET /api/pedidos/:id
export async function show(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del pedido debe ser un número entero válido',
      });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: id },
      include: {
        Cliente: true,
        usuario: true,
      },
    });

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json(formatPedido(pedido));
  } catch (err) {
    next(err);
  }
}

// POST /api/pedidos
export async function crear(req, res, next) {
  try {
    const { error, data } = validarPedido(req.body, { creating: true });

    if (error) {
      return res.status(422).json({ message: error });
    }

    await prisma.pedido.create({ data });

    res.status(201).json({ message: 'Pedido creado' });
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(422).json({
        message: 'El cliente o mesero indicado no existe',
      });
    }

    next(err);
  }
}

// PUT /api/pedidos/:id
export async function actualizar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del pedido debe ser un número entero válido',
      });
    }

    const { error, data } = validarPedido(req.body);

    if (error) {
      return res.status(422).json({ message: error });
    }

    await prisma.pedido.update({
      where: { id_pedido: id },
      data,
    });

    res.json({ message: 'Pedido actualizado' });
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(422).json({
        message: 'El cliente o mesero indicado no existe',
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    next(err);
  }
}

// DELETE /api/pedidos/:id
//
// Igual que Laravel: no borra físicamente.
// Solo marca el pedido como CANCELADO.
export async function eliminar(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        message: 'El id del pedido debe ser un número entero válido',
      });
    }

    await prisma.pedido.update({
      where: { id_pedido: id },
      data: { estado: 'CANCELADO' },
    });

    res.json({ message: 'Pedido cancelado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    next(err);
  }
}
