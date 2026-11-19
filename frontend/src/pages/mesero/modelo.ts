import type { MesaLectura, Consumo } from './Mesas/lectura'
export { mesaN, estadoMesa, etiquetas } from './Mesas/lectura'
export type { Plato } from './Mesas/lectura'
export type Mesa = MesaLectura & {
  atencion: { id_atencion: number; comensales: number; desde: string } | null
}
export const admitePedido = (m: Mesa) => !m.ocupada || !!m.atencion
export type Pedido = Consumo & {
  version: number
  pago_registrado: boolean
  id_factura: number | null
  total_factura_pendiente: number | null
  id_cliente: number | null
  cliente: string
}
export type Salon = { sede: string; mesas: Mesa[]; pedidos: Pedido[]; tasa_iva: number }
export type Producto = {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  categoria: string
}
export type Carta = { productos: Producto[]; clientes: { id: number; nombre: string }[] }
export type Editor = {
  modo: 'nuevo' | 'editar' | 'ronda'
  mesa: number | null
  pedido?: Pedido
  comensales?: number
}
export const unidades = (p: Pedido) => p.items.reduce((s, i) => s + i.cantidad, 0)
export const editable = (p: Pedido) =>
  !p.pago_registrado && p.estado === 'ABIERTO' && p.items.every((i) => i.estado === 'PENDIENTE')
export const entregado = (p: Pedido) => p.items.length > 0 && p.items.every((i) => i.estado === 'ENTREGADO')
export const normalizar = (s: string) =>
  s
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
export { mensajeError } from '../../utils/mensajeError'
