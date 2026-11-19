// La unidad base se elige según cómo se cuenta el ingrediente, no según cómo lo vende el proveedor.
const unidad = (codigo: string, nombre: string, plural = `${nombre}s`) => ({ codigo, nombre, plural })
const empaques = [unidad('caja', 'Caja'), unidad('bulto', 'Bulto'), unidad('atado', 'Atado'), unidad('manojo', 'Manojo'), unidad('bandeja', 'Bandeja')]
export const gruposUnidades = [
  { nombre: 'Peso', opciones: [unidad('kg', 'Kilogramo'), unidad('g', 'Gramo'), unidad('lb', 'Libra'), unidad('oz', 'Onza')] },
  { nombre: 'Volumen', opciones: [unidad('L', 'Litro'), unidad('ml', 'Mililitro')] },
  { nombre: 'Conteo', opciones: [unidad('ud', 'Unidad', 'Unidades'), unidad('pza', 'Pieza')] },
  { nombre: 'Empaques', opciones: empaques },
]

// La demo usa KG y UNIDAD. Reconocer también los nombres que se podían escribir en la ficha anterior.
const alias = new Map(gruposUnidades.flatMap(({ opciones }) => opciones.flatMap(u =>
  [u.codigo, u.nombre, u.plural].map(nombre => [nombre.toLowerCase(), u] as const))))
export const unidadConocida = (valor: string | null | undefined) => alias.get(valor?.trim().toLowerCase() ?? '')
export const codigoUnidad = (valor: string | null | undefined) => unidadConocida(valor)?.codigo ?? valor?.trim() ?? ''
export const esEmpaque = (codigo: string) => empaques.some(u => u.codigo === codigo)
export function unidadDeCantidad(valor: string | null | undefined, cantidad?: number) {
  const u = unidadConocida(valor)
  return u && empaques.includes(u) && cantidad !== 1 ? u.plural.toLowerCase() : codigoUnidad(valor)
}
export function cantidadConUnidad(cantidad: number | string, valor: string | null | undefined) {
  return `${cantidad} ${unidadDeCantidad(valor, Number(cantidad))}`.trimEnd()
}
