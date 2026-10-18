import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import api from '../../api/axios'

interface HeaderProps {
  seccionActiva: string
  nombreUsuario?: string
  // Texto bajo el título. Si no se indica, muestra el saludo con el nombre.
  subtitulo?: ReactNode
  // Controles propios de la sección (buscador, botones de acción).
  acciones?: ReactNode
}

interface AlertaStock {
  id_ingrediente: number
  nombre: string
  unidad_medida: string | null
  stock_minimo: number
  stock_actual: number
  alerta: 'SIN STOCK' | 'BAJO MÍNIMO'
}

// Encabezado de sección compartido: título, acciones y el usuario con su nombre.
// La campana muestra las alertas de stock bajo desde la base (GET /inventario/alertas/stock-bajo).
function Header({ seccionActiva, nombreUsuario = 'Usuario', subtitulo, acciones }: HeaderProps) {
  const inicial = nombreUsuario.trim()[0]?.toUpperCase() ?? '?'
  const [abierta, setAbierta] = useState(false)
  const [alertas, setAlertas] = useState<AlertaStock[] | null>(null)
  const [errorAlertas, setErrorAlertas] = useState<string | null>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)

  // Carga las alertas cada vez que se abre la campana.
  useEffect(() => {
    if (!abierta) return
    setErrorAlertas(null)
    setAlertas(null)
    api
      .get('/inventario/alertas/stock-bajo')
      .then(({ data }) => setAlertas(Array.isArray(data?.data) ? data.data : []))
      .catch((error: { response?: { status?: number } }) => {
        setErrorAlertas(
          error?.response?.status === 403
            ? 'Las alertas de inventario no están disponibles para tu rol.'
            : 'No se pudieron cargar las alertas.',
        )
      })
  }, [abierta])

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
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-['Syne'] text-[1.4rem] font-extrabold tracking-[-0.5px] text-[var(--texto)] md:text-[1.6rem]">
          {seccionActiva}
        </h1>
        <p className="mt-0.5 text-[0.85rem] text-[var(--texto-muted)]">
          {subtitulo ?? <>Bienvenido de nuevo, {nombreUsuario}</>}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {acciones}
        <div ref={contenedorRef} className="relative">
          <button
            type="button"
            aria-label="Notificaciones"
            aria-expanded={abierta}
            onClick={() => setAbierta(v => !v)}
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--borde)] bg-[var(--bg-card)] text-[var(--texto-muted)]"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          {abierta && (
            <div
              role="dialog"
              aria-label="Alertas de inventario"
              className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-4 text-left shadow-[var(--sombra)]"
            >
              <p className="mb-3 font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">Alertas de inventario</p>
              {errorAlertas ? (
                <p className="text-[0.8rem] text-[var(--texto-muted)]">{errorAlertas}</p>
              ) : alertas === null ? (
                <p className="text-[0.8rem] text-[var(--texto-muted)]">Cargando...</p>
              ) : alertas.length === 0 ? (
                <p className="text-[0.8rem] text-[var(--texto-muted)]">No hay ingredientes con stock bajo.</p>
              ) : (
                <ul className="max-h-72 space-y-2.5 overflow-y-auto">
                  {alertas.map(a => (
                    <li key={a.id_ingrediente} className="flex items-start justify-between gap-3 text-[0.8rem]">
                      <span className="font-medium text-[var(--texto)]">{a.nombre}</span>
                      <span className={a.alerta === 'SIN STOCK' ? 'whitespace-nowrap font-semibold text-[var(--rojo)]' : 'whitespace-nowrap text-[var(--texto-muted)]'}>
                        {a.stock_actual} / {a.stock_minimo} {a.unidad_medida ?? ''} · {a.alerta}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2.5 rounded-full border border-[var(--borde)] bg-[var(--bg-card)] py-1.5 pl-1.5 pr-3.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--rojo-light)] text-[0.85rem] font-bold text-[var(--rojo-dark)]">
            {inicial}
          </div>
          <span className="text-[0.85rem] font-medium text-[var(--texto)]">{nombreUsuario}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
