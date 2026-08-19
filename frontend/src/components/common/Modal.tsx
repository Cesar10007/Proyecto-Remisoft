interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/55 z-[200] flex items-center justify-center p-5"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-bg-card rounded-xl p-7 max-w-[400px] w-full border border-borde">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full border border-borde bg-transparent cursor-pointer text-xs text-texto-muted flex items-center justify-center hover:bg-[#f0ebe5] transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal