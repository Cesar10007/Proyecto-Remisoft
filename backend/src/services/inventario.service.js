import prisma from '../config/prisma.js';

// Réplica en la API de la validación de sp_registrar_movimiento_inventario:
// antes de una SALIDA se verifica que haya stock suficiente.
// El stock se calcula con los movimientos (ENTRADA - SALIDA), igual que
// inventario.controller.js.

const TIPOS_SUMA = new Set(['ENTRADA']);
const TIPOS_RESTA = new Set(['SALIDA']);
const DECIMALES = 1000; // 3 decimales, como Decimal(10,3)

function numero(valor) {
  const n = Number(valor ?? 0);

  return Number.isFinite(n) ? n : 0;
}

function redondear(valor) {
  return Math.round(valor * DECIMALES) / DECIMALES;
}

export class StockInsuficienteError extends Error {
  constructor(faltantes) {
    super('Stock insuficiente para completar la operación.');

    this.name = 'StockInsuficienteError';
    this.statusCode = 409;
    this.code = 'STOCK_INSUFICIENTE';
    this.detalles = faltantes;
  }
}

/**
 * Verifica stock contra una lista ya calculada de requerimientos
 * [{ id_ingrediente, requerido }].
 * Lanza StockInsuficienteError si falta algo.
 */
export async function verificarStockIngredientes(tx, requerimientos) {
  if (!Array.isArray(requerimientos) || requerimientos.length === 0) {
    return [];
  }

  const cliente = tx ?? prisma;
  const ids = [...new Set(requerimientos.map((r) => r.id_ingrediente))];

  const movimientos = await cliente.inventario_mov.findMany({
    where: { id_ingrediente: { in: ids } },
    select: { id_ingrediente: true, tipo_movimiento: true, cantidad: true },
  });

  const stock = new Map(ids.map((id) => [id, 0]));

  for (const mov of movimientos) {
    const actual = stock.get(mov.id_ingrediente) ?? 0;

    if (TIPOS_SUMA.has(mov.tipo_movimiento)) {
      stock.set(mov.id_ingrediente, actual + numero(mov.cantidad));
    } else if (TIPOS_RESTA.has(mov.tipo_movimiento)) {
      stock.set(mov.id_ingrediente, actual - numero(mov.cantidad));
    }
  }

  const faltantes = requerimientos
    .map((r) => ({
      id_ingrediente: r.id_ingrediente,
      requerido: redondear(r.requerido),
      disponible: redondear(stock.get(r.id_ingrediente) ?? 0),
    }))
    .filter((r) => r.disponible < r.requerido);

  if (faltantes.length > 0) {
    throw new StockInsuficienteError(faltantes);
  }

  return faltantes;
}

/**
 * Convierte items de pedido [{ id_producto, cantidad }] en requerimientos
 * de ingredientes usando la Receta de cada producto.
 */
export async function calcularRequerimientos(tx, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const cliente = tx ?? prisma;
  const idsProductos = [...new Set(items.map((i) => i.id_producto))];

  if (idsProductos.length === 0) {
    return [];
  }

  const recetas = await cliente.Receta.findMany({
    where: { id_producto: { in: idsProductos } },
    select: {
      id_producto: true,
      id_ingrediente: true,
      Cantidad_necesaria: true,
    },
  });

  if (recetas.length === 0) {
    return [];
  }

  const acumulado = new Map();

  for (const item of items) {
    const factor = numero(item.cantidad);

    for (const receta of recetas) {
      if (receta.id_producto !== item.id_producto) {
        continue;
      }

      const requerido = numero(receta.Cantidad_necesaria) * factor;
      const previo = acumulado.get(receta.id_ingrediente) ?? 0;

      acumulado.set(receta.id_ingrediente, previo + requerido);
    }
  }

  return [...acumulado.entries()].map(([id_ingrediente, requerido]) => ({
    id_ingrediente,
    requerido: redondear(requerido),
  }));
}

/**
 * Verifica stock para un pedido completo (vía recetas) y devuelve los
 * requerimientos calculados para poder descontarlos después.
 */
export async function verificarStockSuficiente(tx, items) {
  const requerimientos = await calcularRequerimientos(tx, items);

  if (requerimientos.length === 0) {
    return { requerimientos };
  }

  await verificarStockIngredientes(tx, requerimientos);

  return { requerimientos };
}

/**
 * Registra las SALIDAS de inventario por consumo de una venta.
 * Debe llamarse DENTRO de la misma transacción del cobro.
 */
export async function registrarSalidasPorConsumo(
  tx,
  requerimientos,
  { id_usuario = null, origen_tipo = 'VENTA', origen_id = null } = {},
) {
  if (!Array.isArray(requerimientos) || requerimientos.length === 0) {
    return 0;
  }

  await tx.inventario_mov.createMany({
    data: requerimientos.map((r) => ({
      id_ingrediente: r.id_ingrediente,
      id_usuario,
      fecha_hora: new Date(),
      tipo_movimiento: 'SALIDA',
      cantidad: r.requerido,
      origen_tipo,
      origen_id,
      observaciones: `Consumo por venta (${origen_tipo} ${origen_id ?? 'N/A'})`,
    })),
  });

  return requerimientos.length;
}
