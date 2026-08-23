import prisma from '../config/prisma.js';

const TIPOS_MOVIMIENTO_SUMA = new Set(['ENTRADA']);
const TIPOS_MOVIMIENTO_RESTA = new Set(['SALIDA']);

function parseIngredientId(value) {
  const id = Number.parseInt(value, 10);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function calcularStockActual(movimientos) {
  return movimientos.reduce((total, movimiento) => {
    const cantidad = Number(movimiento.cantidad ?? 0);

    if (TIPOS_MOVIMIENTO_SUMA.has(movimiento.tipo_movimiento)) {
      return total + cantidad;
    }

    if (TIPOS_MOVIMIENTO_RESTA.has(movimiento.tipo_movimiento)) {
      return total - cantidad;
    }

    return total;
  }, 0);
}

function serializarIngrediente(ingrediente) {
  const stockActual = calcularStockActual(ingrediente.inventario_mov);

  return {
    id_ingrediente: ingrediente.id_ingrediente,
    nombre: ingrediente.nombre,
    descripcion: ingrediente.descripcion,
    unidad_medida: ingrediente.unidad_medida,
    costo_unitario_ref: ingrediente.costo_unitario_ref,
    stock_minimo: ingrediente.stock_minimo,
    stock_actual: stockActual,
    stock_bajo: stockActual <= Number(ingrediente.stock_minimo ?? 0),
    movimientos: ingrediente.inventario_mov.length,
  };
}

/**
 * GET /api/inventario
 * Lista ingredientes con stock calculado desde inventario_mov.
 */
export async function index(req, res, next) {
  try {
    const idIngrediente = req.query.id_ingrediente
      ? parseIngredientId(req.query.id_ingrediente)
      : null;

    if (req.query.id_ingrediente && !idIngrediente) {
      return res.status(400).json({
        success: false,
        message: 'id_ingrediente debe ser un entero positivo.',
        code: 'INVALID_INGREDIENTE_ID',
      });
    }

    const ingredientes = await prisma.ingrediente.findMany({
      where: idIngrediente ? { id_ingrediente: idIngrediente } : undefined,
      include: {
        inventario_mov: {
          select: {
            tipo_movimiento: true,
            cantidad: true,
          },
        },
      },
      orderBy: {
        id_ingrediente: 'asc',
      },
    });

    const inventario = ingredientes.map(serializarIngrediente);
    const soloStockBajo = req.query.stock_minimo === 'true';
    const data = soloStockBajo
      ? inventario.filter((item) => item.stock_bajo)
      : inventario;

    return res.status(200).json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventario/:id
 * Obtiene un ingrediente con stock calculado e historial de movimientos.
 */
export async function show(req, res, next) {
  try {
    const idIngrediente = parseIngredientId(req.params.id);

    if (!idIngrediente) {
      return res.status(400).json({
        success: false,
        message: 'El ID debe ser un entero positivo.',
        code: 'INVALID_INGREDIENTE_ID',
      });
    }

    const ingrediente = await prisma.ingrediente.findUnique({
      where: {
        id_ingrediente: idIngrediente,
      },
      include: {
        inventario_mov: {
          orderBy: {
            fecha_hora: 'desc',
          },
        },
      },
    });

    if (!ingrediente) {
      return res.status(404).json({
        success: false,
        message: 'Ingrediente no encontrado.',
        code: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...serializarIngrediente(ingrediente),
        historial_movimientos: ingrediente.inventario_mov,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventario/alertas/stock-bajo
 * Lista ingredientes cuyo stock calculado está en o bajo su mínimo.
 */
export async function stockBajo(req, res, next) {
  try {
    const ingredientes = await prisma.ingrediente.findMany({
      include: {
        inventario_mov: {
          select: {
            tipo_movimiento: true,
            cantidad: true,
          },
        },
      },
      orderBy: {
        id_ingrediente: 'asc',
      },
    });

    const data = ingredientes
      .map(serializarIngrediente)
      .filter((item) => item.stock_bajo);

    return res.status(200).json({
      success: true,
      data,
      count: data.length,
      message: `${data.length} ingredientes con stock bajo.`,
    });
  } catch (error) {
    next(error);
  }
}
