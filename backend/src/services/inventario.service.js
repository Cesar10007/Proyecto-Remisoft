import { ErrorSalon } from '../utils/salon.js';
import { Prisma } from '../generated/prisma/client.js';

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

// Mismo orden de bloqueo para cada operación que consume/devuelve ingredientes:
// entre una lectura de stock y su movimiento no puede intercalarse otra salida.
export async function bloquearIngredientes(tx, ids, idRestaurante) {
  if (ids.length) {
    const unicos = [...new Set(ids)];
    const filas = await tx.$queryRaw`SELECT id_ingrediente FROM Ingrediente WHERE id_restaurante = ${idRestaurante}
      AND id_ingrediente IN (${Prisma.join(unicos)}) ORDER BY id_ingrediente FOR UPDATE`;
    if (filas.length !== unicos.length) throw new ErrorSalon(409, 'Hay un ingrediente sin asignar a este establecimiento.');
  }
}

/**
 * Verifica stock contra una lista ya calculada de requerimientos
 * [{ id_ingrediente, requerido }].
 * Lanza StockInsuficienteError si falta algo.
 */
export async function verificarStockIngredientes(tx, requerimientos, idRestaurante) {
  if (!Array.isArray(requerimientos) || requerimientos.length === 0) {
    return [];
  }

  const ids = [...new Set(requerimientos.map((r) => r.id_ingrediente))];

  const movimientos = await tx.inventario_mov.groupBy({
    by: ['id_ingrediente', 'tipo_movimiento'],
    where: { id_restaurante: idRestaurante, id_ingrediente: { in: ids } },
    _sum: { cantidad: true },
  });

  const stock = new Map(ids.map((id) => [id, 0]));

  for (const mov of movimientos) {
    const actual = stock.get(mov.id_ingrediente) ?? 0;

    if (TIPOS_SUMA.has(mov.tipo_movimiento)) {
      stock.set(mov.id_ingrediente, actual + numero(mov._sum.cantidad));
    } else if (TIPOS_RESTA.has(mov.tipo_movimiento)) {
      stock.set(mov.id_ingrediente, actual - numero(mov._sum.cantidad));
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
    const ingredientes = await tx.ingrediente.findMany({
      where: { id_restaurante: idRestaurante, id_ingrediente: { in: faltantes.map((f) => f.id_ingrediente) } },
      select: { id_ingrediente: true, nombre: true, unidad_medida: true },
    });
    throw new StockInsuficienteError(
      faltantes.map((f) => ({ ...f, ...ingredientes.find((i) => i.id_ingrediente === f.id_ingrediente) })),
    );
  }

  return faltantes;
}

/**
 * Convierte items de pedido [{ id_producto, cantidad }] en requerimientos
 * de ingredientes usando la Receta de cada producto.
 */
export async function calcularRequerimientos(tx, items, idRestaurante) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  const idsProductos = [...new Set(items.map((i) => i.id_producto))];

  if (idsProductos.length === 0) {
    return [];
  }

  if (await tx.producto.count({ where: { id_producto: { in: idsProductos }, id_restaurante: idRestaurante } }) !== idsProductos.length) {
    throw new ErrorSalon(409, 'El pedido contiene productos sin asignar a este establecimiento.');
  }
  const recetas = await tx.receta.findMany({
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
export async function verificarStockSuficiente(tx, items, idRestaurante) {
  const requerimientos = await calcularRequerimientos(tx, items, idRestaurante);

  if (requerimientos.length === 0) {
    return { requerimientos };
  }

  await bloquearIngredientes(
    tx,
    requerimientos.map((r) => r.id_ingrediente),
    idRestaurante,
  );
  await verificarStockIngredientes(tx, requerimientos, idRestaurante);

  return { requerimientos };
}

/**
 * Registra las SALIDAS de inventario por consumo de una venta.
 * Debe llamarse DENTRO de la misma transacción del cobro.
 */
export async function registrarSalidasPorConsumo(
  tx,
  requerimientos,
  { id_usuario, id_restaurante, origen_tipo = 'VENTA', origen_id = null },
) {
  if (!Array.isArray(requerimientos) || requerimientos.length === 0) {
    return 0;
  }

  await tx.inventario_mov.createMany({
    data: requerimientos.map((r) => ({
      id_ingrediente: r.id_ingrediente,
      id_usuario,
      id_restaurante,
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
