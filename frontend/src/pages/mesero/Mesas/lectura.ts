// Proyección de consulta de la mesa. No contiene cliente, pagos ni credenciales de edición.
export type Plato = {
  id_detalle: number
  id_producto: number
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  estado: string
  nota: string
}
export type Consumo = {
  id_pedido: number
  mesa: number
  estado: string
  nombre_mesero: string | null
  notas: string
  fecha_hora: string | null
  comensales: number | null
  items: Plato[]
  subtotal: number
  iva: number
  total: number
}
export type MesaLectura = {
  numero: number
  capacidad: number | null
  ocupada: boolean
  mesero: string | null
  fecha_hora: string | null
  comensales: number | null
  cuentas: Consumo[]
}
export const mesaN = (numero: number) => String(numero).padStart(2, '0')
export const estadoMesa = (mesa: MesaLectura) => (mesa.ocupada ? 'Ocupada' : 'Disponible')
export const etiquetas: Record<string, string> = {
  ABIERTO: 'Pendiente',
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En preparación',
  EN_PREPARACION: 'En preparación',
  PREPARANDO: 'En preparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  POR_COBRAR: 'En caja',
  PAGADA: 'Pagada',
  EMITIDA: 'Emitida',
  ANULADA: 'Anulada',
}
