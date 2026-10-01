import type { Caja, CrearCaja, CrearIngrediente, CrearProveedor, Ingrediente, Producto, Proveedor } from '../types'

type Props = {
  producto: Producto | Omit<Producto, 'id_producto'>
  ingrediente: Ingrediente | CrearIngrediente
  proveedor: Proveedor | CrearProveedor
  caja: Caja | CrearCaja
}

export default function GerenteModals({ producto, ingrediente, proveedor, caja }: Props) {
  return null
}
