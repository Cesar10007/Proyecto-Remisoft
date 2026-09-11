import Modal from '../../components/common/Modal'
 
interface DetalleModalProps {
  open: boolean
  title: string
  rows: { label: string; value: string }[]
  onClose: () => void
}
 
function DetalleModal({ open, title, rows, onClose }: DetalleModalProps) {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="px-6 pb-6">
        <h3 className="mb-5 font-bold">{title}</h3>
        <div className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between border-b border-[var(--borde)] pb-2">
              <span className="text-[0.85rem] font-semibold text-[var(--texto-muted)]">{r.label}</span>
              <span className="text-[0.9rem] font-bold text-[var(--texto)]">{r.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}
 
export default DetalleModal