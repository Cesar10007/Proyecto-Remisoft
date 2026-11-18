import { useEffect, useId, useRef, type ReactNode } from 'react'

export default function DialogoGestion({ titulo, cerrar, ocupado, children }: {
  titulo: string; cerrar: () => void; ocupado?: boolean; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const dialogo = ref.current!
    dialogo.showModal()
    return () => dialogo.close()
  }, [])
  return (
    <dialog ref={ref} aria-labelledby={id} className="m-auto max-h-[85dvh] w-[min(32rem,94vw)] overflow-y-auto rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 text-[var(--texto)] shadow-xl backdrop:bg-black/50"
      onCancel={e => { e.preventDefault(); if (!ocupado) cerrar() }}>
      <header className="mb-4 flex items-start justify-between gap-4">
        <h2 id={id} className="font-['Syne'] text-lg font-bold">{titulo}</h2>
        <button type="button" disabled={ocupado} aria-label="Cerrar ventana" className="text-xl" onClick={cerrar}>×</button>
      </header>
      {children}
    </dialog>
  )
}
