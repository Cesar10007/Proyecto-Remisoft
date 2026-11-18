import { createPortal } from 'react-dom'
import { useLayoutEffect, useId, useRef, type ReactNode } from 'react'

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
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  // En un enlace directo a una factura la capa puede montarse después del primer render.
  const capa = document.getElementById('sl-dialog-layer')
  useLayoutEffect(() => {
    const el = ref.current!
    const previo = document.body.style.overflow
    const origen = document.activeElement
    if (!el.open) el.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      el.close()
      document.body.style.overflow = previo
      if (origen instanceof HTMLElement && origen.isConnected) origen.focus({ preventScroll: true })
    }
  }, [capa])
  const contenido = (
    <dialog
      ref={ref}
      className={`sl-dialog ${amplio ? 'sl-dialog-wide' : ''} ${clase}`}
      aria-labelledby={id}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return
        const r = e.currentTarget.getBoundingClientRect()
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose()
      }}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
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
    </dialog>
  )
  return capa ? createPortal(contenido, capa) : contenido
}
