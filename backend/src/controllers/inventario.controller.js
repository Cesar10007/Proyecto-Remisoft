import { cantidadInventarioValida } from '../utils/validation.js';
import { referenciasDeUnidad, unidadEnUso, verificarUnidadEsperada } from '../utils/unidadesInventario.js';
import prisma from '../config/prisma.js';
import { bloquearIngredientes, calcularStockActual, crearAjusteManual, verificarStockIngredientes } from '../services/inventario.service.js';
import { auditarAjusteInventario } from '../utils/auditoria.js';

function parseIngredientId(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 && id <= 2147483647 ? id : null;
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
    unidad_bloqueada: unidadEnUso(ingrediente._count),
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
      where: { ...req.sede, ...(idIngrediente ? { id_ingrediente: idIngrediente } : {}) },
      include: {
        _count: referenciasDeUnidad,
        inventario_mov: {
          where: req.sede,
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
        ...req.sede,
        id_ingrediente: idIngrediente,
      },
      include: {
        _count: referenciasDeUnidad,
        inventario_mov: {
          where: req.sede,
          orderBy: [{ fecha_hora: 'desc' }, { id_movimiento: 'desc' }],
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
 * Lotes de la sede + ajustes/consumos sin lote. No vuelve a sumar los movimientos ya aplicados a un lote.
 */
export async function stockBajo(req, res, next) {
  try {
    const idSede = req.sede.id_restaurante ?? null;
    const filas = await prisma.$queryRaw`
      SELECT id_ingrediente, ingrediente, unidad_medida, stock_minimo,
             stock_total_actual, alerta
      FROM vista_inventario_bajo_minimo
      WHERE (${idSede} IS NULL OR id_restaurante = ${idSede})
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

    if (!cantidadInventarioValida(req.body?.cantidad)) {
      return res.status(422).json({
        success: false,
        message: 'La cantidad debe estar entre 0.001 y 9999999.999, con hasta tres decimales.',
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
      where: { id_ingrediente: idIngrediente, ...req.sede },
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
      const [actual] = await bloquearIngredientes(tx, [idIngrediente], req.sede.id_restaurante);
      verificarUnidadEsperada(actual.unidad_medida, req.body.unidad_esperada);
      if (tipo === 'SALIDA') {
        await verificarStockIngredientes(tx, [
          { id_ingrediente: idIngrediente, requerido: cantidad },
        ], req.sede.id_restaurante);
      }

      return crearAjusteManual(tx, { ...req.sede, id_ingrediente: idIngrediente, id_usuario: idUsuario }, tipo, cantidad, motivo);
    });
    auditarAjusteInventario(req, movimiento, ingrediente.nombre);

    return res.status(201).json({
      success: true,
      message: 'Ajuste de inventario registrado.',
      data: movimiento,
    });
  } catch (error) {
    next(error);
  }
}
