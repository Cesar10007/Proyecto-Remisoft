import type { ReactNode } from 'react'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import { InputField } from '../../../components/common/InputField'
import { SelectField } from '../../../components/common/SelectField'
import { TextAreaField } from '../../../components/common/TextAreaField'
import type { Caja, CrearCaja, CrearIngrediente, CrearProveedor, Ingrediente, Producto, Proveedor } from '../types'

interface Props {
  producto: Producto | Omit<Producto, 'id_producto'>
  ingrediente: Ingrediente | CrearIngrediente
  proveedor: Proveedor | CrearProveedor
  caja: Caja | CrearCaja
  productoOpen: boolean
  ingredienteOpen: boolean
  proveedorOpen: boolean
  cajaOpen: boolean
  editProducto: boolean
  editIngrediente: boolean
  editProveedor: boolean
  editCaja: boolean
  savingProducto: boolean
  savingIngrediente: boolean
  savingProveedor: boolean
  savingCaja: boolean
  errorProducto: string | null
  errorIngrediente: string | null
  errorProveedor: string | null
  errorCaja: string | null
  setProducto: (value: Producto | Omit<Producto, 'id_producto'>) => void
  setIngrediente: (value: Ingrediente | CrearIngrediente) => void
  setProveedor: (value: Proveedor | CrearProveedor) => void
  setCaja: (value: Caja | CrearCaja) => void
  closeProducto: () => void
  closeIngrediente: () => void
  closeProveedor: () => void
  closeCaja: () => void
  submitProducto: () => void
  submitIngrediente: () => void
  submitProveedor: () => void
  submitCaja: () => void
}

interface FormularioCatalogoProps {
  title: string
  open: boolean
  saving: boolean
  edit: boolean
  error: string | null
  close: () => void
  submit: () => void
  children: ReactNode
}

function FormularioCatalogo({ title, open, saving, edit, error, close, submit, children }: FormularioCatalogoProps) {
  return (
    <Modal title={title} isOpen={open} onClose={close} busy={saving}>
      <form aria-busy={saving} onSubmit={event => {
        event.preventDefault()
        if (!saving) submit()
      }}>
        {error && <p role="alert" className="mb-3 text-sm text-[var(--rojo-dark)]">{error}</p>}
        <div className="grid grid-cols-1 gap-3">{children}</div>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={close} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : edit ? 'Actualizar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  )
}

function GerenteModals({
  producto, ingrediente, proveedor, caja,
  productoOpen, ingredienteOpen, proveedorOpen, cajaOpen,
  editProducto, editIngrediente, editProveedor, editCaja,
  savingProducto, savingIngrediente, savingProveedor, savingCaja,
  errorProducto, errorIngrediente, errorProveedor, errorCaja,
  setProducto, setIngrediente, setProveedor, setCaja,
  closeProducto, closeIngrediente, closeProveedor, closeCaja,
  submitProducto, submitIngrediente, submitProveedor, submitCaja,
}: Props) {
  return (
    <>
      {/* Modal Producto */}
      <FormularioCatalogo
        title={editProducto ? 'Editar Producto' : 'Nuevo Producto'} open={productoOpen}
        saving={savingProducto} edit={editProducto} error={errorProducto}
        close={closeProducto} submit={submitProducto}>
        <InputField
          label="Nombre"
          placeholder="Nombre *"
          value={producto.Nombre}
          onChange={(e) => setProducto({ ...producto, Nombre: e.target.value })}
          required
        />
        <TextAreaField
          label="Descripción"
          placeholder="Descripción del producto"
          value={producto.Descripcion}
          onChange={(e) => setProducto({ ...producto, Descripcion: e.target.value })}
          rows={3}
        />
        <InputField
          label="Precio"
          type="number"
          placeholder="Precio *"
          value={producto.precio_venta}
          onChange={(e) => setProducto({ ...producto, precio_venta: e.target.value })}
          required
        />
        <InputField
          label="Categoría"
          placeholder="Categoría"
          value={producto.Categoria}
          onChange={(e) => setProducto({ ...producto, Categoria: e.target.value })}
        />
        <InputField
          label="Tiempo de preparación"
          placeholder="HH:MM:SS"
          value={producto.Tiempo_preparacion}
          onChange={(e) => setProducto({ ...producto, Tiempo_preparacion: e.target.value })}
        />
        <SelectField
          label="Estado"
          value={producto.Estado}
          onChange={(e) => setProducto({ ...producto, Estado: Number(e.target.value) })}
        >
          <option value={1}>Activo</option>
          <option value={0}>Inactivo</option>
        </SelectField>
      </FormularioCatalogo>

      {/* Modal Ingrediente */}
      <FormularioCatalogo
        title={editIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'} open={ingredienteOpen}
        saving={savingIngrediente} edit={editIngrediente} error={errorIngrediente}
        close={closeIngrediente} submit={submitIngrediente}>
        <InputField
          label="Nombre"
          placeholder="Nombre *"
          value={ingrediente.nombre}
          onChange={(e) => setIngrediente({ ...ingrediente, nombre: e.target.value })}
          required
        />
        <TextAreaField
          label="Descripción"
          placeholder="Descripción"
          value={ingrediente.descripcion}
          onChange={(e) => setIngrediente({ ...ingrediente, descripcion: e.target.value })}
          rows={2}
        />
        <InputField
          label="Unidad de medida"
          placeholder="Ej: Kg, Litro, Unidad"
          value={ingrediente.unidad_medida}
          onChange={(e) => setIngrediente({ ...ingrediente, unidad_medida: e.target.value })}
        />
        <InputField
          label="Costo unitario de referencia"
          type="number"
          placeholder="0"
          value={ingrediente.costo_unitario_ref}
          onChange={(e) => setIngrediente({ ...ingrediente, costo_unitario_ref: e.target.value })}
        />
        <InputField
          label="Stock mínimo"
          type="number" min="0" step="0.01"
          placeholder="0"
          value={ingrediente.stock_minimo}
          onChange={(e) => setIngrediente({ ...ingrediente, stock_minimo: e.target.value })}
        />
      </FormularioCatalogo>

      {/* Modal Proveedor */}
      <FormularioCatalogo
        title={editProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'} open={proveedorOpen}
        saving={savingProveedor} edit={editProveedor} error={errorProveedor}
        close={closeProveedor} submit={submitProveedor}>
        <InputField
          label="Nombre"
          placeholder="Nombre del proveedor *"
          value={proveedor.nombre}
          onChange={(e) => setProveedor({ ...proveedor, nombre: e.target.value })}
          required
        />
        <InputField
          label="Nombre de contacto"
          placeholder="Contacto"
          value={proveedor.nombre_contacto}
          onChange={(e) => setProveedor({ ...proveedor, nombre_contacto: e.target.value })}
        />
        <InputField
          label="Teléfono"
          placeholder="Teléfono"
          value={proveedor.telefono}
          onChange={(e) => setProveedor({ ...proveedor, telefono: e.target.value })}
        />
        <InputField
          label="Email"
          type="email"
          placeholder="Email"
          value={proveedor.email}
          onChange={(e) => setProveedor({ ...proveedor, email: e.target.value })}
        />
        <InputField
          label="Dirección"
          placeholder="Dirección"
          value={proveedor.direccion}
          onChange={(e) => setProveedor({ ...proveedor, direccion: e.target.value })}
        />
        <InputField
          label="NIT"
          placeholder="NIT"
          value={proveedor.nit}
          onChange={(e) => setProveedor({ ...proveedor, nit: e.target.value })}
        />
        <InputField
          label="Tipo de proveedor"
          placeholder="Tipo"
          value={proveedor.tipo_proveedor}
          onChange={(e) => setProveedor({ ...proveedor, tipo_proveedor: e.target.value })}
        />
        <SelectField
          label="Estado"
          value={proveedor.estado}
          onChange={(e) => setProveedor({ ...proveedor, estado: e.target.value })}
        >
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </SelectField>
      </FormularioCatalogo>

      {/* Modal Caja */}
      <FormularioCatalogo
        title={editCaja ? 'Editar Caja' : 'Nueva Caja'} open={cajaOpen}
        saving={savingCaja} edit={editCaja} error={errorCaja}
        close={closeCaja} submit={submitCaja}>
        <InputField
          label="Nombre de la caja"
          placeholder="Nombre de la caja *"
          value={caja.nombre}
          onChange={(e) => setCaja({ ...caja, nombre: e.target.value })}
          required
        />
        <SelectField
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
