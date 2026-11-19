import { bloquearPedido, mesaDisponible, transaccionSalon } from '../services/salon.service.js';
import { alcanceMesero, consumoSellado, indicadorPago, ErrorSalon } from '../utils/salon.js';
import { operar } from './salon.controller.js';
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

async function validarReferencias(tx, sede, data) {
  if (data.id_cliente && !await tx.cliente.count({ where: { ...sede, id_cliente: data.id_cliente } })) {
    throw new ErrorSalon(422, 'El cliente no pertenece al establecimiento.');
  }
  if (data.id_mesero && !await tx.usuario.count({ where: { ...sede, id_usuario: data.id_mesero } })) {
    throw new ErrorSalon(422, 'El mesero no pertenece al establecimiento.');
  }
}

// GET /api/pedidos
export async function index(req, res, next) {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: alcanceMesero(req.user),
      include: {
        Cliente: { where: req.sede, select: { Nombre: true } },
        usuario: { where: req.sede, select: { nombre: true } },
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

    const pedido = await prisma.pedido.findFirst({
      where: { id_pedido: id, ...alcanceMesero(req.user) },
      include: {
        Cliente: { where: req.sede, select: { Nombre: true } },
        usuario: { where: req.sede, select: { nombre: true } },
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
    const fueraDeSalon =
      ['DOMICILIO', 'LLEVAR'].includes(req.body?.Tipo_pedido) && !req.body?.Mesa_num && !req.body?.mesa;
    if (req.user.rol === 'MESERO' && !fueraDeSalon) {
      req.body = { ...req.body, mesa: req.body?.mesa ?? req.body?.Mesa_num };
      return operar('abrir')(req, res, next);
    }
    const { error, data } = validarPedido(req.body, { creating: true });

    if (error) {
      return res.status(422).json({ message: error });
    }

    // Doble seguro: aunque validarPedido ya fuerza ABIERTO, se vuelve a
    // fijar aquí para que el cliente nunca pueda elegir el estado inicial.
    if (req.user.rol === 'MESERO') data.id_mesero = req.user.id_usuario;
    const creado = await transaccionSalon(req.user, async (tx) => {
      await validarReferencias(tx, req.sede, data);
      data.id_restaurante = req.sede.id_restaurante;
      if (data.Mesa_num != null) {
        const mesa = await mesaDisponible(tx, data.Mesa_num, data);
        data.id_restaurante = mesa.id_restaurante;
      }
      return tx.pedido.create({ data });
    });

    res.status(201).json({ message: 'Pedido creado', id_pedido: creado.id_pedido });
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
    const pedidoActual = await prisma.pedido.findFirst({
      where: { id_pedido: id, ...alcanceMesero(req.user) },
      select: { estado: true, version_salon: true, Mesa_num: true },
    });

    if (!pedidoActual) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (
      req.user.rol === 'MESERO' &&
      (pedidoActual.Mesa_num != null || req.body?.Mesa_num || req.body?.Tipo_pedido === 'MESA')
    )
      return operar('editar')(req, res, next);
    if (pedidoActual.version_salon !== null)
      return res.status(409).json({ message: 'Usa el flujo de salón para modificar esta cuenta.' });
    if (pedidoActual.estado !== 'ABIERTO') {
      return res.status(409).json({
        message: `El pedido está en estado ${pedidoActual.estado} y solo se puede modificar si está ABIERTO.`,
      });
    }

    const { error, data } = validarPedido(req.body);

    if (error) {
      return res.status(422).json({ message: error });
    }

    if (req.user.rol === 'MESERO') data.id_mesero = req.user.id_usuario;
    await transaccionSalon(req.user, async (tx) => {
      await bloquearPedido(tx, id, req.sede.id_restaurante);
      const where = { id_pedido: id, version_salon: null, estado: 'ABIERTO', ...alcanceMesero(req.user) };
      const actual = await tx.pedido.findFirstOrThrow({ where, include: { Factura: indicadorPago } });
      if (consumoSellado(actual.Factura)) throw new ErrorSalon(409, 'El pedido ya está facturado.');
      await validarReferencias(tx, req.sede, data);
      if (data.Mesa_num !== undefined || data.id_mesero !== undefined) {
        const destino = { ...actual, ...data };
        if (
          destino.Mesa_num != null &&
          (destino.Mesa_num !== actual.Mesa_num || destino.id_mesero !== actual.id_mesero)
        ) {
          const mesa = await mesaDisponible(tx, destino.Mesa_num, destino, { excepto: id });
          data.id_restaurante = mesa.id_restaurante;
        }
      }
      await tx.pedido.update({ where, data });
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
    const pedidoActual = await prisma.pedido.findFirst({
      where: { id_pedido: id, ...alcanceMesero(req.user) },
      select: { estado: true, version_salon: true, Mesa_num: true },
    });

    if (!pedidoActual) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (req.user.rol === 'MESERO' && pedidoActual.Mesa_num != null) return operar('cancelar')(req, res, next);
    if (pedidoActual.version_salon !== null)
      return res.status(409).json({ message: 'Usa el flujo de salón para modificar esta cuenta.' });
    if (pedidoActual.estado !== 'ABIERTO') {
      return res.status(409).json({
        message: `El pedido está en estado ${pedidoActual.estado} y no se puede cancelar.`,
      });
    }

    await transaccionSalon(req.user, async (tx) => {
      await bloquearPedido(tx, id, req.sede.id_restaurante);
      const where = { id_pedido: id, version_salon: null, estado: 'ABIERTO', ...alcanceMesero(req.user) };
      const p = await tx.pedido.findFirstOrThrow({ where, select: { Factura: indicadorPago } });
      if (consumoSellado(p.Factura)) throw new ErrorSalon(409, 'El pedido ya está facturado.');
      await tx.pedido.update({ where, data: { estado: 'CANCELADO' } });
    });

    res.json({ message: 'Pedido cancelado' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    next(err);
  }
}
