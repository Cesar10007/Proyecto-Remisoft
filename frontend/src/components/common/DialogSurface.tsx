import { useLayoutEffect, useRef, type ReactNode } from 'react'
import './Modal.css'

interface DialogSurfaceProps {
  labelledBy: string
  className: string
  onClose: () => void
  children: ReactNode
}

export function DialogSurface({ labelledBy, className, onClose, children }: DialogSurfaceProps) {
  const ref = useRef<HTMLDialogElement>(null)
  useLayoutEffect(() => {
    const dialog = ref.current!
    // La capa modal nativa aísla el foco y se centra en la ventana, no en el panel.
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      className={`dialog-surface ${className}`}
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => {
        if (event.target !== event.currentTarget) return
        // El navegador entrega los clics en ::backdrop al propio <dialog>.
        const { left, right, top, bottom } = event.currentTarget.getBoundingClientRect()
        if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) onClose()
      }}
    >
      {children}
    </dialog>
  )
}
