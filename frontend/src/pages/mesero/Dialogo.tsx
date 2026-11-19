import { createPortal } from 'react-dom'
import { useId, type ReactNode } from 'react'
import { DialogSurface } from '../../components/common/DialogSurface'

export function Dialogo({
  titulo,
  kicker,
  onClose,
  children,
  amplio = false,
  clase = '',
}: {
  titulo: string
  kicker: string
  onClose: () => void
  children: ReactNode
  clase?: string
  amplio?: boolean
}) {
  const id = useId()
  // Conserva el diálogo en la capa que se muestra al imprimir la factura.
  const capa = document.getElementById('sl-dialog-layer')
  const contenido = (
    <DialogSurface
      labelledBy={id}
      className={`sl-dialog ${amplio ? 'sl-dialog-wide' : ''} ${clase}`}
      onClose={onClose}
    >
      <div className="sl-dialog-head">
        <div>
          <p className="sl-eyebrow">{kicker}</p>
          <h2 id={id}>{titulo}</h2>
        </div>
        <button type="button" className="sl-iconbtn" aria-label="Cerrar ventana" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {children}
    </DialogSurface>
  )
  return capa ? createPortal(contenido, capa) : contenido
}
