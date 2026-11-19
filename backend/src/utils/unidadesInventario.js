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
