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

function respuestaPedidoNoAbierto(res) {
  return res.status(409).json({
    success: false,
    message: 'No se puede modificar un pedido que no está ABIERTO.',
    code: 'PEDIDO_NO_ABIERTO',
  });
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

    const item = await prisma.detalle_pedido.findUnique({
      where: { id_detalle: id },
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

    const pedido = await prisma.pedido.findUnique({
      where: { id_pedido: idPedido },
      select: { id_pedido: true, estado: true },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'El pedido no existe.',
        code: 'PEDIDO_NOT_FOUND',
      });
    }

    if (pedido.estado !== PEDIDO_EDITABLE) {
      return respuestaPedidoNoAbierto(res);
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

    const item = await prisma.detalle_pedido.create({
      data: {
        id_pedido: idPedido,
        id_producto: idProducto,
        Cantidad: cantidad,
        // El precio SIEMPRE se toma del servidor: nunca del cliente.
        Precio_unitario: producto.precio_venta,
      },
      include: RELACIONES,
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
      select: { id_detalle: true, pedido: { select: { estado: true } } },
    });

    if (!actual) {
      return res.status(404).json({
        success: false,
        message: 'No encontrado',
        code: 'NOT_FOUND',
      });
    }

    if (actual.pedido?.estado !== PEDIDO_EDITABLE) {
      return respuestaPedidoNoAbierto(res);
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

    const item = await prisma.detalle_pedido.update({
      where: { id_detalle: id },
      data,
      include: RELACIONES,
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
      select: { id_detalle: true, pedido: { select: { estado: true } } },
    });

    if (!actual) {
      return res.status(404).json({
        success: false,
        message: 'No encontrado',
        code: 'NOT_FOUND',
      });
    }

    if (actual.pedido?.estado !== PEDIDO_EDITABLE) {
      return respuestaPedidoNoAbierto(res);
    }

    await prisma.detalle_pedido.delete({ where: { id_detalle: id } });

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
