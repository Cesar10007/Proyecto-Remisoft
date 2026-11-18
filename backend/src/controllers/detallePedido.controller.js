import { alcanceMesero, ErrorSalon, indicadorPago, consumoSellado } from '../utils/salon.js';
import { bloquearPedido, transaccionSalon } from '../services/salon.service.js';
import prisma from '../config/prisma.js';
import { parseId } from '../utils/validation.js';

// Réplica de sp_agregar_item_pedido: solo se toca el detalle de un
// pedido en estado ABIERTO.
const PEDIDO_EDITABLE = 'ABIERTO';

// Nombres reales de las relaciones en schema.prisma:
//   Detalle_pedido.pedido   (singular, minúscula)
//   Detalle_pedido.Producto (con P mayúscula)
const RELACIONES = { pedido: true, Producto: true };

function parseCantidad(value) {
  const cantidad = Number(value);

  return Number.isInteger(cantidad) && cantidad > 0 ? cantidad : null;
}

// Estos endpoints siguen sirviendo a pedidos no gestionados por salón. Tomar el mismo
// bloqueo del pedido evita añadir renglones mientras cocina lo empieza o caja lo cobra.
async function permitirDetalle(tx, id, user) {
  await bloquearPedido(tx, id);
  const p = await tx.pedido.findFirst({
    where: { id_pedido: id, ...alcanceMesero(user) },
    select: { estado: true, version_salon: true, Mesa_num: true, Factura: indicadorPago },
  });
  if (!p) throw new ErrorSalon(404, 'Pedido no encontrado.');
  if (consumoSellado(p.Factura)) throw new ErrorSalon(409, 'El consumo ya está facturado.');
  if (p.version_salon !== null || (user.rol === 'MESERO' && p.Mesa_num !== null))
    throw new ErrorSalon(409, 'Modifica la comanda completa desde el salón.');
  if (p.estado !== PEDIDO_EDITABLE) throw new ErrorSalon(409, 'Solo se puede modificar un pedido abierto.');
}

// GET /api/detalle-pedido?id_pedido=1
export async function index(req, res, next) {
  try {
    let where = {};

    if (req.query.id_pedido !== undefined) {
      const idPedido = parseId(req.query.id_pedido);

      if (!idPedido) {
        return res.status(422).json({
          success: false,
          message: 'El id_pedido debe ser un número entero válido',
          code: 'INVALID_ID_PEDIDO',
        });
      }

      where = { id_pedido: idPedido };
    }

    if (req.user.rol === 'MESERO') where.pedido = alcanceMesero(req.user);
    const items = await prisma.detalle_pedido.findMany({
      where,
      include: RELACIONES,
      orderBy: { id_detalle: 'asc' },
    });

    res.status(200).json({ success: true, data: items, count: items.length });
  } catch (error) {
    next(error);
  }
}

// GET /api/detalle-pedido/:id
export async function show(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        success: false,
        message: 'El id del detalle debe ser un número entero válido',
        code: 'INVALID_ID',
      });
    }

    const item = await prisma.detalle_pedido.findFirst({
      where: { id_detalle: id, pedido: alcanceMesero(req.user) },
      include: RELACIONES,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'No encontrado',
        code: 'NOT_FOUND',
      });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/detalle-pedido
 * Mismas tres validaciones que sp_agregar_item_pedido:
 *   1. El pedido existe y está ABIERTO.
 *   2. El producto existe y está activo (Estado = 1).
 *   3. El precio se toma del servidor, nunca del cliente.
 */
export async function store(req, res, next) {
  try {
    const idPedido = parseId(req.body?.id_pedido);
    const idProducto = parseId(req.body?.id_producto);
    const cantidad = parseCantidad(req.body?.cantidad);

    if (!idPedido || !idProducto) {
      return res.status(400).json({
        success: false,
        message: 'IDs requeridos',
        code: 'MISSING_IDS',
      });
    }

    if (!cantidad) {
      return res.status(422).json({
        success: false,
        message: 'La cantidad debe ser un número entero mayor a 0.',
        code: 'INVALID_CANTIDAD',
      });
    }

    const producto = await prisma.producto.findUnique({
      where: { id_producto: idProducto },
      select: { id_producto: true, precio_venta: true, Estado: true },
    });

    if (!producto || producto.Estado !== 1) {
      return res.status(422).json({
        success: false,
        message: 'El producto no existe o está inactivo.',
        code: 'PRODUCTO_INACTIVO',
      });
    }

    if (producto.precio_venta === null || producto.precio_venta === undefined) {
      return res.status(422).json({
        success: false,
        message: 'El producto no tiene precio de venta configurado.',
        code: 'PRODUCTO_SIN_PRECIO',
      });
    }

    const item = await transaccionSalon(async (tx) => {
      await permitirDetalle(tx, idPedido, req.user);
      return tx.detalle_pedido.create({
        data: {
          id_pedido: idPedido,
          id_producto: idProducto,
          Cantidad: cantidad,
          // El precio SIEMPRE se toma del servidor: nunca del cliente.
          Precio_unitario: producto.precio_venta,
        },
        include: RELACIONES,
      });
    });
    res.status(201).json({ success: true, message: 'Creado', data: item });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(422).json({
        success: false,
        message: 'El pedido o el producto indicado no existe.',
        code: 'FK_INVALID',
      });
    }

    next(error);
  }
}

/**
 * PUT /api/detalle-pedido/:id
 * Solo permite cambiar la cantidad, y solo si el pedido está ABIERTO.
 * id_pedido, id_producto y precio_unitario no se aceptan del cliente.
 */
export async function update(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        success: false,
        message: 'El id del detalle debe ser un número entero válido',
        code: 'INVALID_ID',
      });
    }

    const actual = await prisma.detalle_pedido.findUnique({
      where: { id_detalle: id },
      select: { id_pedido: true },
    });

    if (!actual) {
      return res.status(404).json({
        success: false,
        message: 'No encontrado',
        code: 'NOT_FOUND',
      });
    }

    const data = {};

    if (req.body?.cantidad !== undefined) {
      const cantidad = parseCantidad(req.body.cantidad);

      if (!cantidad) {
        return res.status(422).json({
          success: false,
          message: 'La cantidad debe ser un número entero mayor a 0.',
          code: 'INVALID_CANTIDAD',
        });
      }

      data.Cantidad = cantidad;
    }

    const item = await transaccionSalon(async (tx) => {
      await permitirDetalle(tx, actual.id_pedido, req.user);
      return tx.detalle_pedido.update({
        where: { id_detalle: id },
        data,
        include: RELACIONES,
      });
    });
    res.status(200).json({ success: true, message: 'Actualizado', data: item });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/detalle-pedido/:id
 * Solo si el pedido está ABIERTO y el ítem no está facturado.
 */
export async function destroy(req, res, next) {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(422).json({
        success: false,
        message: 'El id del detalle debe ser un número entero válido',
        code: 'INVALID_ID',
      });
    }

    const actual = await prisma.detalle_pedido.findUnique({
      where: { id_detalle: id },
      select: { id_pedido: true },
    });

    if (!actual) {
      return res.status(404).json({
        success: false,
        message: 'No encontrado',
        code: 'NOT_FOUND',
      });
    }

    await transaccionSalon(async (tx) => {
      await permitirDetalle(tx, actual.id_pedido, req.user);
      await tx.detalle_pedido.delete({ where: { id_detalle: id } });
    });

    res.status(200).json({ success: true, message: 'Eliminado' });
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(409).json({
        success: false,
        message: 'El ítem ya está asociado a una factura y no se puede eliminar.',
        code: 'ITEM_FACTURADO',
      });
    }

    next(error);
  }
}
