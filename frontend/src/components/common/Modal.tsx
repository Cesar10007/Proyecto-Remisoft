import { useId, type ReactNode } from 'react'
import { DialogSurface } from './DialogSurface'

interface ModalProps {
  isOpen?: boolean
  title: string
  size?: 'compact' | 'normal' | 'wide'
  busy?: boolean
  onClose: () => void
  children: ReactNode
}

export default function Modal({ isOpen = true, title, size = 'normal', busy = false, onClose, children }: ModalProps) {
  const titleId = useId()
  if (!isOpen) return null
  return (
    <DialogSurface
      labelledBy={titleId}
      className={`app-modal app-modal--${size}`}
      onClose={() => { if (!busy) onClose() }}
    >
      <header className="app-modal__header">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="app-modal__close" aria-label="Cerrar ventana" disabled={busy} onClick={onClose}>×</button>
      </header>
      <div className="app-modal__body">{children}</div>
    </DialogSurface>
  )
}
