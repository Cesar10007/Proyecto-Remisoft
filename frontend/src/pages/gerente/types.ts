export interface Producto {
  id_producto: number
  Nombre: string
  Descripcion: string
  precio_venta: string
  Categoria: string
  Tiempo_preparacion: string
  Estado: number
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

export interface Personal {
  id_usuario: number
  id_rol: number
  nombre: string
  apellido: string
  email: string
  rol: string | null
  estado: string
  activo: number
}