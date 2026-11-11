import prisma from '../config/prisma.js';
import { verificarStockIngredientes } from '../services/inventario.service.js';

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
 * Lista ingredientes con stock en lotes activos menor o igual a su mínimo.
 * Lee de vista_inventario_bajo_minimo (fuente: lote_ingrediente).
 */
export async function stockBajo(req, res, next) {
  try {
    const filas = await prisma.$queryRaw`
      SELECT id_ingrediente, ingrediente, unidad_medida, stock_minimo,
             stock_total_actual, alerta
      FROM vista_inventario_bajo_minimo
    `;

    const data = filas.map((fila) => ({
      id_ingrediente: fila.id_ingrediente,
      nombre: fila.ingrediente,
      unidad_medida: fila.unidad_medida,
      stock_minimo: Number(fila.stock_minimo ?? 0),
      stock_actual: Number(fila.stock_total_actual ?? 0),
      alerta: fila.alerta,
    }));

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

const TIPOS_AJUSTE = new Set(['ENTRADA', 'SALIDA']);

/**
 * POST /api/inventario/ajuste
 * Ajuste manual de inventario fuera del flujo automático.
 * - El usuario sale del JWT (req.user), nunca del body.
 * - El motivo es obligatorio.
 * - Si es SALIDA, se valida stock suficiente antes de registrar.
 */
export async function ajuste(req, res, next) {
  try {
    const idIngrediente = parseIngredientId(req.body?.id_ingrediente);
    const tipo =
      typeof req.body?.tipo === 'string'
        ? req.body.tipo.trim().toUpperCase()
        : '';
    const motivo =
      typeof req.body?.motivo === 'string' ? req.body.motivo.trim() : '';
    const cantidad = Number(req.body?.cantidad);
    const idUsuario = req.user?.id_usuario ?? null;

    if (!idIngrediente) {
      return res.status(422).json({
        success: false,
        message: 'id_ingrediente debe ser un entero positivo.',
        code: 'INVALID_INGREDIENTE_ID',
      });
    }

    if (!TIPOS_AJUSTE.has(tipo)) {
      return res.status(422).json({
        success: false,
        message: 'El tipo de ajuste debe ser ENTRADA o SALIDA.',
        code: 'INVALID_TIPO',
      });
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return res.status(422).json({
        success: false,
        message: 'La cantidad debe ser un número mayor a 0.',
        code: 'INVALID_CANTIDAD',
      });
    }

    if (motivo.length < 5 || motivo.length > 1000) {
      return res.status(422).json({
        success: false,
        message: 'El motivo es obligatorio (entre 5 y 1000 caracteres).',
        code: 'INVALID_MOTIVO',
      });
    }

    const ingrediente = await prisma.ingrediente.findUnique({
      where: { id_ingrediente: idIngrediente },
      select: { id_ingrediente: true, nombre: true },
    });

    if (!ingrediente) {
      return res.status(404).json({
        success: false,
        message: 'El ingrediente no existe.',
        code: 'INGREDIENTE_NOT_FOUND',
      });
    }

    const movimiento = await prisma.$transaction(async (tx) => {
      if (tipo === 'SALIDA') {
        await verificarStockIngredientes(tx, [
          { id_ingrediente: idIngrediente, requerido: cantidad },
        ]);
      }

      return tx.inventario_mov.create({
        data: {
          id_ingrediente: idIngrediente,
          id_usuario: idUsuario,
          fecha_hora: new Date(),
          tipo_movimiento: tipo,
          cantidad,
          origen_tipo: 'AJUSTE',
          observaciones: motivo,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Ajuste de inventario registrado.',
      data: movimiento,
    });
  } catch (error) {
    next(error);
  }
}
