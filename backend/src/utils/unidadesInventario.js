import { Prisma } from "../generated/prisma/client.js";
import { ErrorSalon } from './salon.js';

// Códigos del selector de inventario. No hay equivalencias implícitas entre empaques, peso o conteo.
const codigos = new Map('kg g lb oz L ml ud pza caja bulto atado manojo bandeja'.split(' ').map(c => [c.toLowerCase(), c]));
codigos.set('unidad', 'ud'); // cliente/datos anteriores
const codigoDe = valor => typeof valor === 'string' ? codigos.get(valor.trim().toLowerCase()) : undefined;

export function unidadParaAlta(valor) {
  const codigo = codigoDe(valor);
  if (!codigo) throw new ErrorSalon(422, 'Selecciona una unidad de medida del catálogo.');
  return codigo;
}

// No basta con comprobar stock > 0: un saldo en cero aún puede tener historial.
export const referenciasDeUnidad = { select: { inventario_mov: true, Receta: true, lote_ingrediente: true, detalle_orden_compra: true, proveedor_ingrediente: true } };
export const unidadEnUso = conteos => Object.values(conteos).some(n => n > 0);

export function unidadParaEdicion(actual, nueva) {
  // No reescribir texto libre, diferencias de mayúsculas ni NULL al editar otro campo.
  if (nueva === undefined || nueva === actual || (nueva === '' && actual === null)) return actual;
  const codigo = unidadParaAlta(nueva);
  return codigoDe(actual) === codigo ? actual : codigo;
}

export function verificarUnidadEsperada(actual, esperada) {
  if (esperada !== undefined && esperada !== actual) {
    throw new ErrorSalon(409, 'La unidad de medida cambió. Cierra y vuelve a abrir el formulario para revisar las cantidades.');
  }
}

// Razón exacta del ingrediente: por ejemplo 30 pza = 1 bandeja, o 1 kg = 1000 g.
// Guardar ambos lados evita redondear 1/30 y crear diferencias de inventario.
export const medidaTrabajo = i => i.unidad_presentacion ?? i.unidad_medida;
const decimal = n => new Prisma.Decimal(n ?? 0);
const visible = (base, i, costo = false) => costo
  ? decimal(base).times(i.cantidad_base ?? 1).div(i.factor_unidad ?? 1).toDecimalPlaces(9)
  : decimal(base).times(i.factor_unidad ?? 1).div(i.cantidad_base ?? 1).toDecimalPlaces(9);
export const cantidadVisible = (base, i) => visible(base, i).toNumber();
export const costoVisible = i => i.costo_unitario_ref == null ? null : visible(i.costo_unitario_ref, i, true).toString();

export function verificarPresentacion(i, { unidad_esperada, factor_esperado, base_esperada }) {
  verificarUnidadEsperada(medidaTrabajo(i), unidad_esperada);
  if ((i.unidad_presentacion != null && [unidad_esperada,factor_esperado,base_esperada].includes(undefined)) ||
    (factor_esperado !== undefined && Number(factor_esperado) !== Number(i.factor_unidad)) ||
    (base_esperada !== undefined && Number(base_esperada) !== Number(i.cantidad_base))) {
    throw new ErrorSalon(409, 'Cambió la equivalencia de la unidad. Vuelve a abrir el formulario.');
  }
}

export function cambioDeUnidad(i, enUso, datos) {
  const actual = medidaTrabajo(i);
  const nueva = datos.unidad_medida === i.unidad_medida ? i.unidad_medida : unidadParaEdicion(actual, datos.unidad_medida);
  if (actual === nueva) return {};
  if (!enUso && i.unidad_presentacion == null && datos.factor_unidad === undefined) return { unidad_medida: nueva };
  const { factor_unidad, cantidad_base } = datos;
  if (datos.unidad_esperada === undefined || factor_unidad === undefined || cantidad_base === undefined) {
    throw new ErrorSalon(409, 'La unidad tiene historial. Confirma la equivalencia para cambiarla.');
  }
  const valida = n => /^\d{1,7}(?:\.\d{1,6})?$/.test(String(n)) && n > 0 && n <= 1000000;
  const factor = Number(factor_unidad) / Number(cantidad_base);
  if (!valida(factor_unidad) || !valida(cantidad_base) || factor < 0.000001 || factor > 1000000) throw new ErrorSalon(422, 'Indica una equivalencia válida entre ambas unidades (hasta seis decimales).');
  const base = nueva === i.unidad_medida || unidadParaEdicion(i.unidad_medida, nueva) === i.unidad_medida;
  const si = { 'kg:g': 1000, 'g:kg': 0.001, 'l:ml': 1000, 'ml:l': 0.001 }[`${i.unidad_medida}:${nueva}`.toLowerCase()];
  if (si && factor !== si) throw new ErrorSalon(422, 'La equivalencia entre estas unidades métricas no es correcta.');
  if (base && factor !== 1) throw new ErrorSalon(422, 'En la unidad histórica la equivalencia debe ser 1 a 1.');
  return { unidad_presentacion: base ? null : nueva, factor_unidad: base ? 1 : Number(factor_unidad), cantidad_base: base ? 1 : Number(cantidad_base) };
}

export function cantidadBase(valor, i, { cero = false, escala = 3, costo = false } = {}) {
  if (!['string','number'].includes(typeof valor) || String(valor).length > 32 || !/^\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(String(valor)) || !Number.isFinite(Number(valor))) throw new ErrorSalon(422, 'Indica una cantidad numérica válida.');
  const n = decimal(valor), a = i.cantidad_base ?? 1, b = i.factor_unidad ?? 1;
  const base = (costo ? n.times(b).div(a) : n.times(a).div(b)).toDecimalPlaces(escala);
  if ((!cero && base.isZero()) || !visible(base, i, costo).equals(n) || base.gte(10 ** (10 - escala))) {
    throw new ErrorSalon(422, `La cantidad no es representable en la unidad base (máximo ${escala} decimales).`);
  }
  return base.toNumber();
}
