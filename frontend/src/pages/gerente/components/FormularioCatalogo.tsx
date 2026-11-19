import type { ReactNode } from 'react'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'

interface FormularioCatalogoProps {
  title: string
  open?: boolean
  saving: boolean
  edit: boolean
  error: string | null
  close: () => void
  submit: () => void
  children: ReactNode
}

export default function FormularioCatalogo({ title, open = true, saving, edit, error, close, submit, children }: FormularioCatalogoProps) {
  return (
    <Modal title={title} isOpen={open} onClose={close} busy={saving}>
      <form aria-busy={saving} onSubmit={event => {
        event.preventDefault()
        if (!saving) submit()
      }}>
        <fieldset disabled={saving} className="grid min-w-0 grid-cols-1 gap-3">{children}</fieldset>
        {error && <p role="alert" className="mt-3 text-sm text-[var(--rojo-dark)]">{error}</p>}
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={close} disabled={saving}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : edit ? 'Actualizar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  )
}
