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
export function mensajeError(err: unknown) {
  const data = (
    err as {
      response?: {
        data?: {
          message?: string
          detalles?: {
            id_ingrediente: number
            nombre?: string
            unidad_medida?: string
            requerido: number
            disponible: number
          }[]
        }
      }
    }
  )?.response?.data
  if (data?.detalles?.length)
    return (
      'Stock insuficiente. ' +
      data.detalles
        .map(
          (d) =>
            `${d.nombre || `Ingrediente ${d.id_ingrediente}`}: se necesitan ${d.requerido} ${d.unidad_medida ?? ''} y hay ${d.disponible}.`,
        )
        .join(' ')
    )
  return data?.message || 'No se pudo conectar con el servidor. Revisa la conexión e inténtalo de nuevo.'
}
