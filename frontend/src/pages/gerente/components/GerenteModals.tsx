import FormularioCatalogo from './FormularioCatalogo'
import { InputField } from '../../../components/common/InputField'
import { SelectField } from '../../../components/common/SelectField'
import { TextAreaField } from '../../../components/common/TextAreaField'
import type { Caja, CrearCaja, CrearProveedor, Producto, Proveedor } from '../types'

interface Props {
  producto: Producto | Omit<Producto, 'id_producto'>
  proveedor: Proveedor | CrearProveedor
  caja: Caja | CrearCaja
  productoOpen: boolean
  proveedorOpen: boolean
  cajaOpen: boolean
  editProducto: boolean
  editProveedor: boolean
  editCaja: boolean
  savingProducto: boolean
  savingProveedor: boolean
  savingCaja: boolean
  errorProducto: string | null
  errorProveedor: string | null
  errorCaja: string | null
  setProducto: (value: Producto | Omit<Producto, 'id_producto'>) => void
  setProveedor: (value: Proveedor | CrearProveedor) => void
  setCaja: (value: Caja | CrearCaja) => void
  closeProducto: () => void
  closeProveedor: () => void
  closeCaja: () => void
  submitProducto: () => void
  submitProveedor: () => void
  submitCaja: () => void
}

function GerenteModals({
  producto, proveedor, caja,
  productoOpen, proveedorOpen, cajaOpen,
  editProducto, editProveedor, editCaja,
  savingProducto, savingProveedor, savingCaja,
  errorProducto, errorProveedor, errorCaja,
  setProducto, setProveedor, setCaja,
  closeProducto, closeProveedor, closeCaja,
  submitProducto, submitProveedor, submitCaja,
}: Props) {

  return (
    <>
      {/* Modal Producto */}
      <FormularioCatalogo
        entidad="Producto" open={productoOpen}
        saving={savingProducto} edit={editProducto} error={errorProducto}
        close={closeProducto} submit={submitProducto}>
        <InputField
          aria-description="Escribe el nombre que tendrá el producto en la carta."
          label="Nombre"
          placeholder="Nombre *"
          value={producto.Nombre}
          onChange={(e) => setProducto({ ...producto, Nombre: e.target.value })}
          required
        />
        <TextAreaField
          aria-description="Describe el plato para que sea fácil reconocerlo."
          label="Descripción"
          placeholder="Descripción del producto"
          value={producto.Descripcion}
          onChange={(e) => setProducto({ ...producto, Descripcion: e.target.value })}
          rows={3}
        />
        <InputField
          aria-description="Indica el precio de venta del producto en pesos."
          label="Precio"
          type="number"
          placeholder="Precio *"
          value={producto.precio_venta}
          onChange={(e) => setProducto({ ...producto, precio_venta: e.target.value })}
          required
        />
        <InputField
          aria-description="Indica en qué grupo de la carta aparecerá el producto."
          label="Categoría"
          placeholder="Categoría"
          value={producto.Categoria}
          onChange={(e) => setProducto({ ...producto, Categoria: e.target.value })}
        />
        <InputField
          aria-description="Escribe la duración en horas, minutos y segundos."
          label="Tiempo de preparación"
          placeholder="HH:MM:SS"
          value={producto.Tiempo_preparacion}
          onChange={(e) => setProducto({ ...producto, Tiempo_preparacion: e.target.value })}
        />
        <SelectField
          aria-description="Elige si el producto estará activo en la carta."
          label="Estado"
          value={producto.Estado}
          onChange={(e) => setProducto({ ...producto, Estado: Number(e.target.value) })}
        >
          <option value={1}>Activo</option>
          <option value={0}>Inactivo</option>
        </SelectField>
      </FormularioCatalogo>

      <FormularioCatalogo
        entidad="Proveedor" open={proveedorOpen}
        saving={savingProveedor} edit={editProveedor} error={errorProveedor}
        close={closeProveedor} submit={submitProveedor}>
        <InputField
          aria-description="Escribe el nombre comercial del proveedor."
          label="Nombre"
          placeholder="Nombre del proveedor *"
          value={proveedor.nombre}
          onChange={(e) => setProveedor({ ...proveedor, nombre: e.target.value })}
          required
        />
        <InputField
          aria-description="Indica a quién contactar para hacer un pedido."
          label="Nombre de contacto"
          placeholder="Contacto"
          value={proveedor.nombre_contacto}
          onChange={(e) => setProveedor({ ...proveedor, nombre_contacto: e.target.value })}
        />
        <InputField
          aria-description="Anota el número de contacto del proveedor."
          label="Teléfono"
          placeholder="Teléfono"
          value={proveedor.telefono}
          onChange={(e) => setProveedor({ ...proveedor, telefono: e.target.value })}
        />
        <InputField
          aria-description="Indica el correo de contacto del proveedor."
          label="Email"
          type="email"
          placeholder="Email"
          value={proveedor.email}
          onChange={(e) => setProveedor({ ...proveedor, email: e.target.value })}
        />
        <InputField
          aria-description="Anota la dirección del proveedor."
          label="Dirección"
          placeholder="Dirección"
          value={proveedor.direccion}
          onChange={(e) => setProveedor({ ...proveedor, direccion: e.target.value })}
        />
        <InputField
          aria-description="Indica el número de identificación tributaria del proveedor."
          label="NIT"
          placeholder="NIT"
          value={proveedor.nit}
          onChange={(e) => setProveedor({ ...proveedor, nit: e.target.value })}
        />
        <InputField
          aria-description="Describe el tipo de suministro que ofrece."
          label="Tipo de proveedor"
          placeholder="Tipo"
          value={proveedor.tipo_proveedor}
          onChange={(e) => setProveedor({ ...proveedor, tipo_proveedor: e.target.value })}
        />
        <SelectField
          aria-description="Elige si el proveedor estará activo en la sede."
          label="Estado"
          value={proveedor.estado}
          onChange={(e) => setProveedor({ ...proveedor, estado: e.target.value })}
        >
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </SelectField>
      </FormularioCatalogo>

      <FormularioCatalogo
        entidad="Caja" open={cajaOpen}
        saving={savingCaja} edit={editCaja} error={errorCaja}
        close={closeCaja} submit={submitCaja}>
        <InputField
          aria-description="Escribe un nombre para distinguir esta caja de las demás."
          label="Nombre de la caja"
          placeholder="Nombre de la caja *"
          value={caja.nombre}
          onChange={(e) => setCaja({ ...caja, nombre: e.target.value })}
          required
        />
        <SelectField
          aria-description="Elige si la caja estará disponible para abrir turnos."
          label="Estado"
          value={caja.estado}
          onChange={(e) => setCaja({ ...caja, estado: e.target.value })}
        >
          <option value="ACTIVA">Activa</option>
          <option value="INACTIVA">Inactiva</option>
        </SelectField>
      </FormularioCatalogo>
    </>
  )
}

export default GerenteModals
