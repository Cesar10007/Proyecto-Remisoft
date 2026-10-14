import { useEffect, useMemo, useState } from 'react'
import api from '../../../api/axios'
import DetalleModal from '../DetalleModal'
import { formatCOP } from '../utils'

// Forma de GET /api/turnos/arqueos (solo los campos que usamos).
interface ArqueoApi {
  id_turno: number
  fecha_apertura: string | null
  fecha_cierre: string | null
  efectivo_inicial: number | null
  esperado: number | null
  efectivo_real: number | null
  diferencia: number | null
  estado: string | null
  caja: { nombre: string | null } | null
  usuario: { nombre: string | null; apellido: string | null } | null
  ingresos: number
  egresos: number
}

interface ArqueosCajaProps {
  onBack: () => void
}

const ZONA = 'America/Bogota'

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { timeZone: ZONA }) : '—'

const hora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: ZONA }) : '—'

const responsable = (u: ArqueoApi['usuario']) => [u?.nombre, u?.apellido].filter(Boolean).join(' ') || '—'

const dinero = (valor: number | null) => (valor === null ? '—' : formatCOP(valor))

const estaAbierto = (a: ArqueoApi) => a.estado === 'ABIERTA'

// Estado del arqueo según la diferencia (contado − esperado).
function estadoDe(a: ArqueoApi): 'En curso' | 'Cuadrado' | 'Sobrante' | 'Faltante' {
  if (estaAbierto(a) || a.diferencia === null) return 'En curso'
  if (a.diferencia === 0) return 'Cuadrado'
  return a.diferencia > 0 ? 'Sobrante' : 'Faltante'
}

const COLOR_ESTADO: Record<ReturnType<typeof estadoDe>, string> = {
  'En curso': 'bg-[var(--wa-surface-high)] text-[var(--wa-text-muted)]',
  Cuadrado: 'bg-[var(--t-bg-dcfce7,#dcfce7)] text-[var(--t-txt-166534,#166534)]',
  Sobrante: 'bg-[#dbeafe] text-[#1e40af]',
  Faltante: 'bg-[rgba(239,68,68,0.12)] text-[var(--rojo)]',
}

function ArqueosCaja({ onBack }: ArqueosCajaProps) {
  const [arqueos, setArqueos] = useState<ArqueoApi[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')

  const [detalle, setDetalle] = useState<{ open: boolean; title: string; rows: { label: string; value: string }[] }>({
    open: false,
    title: '',
    rows: [],
  })

  useEffect(() => {
    api
      .get<{ data: ArqueoApi[] }>('/turnos/arqueos')
      .then(({ data }) => setArqueos(data.data))
      .catch((err) => setError(err?.response?.data?.message ?? 'No fue posible cargar los arqueos.'))
      .finally(() => setCargando(false))
  }, [])

  const arqueoActual = useMemo(() => arqueos.find(estaAbierto) ?? null, [arqueos])

  const arqueosFiltrados = arqueos.filter((a) => (filtroEstado ? estadoDe(a) === filtroEstado : true))

  return (
    <section className="m-6">

      {/* ENCABEZADO */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--wa-border)] bg-white transition hover:bg-[var(--wa-surface-low)]"
          title="Volver"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Arqueos de caja</h1>
          <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
            Compara el efectivo esperado con el contado. El conteo real se registra al cerrar el turno.
          </p>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[var(--rojo)]">{error}</p>}

      {/* ARQUEO ACTUAL */}
      <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">Arqueo actual</h2>
          <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
            {arqueoActual
              ? 'Efectivo esperado del turno abierto: inicial más ingresos menos egresos.'
              : cargando
                ? 'Cargando…'
                : 'No hay caja abierta en este momento.'}
          </p>
        </div>

        {arqueoActual && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">calculate</span>
                <span className="text-sm">Monto esperado</span>
              </div>
              <p className="text-[1.3rem] font-bold text-[var(--wa-text)]">{dinero(arqueoActual.esperado)}</p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">point_of_sale</span>
                <span className="text-sm">Monto contado</span>
              </div>
              <p className="text-[1.3rem] font-bold text-[var(--wa-text)]">Pendiente</p>
              <p className="mt-1 text-xs text-[var(--wa-text-muted)]">Se registra al cerrar el turno.</p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">trending_up</span>
                <span className="text-sm">Movimientos</span>
              </div>
              <p className="font-bold text-[var(--wa-text)]">
                +{formatCOP(arqueoActual.ingresos)} / −{formatCOP(arqueoActual.egresos)}
              </p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">person</span>
                <span className="text-sm">Responsable</span>
              </div>
              <p className="font-bold text-[var(--wa-text)]">{responsable(arqueoActual.usuario)}</p>
            </div>
          </div>
        )}
      </div>

      {/* HISTORIAL */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">Historial de arqueos</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Un arqueo por cada turno de caja.</p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFiltro(!openFiltro)}
              className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--wa-surface-low)]"
            >
              <span className="material-symbols-outlined text-[1.1rem]">filter_list</span>
              Filtrar
            </button>

            {openFiltro && (
              <div className="absolute right-0 top-[calc(100%+4px)] z-10 w-44 rounded-[10px] border border-[var(--wa-border)] bg-white p-2 shadow-lg">
                {['', 'En curso', 'Cuadrado', 'Sobrante', 'Faltante'].map((op) => (
                  <button
                    key={op || 'todos'}
                    type="button"
                    onClick={() => {
                      setFiltroEstado(op)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      filtroEstado === op ? 'font-bold text-[var(--wa-primary)]' : ''
                    }`}
                  >
                    {op || 'Todos'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[var(--wa-surface-low)] text-left text-sm">
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Hora</th>
                <th className="px-5 py-3 font-semibold">Caja</th>
                <th className="px-5 py-3 font-semibold">Responsable</th>
                <th className="px-5 py-3 font-semibold">Esperado</th>
                <th className="px-5 py-3 font-semibold">Contado</th>
                <th className="px-5 py-3 font-semibold">Diferencia</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={9} className="px-5 py-6 text-center text-sm text-[var(--wa-text-muted)]">Cargando arqueos…</td>
                </tr>
              )}

              {!cargando && arqueosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-6 text-center text-sm text-[var(--wa-text-muted)]">No hay arqueos para mostrar.</td>
                </tr>
              )}

              {arqueosFiltrados.map((a) => {
                const estado = estadoDe(a)
                return (
                  <tr key={a.id_turno} className="border-t border-[var(--wa-border)]">
                    <td className="px-5 py-4 text-sm">{fecha(a.fecha_apertura)}</td>
                    <td className="px-5 py-4 text-sm">{hora(a.fecha_apertura)}</td>
                    <td className="px-5 py-4 text-sm">{a.caja?.nombre ?? '—'}</td>
                    <td className="px-5 py-4 text-sm font-medium">{responsable(a.usuario)}</td>
                    <td className="px-5 py-4 text-sm">{dinero(a.esperado)}</td>
                    <td className="px-5 py-4 text-sm">{estaAbierto(a) ? 'Pendiente' : dinero(a.efectivo_real)}</td>
                    <td
                      className={`px-5 py-4 text-sm font-semibold ${
                        a.diferencia !== null && a.diferencia < 0 ? 'text-[var(--rojo)]' : ''
                      }`}
                    >
                      {estaAbierto(a) ? '—' : dinero(a.diferencia)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${COLOR_ESTADO[estado]}`}>{estado}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setDetalle({
                            open: true,
                            title: 'Arqueo de caja',
                            rows: [
                              { label: 'Apertura', value: `${fecha(a.fecha_apertura)} ${hora(a.fecha_apertura)}` },
                              { label: 'Caja', value: a.caja?.nombre ?? '—' },
                              { label: 'Responsable', value: responsable(a.usuario) },
                              { label: 'Efectivo inicial', value: dinero(a.efectivo_inicial) },
                              { label: 'Ingresos', value: formatCOP(a.ingresos) },
                              { label: 'Egresos', value: formatCOP(a.egresos) },
                              { label: 'Esperado', value: dinero(a.esperado) },
                              { label: 'Contado', value: estaAbierto(a) ? 'Pendiente' : dinero(a.efectivo_real) },
                              { label: 'Diferencia', value: estaAbierto(a) ? '—' : dinero(a.diferencia) },
                              { label: 'Estado', value: estado },
                            ],
                          })
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                        title="Ver arqueo"
                      >
                        <span className="material-symbols-outlined text-[1.2rem]">visibility</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DetalleModal
        open={detalle.open}
        title={detalle.title}
        rows={detalle.rows}
        onClose={() => setDetalle((d) => ({ ...d, open: false }))}
      />

    </section>
  )
}

export default ArqueosCaja
