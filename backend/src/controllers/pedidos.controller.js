import prisma from '../config/prisma.js';
import { parseId, validateString } from '../utils/validation.js';

// Estados que un usuario puede fijar manualmente desde la API.
// CERRADO queda fuera a propósito: solo lo asigna el flujo de cobro,
// para que nadie pueda "cerrar" un pedido sin pasar por la facturación.
const ESTADOS_EDITABLES = new Set([
  'ABIERTO',
  'EN_PROCESO',
  'EN_PREPARACION',
  'LISTO',
  'ENTREGADO',
  'CANCELADO',
]);

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value;
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
  const entrada = body ?? {};

  // Solo se tocan los campos que el cliente realmente envía.
  // Así un PUT parcial no borra datos que no venían en el body.
  const tiene = (campo) => Object.prototype.hasOwnProperty.call(entrada, campo);

  const idCliente = parseNullableInt(entrada.id_cliente, 'id_cliente');
  if (idCliente.error) return { error: idCliente.error };

  const idMesero = parseNullableInt(entrada.id_mesero, 'id_mesero');
  if (idMesero.error) return { error: idMesero.error };

  const mesaNum = parseNullableInt(entrada.Mesa_num, 'Mesa_num');
  if (mesaNum.error) return { error: mesaNum.error };

  const validations = [
    validateString(entrada.estado, 'estado', 20),
    validateString(entrada.Tipo_pedido, 'Tipo_pedido', 20),
    validateString(entrada.notas, 'notas', 500),
  ];

  const error = validations.find(Boolean);

  if (error) {
    return { error };
  }

  const estadoSolicitado = cleanString(entrada.estado);

  if (estadoSolicitado && !ESTADOS_EDITABLES.has(estadoSolicitado)) {
    return {
      error: `El estado "${estadoSolicitado}" no es válido.`,
    };
  }

  const data = {};

  if (creating || tiene('id_cliente')) data.id_cliente = idCliente.value;
  if (creating || tiene('id_mesero')) data.id_mesero = idMesero.value;
  if (creating || tiene('Mesa_num')) data.Mesa_num = mesaNum.value;
  if (creating || tiene('Tipo_pedido')) {
    data.Tipo_pedido = cleanString(entrada.Tipo_pedido) || null;
  }
  if (creating || tiene('notas')) {
    data.notas = cleanString(entrada.notas) || null;
  }

  // Regla de negocio: el pedido nace siempre ABIERTO (réplica de
  // sp_crear_pedido). En edición solo se cambia el estado si viene en el body.
  if (creating) {
    data.estado = 'ABIERTO';
  } else if (estadoSolicitado) {
    data.estado = estadoSolicitado;
  }

  return { data };
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

    // Doble seguro: aunque validarPedido ya fuerza ABIERTO, se vuelve a
    // fijar aquí para que el cliente nunca pueda elegir el estado inicial.
    await prisma.pedido.create({ data: { ...data, estado: 'ABIERTO' } });

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

    // Regla de negocio: solo se modifica un pedido ABIERTO.
    const pedidoActual = await prisma.pedido.findUnique({
      where: { id_pedido: id },
      select: { estado: true },
    });

    if (!pedidoActual) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (pedidoActual.estado !== 'ABIERTO') {
      return res.status(409).json({
        message: `El pedido está en estado ${pedidoActual.estado} y solo se puede modificar si está ABIERTO.`,
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

    // Regla de negocio: solo se cancela un pedido ABIERTO.
    const pedidoActual = await prisma.pedido.findUnique({
      where: { id_pedido: id },
      select: { estado: true },
    });

    if (!pedidoActual) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (pedidoActual.estado !== 'ABIERTO') {
      return res.status(409).json({
        message: `El pedido está en estado ${pedidoActual.estado} y no se puede cancelar.`,
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
