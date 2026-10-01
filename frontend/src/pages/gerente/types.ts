export interface Producto {
  id_producto: number
  nombre: string
  descripcion: string
  precio_venta: number
  id_categoria: number
  categoria?: string
  tiempo_preparacion?: string
  estado: number
}

export interface Ingrediente {
  id_ingrediente: number
  nombre: string
  descripcion: string
  unidad_medida: string
  costo_unitario_ref: string
  stock_minimo: string
}

export interface Proveedor {
  id_proveedor: number
  nombre: string
  nombre_contacto: string
  telefono: string
  email: string
  direccion: string
  nit: string
  tipo_proveedor: string
  estado: string
}

export interface Caja {
  id_caja: number
  nombre: string
  estado: string
}

export type CrearIngrediente = Omit<Ingrediente, 'id_ingrediente'>
export type CrearProveedor = Omit<Proveedor, 'id_proveedor'>
export type CrearCaja = Omit<Caja, 'id_caja'>
