export type Importe = string | number | null
export interface ItemFactura {
  id_detalle: number
  nombre: string
  cantidad: number
  precio_unitario: number
}
export interface Factura {
  id_factura: number
  id_pedido: number
  consecutivo: string | null
  Fecha_emision: string | null
  receptor: string | null
  total: Importe
  IVA: Importe
  Propina: Importe
  Descuento: Importe
  tasa_iva: Importe
  estado: string | null
  editable: boolean
  pagada: boolean
  version_edicion: number
  pedido: { Mesa_num: number }
  pago: { metodo: string | null; estado: string | null }[]
}
export interface DetalleFactura extends Factura {
  items: ItemFactura[]
}
export const numeroFactura = (f: Factura) => f.consecutivo || `Factura #${f.id_factura}`
export const estadoFactura = (f: Factura) => (f.pagada ? 'PAGADA' : f.estado)
export const fechaFactura = (v: string | null) =>
  v
    ? new Date(v).toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Sin fecha'
