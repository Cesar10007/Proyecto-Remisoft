import { unidadDeCantidad } from '../../utils/unidadesInventario'
import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useConsulta } from '../../hook/useConsulta'

interface AlertaStock {
  id_ingrediente: number
  nombre: string
  unidad_medida: string | null
  stock_minimo: number
  stock_actual: number
  alerta: 'SIN STOCK' | 'BAJO MÍNIMO'
}

export default function NotificacionesStock() {
  const [abierta, setAbierta] = useState(false)
  const consulta = useConsulta<{ data: AlertaStock[] }>(abierta ? '/inventario/alertas/stock-bajo' : null, 10000)
  const alertas = consulta.data?.data ?? null, errorAlertas = consulta.error
  const contenedorRef = useRef<HTMLDivElement>(null)

  // Cierra el panel al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!abierta) return
    const alPresionar = (evento: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) setAbierta(false)
    }
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierta(false)
    }
    document.addEventListener('mousedown', alPresionar)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alPresionar)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierta])

  return (
    <div ref={contenedorRef} className="relative">
      <button
        aria-description={abierta ? 'Oculta las alertas de inventario.' : 'Consulta los ingredientes agotados o bajo el mínimo.'}
        type="button"
        aria-label="Notificaciones"
        aria-expanded={abierta}
        onClick={() => setAbierta((v) => !v)}
        className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--borde)] bg-[var(--bg-card)] text-[var(--texto-muted)]"
      >
        <Bell size={17} aria-hidden="true" />
      </button>
      {abierta && (
        <div
          role="dialog"
          aria-label="Alertas de inventario"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-4 text-left shadow-[var(--sombra)]"
        >
          <p className="mb-3 font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">
            Alertas de inventario
          </p>
          {errorAlertas ? (
            <p className="text-[0.8rem] text-[var(--texto-muted)]">{errorAlertas}</p>
          ) : alertas === null ? (
            <p className="text-[0.8rem] text-[var(--texto-muted)]">Cargando...</p>
          ) : alertas.length === 0 ? (
            <p className="text-[0.8rem] text-[var(--texto-muted)]">
              No hay ingredientes en alerta para este establecimiento.
            </p>
          ) : (
            <ul className="max-h-72 space-y-2.5 overflow-y-auto">
              {alertas.map((a) => (
                <li key={a.id_ingrediente} className="flex items-start justify-between gap-3 text-[0.8rem]">
                  <span className="font-medium text-[var(--texto)]">{a.nombre}</span>
                  <span
                    className={
                      a.alerta === 'SIN STOCK'
                        ? 'whitespace-nowrap font-semibold text-[var(--rojo)]'
                        : 'whitespace-nowrap text-[var(--texto-muted)]'
                    }
                  >
                    {a.stock_actual} / {a.stock_minimo} {unidadDeCantidad(a.unidad_medida, a.stock_minimo)} · {a.alerta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
