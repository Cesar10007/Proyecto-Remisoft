import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import type { RootState } from '../../store/store'
import { useNotificaciones, type Aviso, type TipoAviso } from '../../hook/useNotificaciones'
import SelectorSede from './SelectorSede'

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

const GRUPOS: { tipo: TipoAviso; titulo: string; icono: string; clase: string }[] = [
  { tipo: 'preparar', titulo: 'Por preparar', icono: 'restaurant', clase: 'text-[var(--rojo)]' },
  { tipo: 'servir', titulo: 'Listos para servir', icono: 'room_service', clase: 'text-[var(--amarillo)]' },
]

// Un grupo de avisos dentro del panel (Por preparar / Listos para servir).
function GrupoAvisos({ tipo, titulo, icono, clase, avisos, alElegir }: (typeof GRUPOS)[number] & { avisos: Aviso[]; alElegir: (aviso: Aviso) => void }) {
  const propios = avisos.filter((aviso) => aviso.tipo === tipo)
  if (propios.length === 0) return null

  return (
    <div>
      <p className="mb-1.5 px-1 text-[0.64rem] font-bold uppercase tracking-wider text-[var(--texto-muted)]">{titulo}</p>
      <ul className="space-y-1.5">
        {propios.map((aviso) => (
          <li key={aviso.id}>
            <button
              type="button"
              onClick={() => alElegir(aviso)}
              className="w-full rounded-xl border border-[var(--borde)] px-2.5 py-2 text-left transition-colors hover:border-[var(--rojo-mid)] hover:bg-[var(--rojo-light)]"
            >
              <div className="flex items-center gap-1.5">
                <span className={`material-symbols-outlined text-[16px] ${clase}`}>{icono}</span>
                <span className="text-[0.78rem] font-semibold text-[var(--texto)]">{aviso.titulo}</span>
              </div>
              <p className="pl-[22px] text-[0.72rem] text-[var(--texto-muted)]">{aviso.detalle}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Encabezado de sección compartido: título, acciones y el usuario con su nombre.
// La campana cambia según el rol:
//   MESERO            -> pedidos por preparar y platos listos para servir
//   resto de los roles -> alertas de stock bajo (GET /inventario/alertas/stock-bajo)
function Header({ seccionActiva, nombreUsuario = 'Usuario', subtitulo, acciones }: HeaderProps) {
  const inicial = nombreUsuario.trim()[0]?.toUpperCase() ?? '?'
  const navigate = useNavigate()
  const rol = useSelector((state: RootState) => state.auth.rol)
  const idUsuario = useSelector((state: RootState) => state.auth.user?.id_usuario)
  const esMesero = rol === 'MESERO'

  const [abierta, setAbierta] = useState(false)
  const [alertas, setAlertas] = useState<AlertaStock[] | null>(null)
  const [errorAlertas, setErrorAlertas] = useState<string | null>(null)
  const contenedorRef = useRef<HTMLDivElement>(null)

  const { avisos, noLeidos, marcarTodoVisto, recargar, cargando, error } = useNotificaciones(esMesero, idUsuario)

  // Carga las alertas de inventario cada vez que se abre la campana (roles que no son mesero).
  useEffect(() => {
    if (!abierta || esMesero) return
    setErrorAlertas(null)
    setAlertas(null)
    api
      .get('/inventario/alertas/stock-bajo')
      .then(({ data }) => setAlertas(Array.isArray(data?.data) ? data.data : []))
      .catch((err: { response?: { status?: number } }) => {
        setErrorAlertas(
          err?.response?.status === 403
            ? 'Las alertas de inventario no están disponibles para tu rol.'
            : 'No se pudieron cargar las alertas.',
        )
      })
  }, [abierta, esMesero])

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

  const irAlPedido = (aviso: Aviso) => {
    setAbierta(false)
    navigate('/cocina', { state: { pedido: aviso.idPedido, tipo: aviso.tipo } })
  }

  const alternar = () => {
    const siguiente = !abierta
    setAbierta(siguiente)
    if (!siguiente) return
    if (esMesero) {
      marcarTodoVisto()
      recargar()
    }
  }

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
        <SelectorSede />
        <div ref={contenedorRef} className="relative">
          <button
            type="button"
            aria-label={noLeidos > 0 ? `Notificaciones (${noLeidos} nuevas)` : 'Notificaciones'}
            aria-expanded={abierta}
            onClick={alternar}
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--borde)] bg-[var(--bg-card)] text-[var(--texto-muted)]"
          >
            <span className="material-symbols-outlined text-[20px]">
              {noLeidos > 0 ? 'notifications_active' : 'notifications'}
            </span>
            {noLeidos > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--rojo)] px-1 text-[0.64rem] font-bold leading-none text-white">
                {noLeidos > 9 ? '9+' : noLeidos}
              </span>
            )}
          </button>
          {abierta && (
            <div
              role="dialog"
              aria-label={esMesero ? 'Novedades de pedidos' : 'Alertas de inventario'}
              className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-4 text-left shadow-[var(--sombra)]"
            >
              <p className="mb-3 font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">
                {esMesero ? 'Novedades de pedidos' : 'Alertas de inventario'}
              </p>

              {esMesero ? (
                error ? (
                  <p className="text-[0.8rem] text-[var(--texto-muted)]">{error}</p>
                ) : cargando && avisos.length === 0 ? (
                  <p className="text-[0.8rem] text-[var(--texto-muted)]">Cargando...</p>
                ) : avisos.length === 0 ? (
                  <p className="text-[0.8rem] text-[var(--texto-muted)]">No hay pedidos pendientes.</p>
                ) : (
                  <div className="max-h-80 space-y-3 overflow-y-auto">
                    {GRUPOS.map((grupo) => (
                      <GrupoAvisos key={grupo.tipo} {...grupo} avisos={avisos} alElegir={irAlPedido} />
                    ))}
                  </div>
                )
              ) : errorAlertas ? (
                <p className="text-[0.8rem] text-[var(--texto-muted)]">{errorAlertas}</p>
              ) : alertas === null ? (
                <p className="text-[0.8rem] text-[var(--texto-muted)]">Cargando...</p>
              ) : alertas.length === 0 ? (
                <p className="text-[0.8rem] text-[var(--texto-muted)]">No hay ingredientes con stock bajo.</p>
              ) : (
                <ul className="max-h-72 space-y-2.5 overflow-y-auto">
                  {alertas.map((alerta) => (
                    <li key={alerta.id_ingrediente} className="flex items-start justify-between gap-3 text-[0.8rem]">
                      <span className="font-medium text-[var(--texto)]">{alerta.nombre}</span>
                      <span className={alerta.alerta === 'SIN STOCK' ? 'whitespace-nowrap font-semibold text-[var(--rojo)]' : 'whitespace-nowrap text-[var(--texto-muted)]'}>
                        {alerta.stock_actual} / {alerta.stock_minimo} {alerta.unidad_medida ?? ''} · {alerta.alerta}
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
