import { useEffect, useMemo, useState } from 'react'
import api from '../../../api/axios'
import DetalleModal from '../DetalleModal'
import { formatCOP } from '../utils'

// Forma de GET /api/turnos/gastos (solo los campos que usamos).
interface GastoApi {
  id_flujo: number
  fecha: string | null
  concepto: string | null
  egresos: string | number | null
  metodo: string | null
  referencia: string | null
  turno_caja: {
    fecha_apertura: string | null
    caja: { nombre: string | null } | null
    usuario: { nombre: string | null; apellido: string | null } | null
  } | null
}

interface GastosCajaProps {
  onBack: () => void
}

const ZONA = 'America/Bogota'

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { timeZone: ZONA }) : '—'

const hora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: ZONA }) : '—'

// Clave AAAA-MM-DD en hora de Bogotá, para comparar días y meses.
const claveDia = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-CA', { timeZone: ZONA }) : ''

const responsable = (g: GastoApi) => {
  const u = g.turno_caja?.usuario
  return [u?.nombre, u?.apellido].filter(Boolean).join(' ') || '—'
}

const monto = (g: GastoApi) => Number(g.egresos ?? 0)

function GastosCaja({ onBack }: GastosCajaProps) {
  const [gastos, setGastos] = useState<GastoApi[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroMetodo, setFiltroMetodo] = useState('')

  const [detalle, setDetalle] = useState<{ open: boolean; title: string; rows: { label: string; value: string }[] }>({
    open: false,
    title: '',
    rows: [],
  })

  useEffect(() => {
    api
      .get<{ data: GastoApi[] }>('/turnos/gastos')
      .then(({ data }) => setGastos(data.data))
      .catch((err) => setError(err?.response?.data?.message ?? 'No fue posible cargar los gastos.'))
      .finally(() => setCargando(false))
  }, [])

  const metodos = useMemo(
    () => Array.from(new Set(gastos.map((g) => g.metodo).filter((m): m is string => Boolean(m)))),
    [gastos],
  )

  const gastosFiltrados = gastos.filter((g) => (filtroMetodo ? g.metodo === filtroMetodo : true))

  const hoy = claveDia(new Date().toISOString())
  const mes = hoy.slice(0, 7)
  const totalHoy = gastos.filter((g) => claveDia(g.fecha) === hoy).reduce((s, g) => s + monto(g), 0)
  const totalMes = gastos.filter((g) => claveDia(g.fecha).startsWith(mes)).reduce((s, g) => s + monto(g), 0)
  const ultimo = gastos[0] ?? null

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
          <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Gastos menores</h1>
          <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
            Consulta los egresos registrados en la caja. Los gastos se registran desde la caja del turno.
          </p>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[var(--rojo)]">{error}</p>}

      {/* RESUMEN DE GASTOS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Gastos de hoy</span>
            <span className="text-[1.2rem]">🧾</span>
          </div>
          <p className="text-[1.5rem] font-black text-[var(--wa-text)]">{formatCOP(totalHoy)}</p>
          <p className="mt-1 text-xs text-[var(--wa-text-muted)]">{gastos.filter((g) => claveDia(g.fecha) === hoy).length} gastos hoy</p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Gastos del mes</span>
            <span className="text-[1.2rem]">📅</span>
          </div>
          <p className="text-[1.5rem] font-black text-[var(--wa-text)]">{formatCOP(totalMes)}</p>
          <p className="mt-1 text-xs text-[var(--wa-text-muted)]">Mes en curso (hora de Bogotá)</p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Último gasto</span>
            <span className="text-[1.2rem]">💵</span>
          </div>
          <p className="text-[1.5rem] font-black text-[var(--wa-text)]">{ultimo ? formatCOP(monto(ultimo)) : '—'}</p>
          <p className="mt-1 text-xs text-[var(--wa-text-muted)]">{ultimo?.concepto ?? 'Sin gastos registrados'}</p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Gastos registrados</span>
            <span className="text-[1.2rem]">📋</span>
          </div>
          <p className="text-[1.5rem] font-black text-[var(--wa-text)]">{gastos.length}</p>
          <p className="mt-1 text-xs text-[var(--wa-text-muted)]">Egresos de todos los turnos</p>
        </div>
      </div>

      {/* HISTORIAL */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold">Historial de gastos</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Egresos registrados en la caja.</p>
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
              <div className="absolute right-0 top-[calc(100%+4px)] z-10 w-56 rounded-[10px] border border-[var(--wa-border)] bg-white p-2 shadow-lg">
                {['', ...metodos].map((metodo) => (
                  <button
                    key={metodo || 'todos'}
                    type="button"
                    onClick={() => {
                      setFiltroMetodo(metodo)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      filtroMetodo === metodo ? 'font-bold text-[var(--wa-primary)]' : ''
                    }`}
                  >
                    {metodo || 'Todos los métodos'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[var(--wa-surface-low)] text-left text-sm">
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Hora</th>
                <th className="px-5 py-3 font-semibold">Concepto</th>
                <th className="px-5 py-3 font-semibold">Caja</th>
                <th className="px-5 py-3 font-semibold">Responsable</th>
                <th className="px-5 py-3 font-semibold">Método</th>
                <th className="px-5 py-3 font-semibold">Monto</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-sm text-[var(--wa-text-muted)]">Cargando gastos…</td>
                </tr>
              )}

              {!cargando && gastosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-sm text-[var(--wa-text-muted)]">No hay gastos para mostrar.</td>
                </tr>
              )}

              {gastosFiltrados.map((g) => (
                <tr key={g.id_flujo} className="border-t border-[var(--wa-border)]">
                  <td className="px-5 py-4 text-sm">{fecha(g.fecha)}</td>
                  <td className="px-5 py-4 text-sm">{hora(g.fecha)}</td>
                  <td className="px-5 py-4 text-sm font-medium">{g.concepto ?? '—'}</td>
                  <td className="px-5 py-4 text-sm">{g.turno_caja?.caja?.nombre ?? '—'}</td>
                  <td className="px-5 py-4 text-sm">{responsable(g)}</td>
                  <td className="px-5 py-4 text-sm">{g.metodo ?? '—'}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{formatCOP(monto(g))}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setDetalle({
                          open: true,
                          title: 'Gasto',
                          rows: [
                            { label: 'Fecha', value: `${fecha(g.fecha)} ${hora(g.fecha)}` },
                            { label: 'Concepto', value: g.concepto ?? '—' },
                            { label: 'Caja', value: g.turno_caja?.caja?.nombre ?? '—' },
                            { label: 'Responsable', value: responsable(g) },
                            { label: 'Método', value: g.metodo ?? '—' },
                            { label: 'Referencia', value: g.referencia || '—' },
                            { label: 'Monto', value: formatCOP(monto(g)) },
                          ],
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                      title="Ver gasto"
                    >
                      <span className="material-symbols-outlined text-[1.2rem]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
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

export default GastosCaja
