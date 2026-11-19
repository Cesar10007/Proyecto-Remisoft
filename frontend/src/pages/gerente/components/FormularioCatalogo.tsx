import type { ReactNode } from 'react'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'

interface FormularioCatalogoProps {
  entidad: 'Producto' | 'Proveedor' | 'Ingrediente' | 'Caja'
  open?: boolean
  saving: boolean
  edit: boolean
  error: string | null
  close: () => void
  submit: () => void
  children: ReactNode
}

export default function FormularioCatalogo({ entidad, open = true, saving, edit, error, close, submit, children }: FormularioCatalogoProps) {
  const title = `${edit ? 'Editar' : entidad === 'Caja' ? 'Nueva' : 'Nuevo'} ${entidad}`
  const objeto = `${entidad === 'Caja' ? 'la' : 'el'} ${entidad.toLowerCase()}`
  return (
    <Modal title={title} isOpen={open} onClose={close} busy={saving}>
      <form aria-label={title} aria-description={edit ? 'Revisa los datos de la ficha antes de guardar los cambios.' : 'Completa los datos de la nueva ficha.'} aria-busy={saving} onSubmit={event => {
        event.preventDefault()
        if (!saving) submit()
      }}>
        <fieldset disabled={saving} className="grid min-w-0 grid-cols-1 gap-3">{children}</fieldset>
        {error && <p role="alert" className="mt-3 text-sm text-[var(--rojo-dark)]">{error}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button aria-description="Cierra el formulario sin guardar los cambios." variant="outline" onClick={close} disabled={saving}>Cancelar</Button>
          <Button aria-description={edit ? `Guarda los cambios en ${objeto}.` : `Registra ${objeto} con los datos del formulario.`} type="submit" disabled={saving}>{saving ? 'Guardando...' : edit ? 'Actualizar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  )
}
