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
  unidad_medida: string | null
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

export type CrearIngrediente = Omit<Ingrediente, 'id_ingrediente' | 'unidad_medida'> & { unidad_medida: string }
export type CrearProveedor = Omit<Proveedor, 'id_proveedor'>
export type CrearCaja = Omit<Caja, 'id_caja'>

export interface MesaGerente { id_mesa?: number; numero: number; capacidad: number | null; ocupada: boolean }
export interface IngredienteConStock extends Ingrediente { stock_actual: number; stock_bajo: boolean; requiere_equivalencia?: boolean; unidad_bloqueada?: boolean; unidad_base?: string | null; factor_unidad?: number; cantidad_base?: number }
