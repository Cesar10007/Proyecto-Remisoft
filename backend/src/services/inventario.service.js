import { ErrorSalon } from '../utils/salon.js';
import { cantidadInventarioValida } from '../utils/validation.js';
import { Prisma } from '../generated/prisma/client.js';

// Réplica en la API de la validación de sp_registrar_movimiento_inventario:
// antes de una SALIDA se verifica que haya stock suficiente.
// El stock se calcula con los movimientos (ENTRADA - SALIDA), igual que
// inventario.controller.js.

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

// El listado, el conteo y la validación de las comandas usan el mismo saldo.
// Sumar en milésimas evita movimientos residuales al corregir, p. ej., 19.6 a 20.
function variacionMilesimas(tipo, cantidad) {
  const n = Math.round(Number(cantidad ?? 0) * DECIMALES);
  return tipo === 'ENTRADA' ? n : tipo === 'SALIDA' ? -n : 0;
}

export function calcularStockActual(movimientos) {
  return movimientos.reduce((saldo, m) => saldo + variacionMilesimas(m.tipo_movimiento, m.cantidad), 0) / DECIMALES;
}

async function saldosEnMilesimas(tx, ids, idRestaurante) {
  const movimientos = await tx.inventario_mov.groupBy({
    by: ['id_ingrediente', 'tipo_movimiento'],
    where: { id_restaurante: idRestaurante, id_ingrediente: { in: ids } },
    _sum: { cantidad: true },
  });
  const saldos = new Map(ids.map(id => [id, 0]));
  for (const m of movimientos) {
    saldos.set(m.id_ingrediente, saldos.get(m.id_ingrediente) + variacionMilesimas(m.tipo_movimiento, m._sum.cantidad));
  }
  return saldos;
}

export function crearAjusteManual(tx, { id_restaurante, id_ingrediente, id_usuario }, tipo, cantidad, motivo) {
  return tx.inventario_mov.create({ data: {
    id_restaurante, id_ingrediente, id_usuario, fecha_hora: new Date(),
    tipo_movimiento: tipo, cantidad, origen_tipo: 'AJUSTE', observaciones: motivo,
  } });
}

// La transacción ya tiene bloqueada la fila de Ingrediente (UPDATE de la ficha).
export async function conciliarConteo(tx, origen, esperado, contado, motivo) {
  const { id_restaurante, id_ingrediente } = origen;
  const saldo = (await saldosEnMilesimas(tx, [id_ingrediente], id_restaurante)).get(id_ingrediente);
  if (saldo / DECIMALES !== esperado) {
    throw new ErrorSalon(409, `El stock cambió de ${esperado} a ${saldo / DECIMALES}. No se guardó el cambio. Cierra y vuelve a abrir el ingrediente para revisar el conteo.`);
  }
  const diferencia = Math.round(contado * DECIMALES) - saldo;
  if (!diferencia) return null;
  const cantidad = Math.abs(diferencia) / DECIMALES;
  if (!cantidadInventarioValida(cantidad)) throw new ErrorSalon(422, 'La diferencia supera la cantidad máxima de un movimiento (9999999.999).');
  return crearAjusteManual(tx, origen, diferencia > 0 ? 'ENTRADA' : 'SALIDA', cantidad, motivo);
}

/** Verifica los requerimientos de una comanda contra su inventario, ya bloqueado. */
export async function verificarStockIngredientes(tx, requerimientos, idRestaurante) {
  if (!Array.isArray(requerimientos) || requerimientos.length === 0) return [];
  const ids = [...new Set(requerimientos.map(r => r.id_ingrediente))];
  const saldos = await saldosEnMilesimas(tx, ids, idRestaurante);
  const faltantes = requerimientos
    .map((r) => ({
      id_ingrediente: r.id_ingrediente,
      requerido: redondear(r.requerido),
      disponible: saldos.get(r.id_ingrediente) / DECIMALES,
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
