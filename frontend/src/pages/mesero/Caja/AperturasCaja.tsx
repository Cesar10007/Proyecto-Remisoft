import { useEffect, useMemo, useState } from 'react'
import api from '../../../api/axios'
import { DataTable } from '../../../components/common/DataTable'
import { Badge } from '../../../components/common/Badge'
import DetalleModal from '../DetalleModal'
import { formatCOP } from '../utils'

// Forma de GET /api/turnos/aperturas (solo los campos que usamos).
interface AperturaApi {
  id_turno: number
  fecha_apertura: string | null
  fecha_cierre: string | null
  efectivo_inicial: string | number | null
  estado: string | null
  caja: { nombre: string | null } | null
  usuario: { nombre: string | null; apellido: string | null } | null
}

interface AperturasCajaProps {
  onBack: () => void
}

const ZONA = 'America/Bogota'

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { timeZone: ZONA }) : '—'

const hora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: ZONA }) : '—'

const responsable = (u: AperturaApi['usuario']) => [u?.nombre, u?.apellido].filter(Boolean).join(' ') || '—'

const esActiva = (a: AperturaApi) => a.estado === 'ABIERTA'

function AperturasCaja({ onBack }: AperturasCajaProps) {
  const [aperturas, setAperturas] = useState<AperturaApi[]>([])
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
      .get<{ data: AperturaApi[] }>('/turnos/aperturas')
      .then(({ data }) => setAperturas(data.data))
      .catch((err) => setError(err?.response?.data?.message ?? 'No fue posible cargar las aperturas.'))
      .finally(() => setCargando(false))
  }, [])

  const aperturaActiva = useMemo(() => aperturas.find(esActiva) ?? null, [aperturas])

  const aperturasFiltradas = aperturas.filter((a) => {
    if (!filtroEstado) return true
    return filtroEstado === 'ABIERTA' ? esActiva(a) : !esActiva(a)
  })

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
          <h1 className="text-[1.5rem] font-bold">Aperturas de caja</h1>
          <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
            Consulta las aperturas registradas. Las aperturas se gestionan desde el panel de Gerente.
          </p>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[var(--rojo)]">{error}</p>}

      {/* ESTADO ACTUAL */}
      <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold">Estado actual de la caja</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Información de la apertura activa</p>
          </div>
          {aperturaActiva ? (
            <span className="flex items-center gap-2 rounded-full bg-[var(--t-bg-dcfce7,#dcfce7)] px-3 py-1.5 text-sm font-semibold text-[var(--t-txt-166534,#166534)]">
              <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
              Abierta
            </span>
          ) : (
            <span className="rounded-full bg-[var(--wa-surface-high)] px-3 py-1.5 text-sm font-semibold text-[var(--wa-text-muted)]">
              Sin caja abierta
            </span>
          )}
        </div>

        {aperturaActiva && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">payments</span>
                <span className="text-sm">Monto inicial</span>
              </div>
              <p className="text-[1.3rem] font-bold">{formatCOP(Number(aperturaActiva.efectivo_inicial ?? 0))}</p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">person</span>
                <span className="text-sm">Responsable</span>
              </div>
              <p className="font-bold">{responsable(aperturaActiva.usuario)}</p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">calendar_today</span>
                <span className="text-sm">Fecha</span>
              </div>
              <p className="font-bold">{fecha(aperturaActiva.fecha_apertura)}</p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">schedule</span>
                <span className="text-sm">Hora de apertura</span>
              </div>
              <p className="font-bold">{hora(aperturaActiva.fecha_apertura)}</p>
            </div>
          </div>
        )}
      </div>

      {/* HISTORIAL */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold">Historial de aperturas</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Consulta las aperturas realizadas anteriormente.</p>
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
                {[
                  { valor: '', texto: 'Todos' },
                  { valor: 'ABIERTA', texto: 'Abierta' },
                  { valor: 'CERRADA', texto: 'Cerrada' },
                ].map((op) => (
                  <button
                    key={op.texto}
                    type="button"
                    onClick={() => {
                      setFiltroEstado(op.valor)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      filtroEstado === op.valor ? 'font-bold text-[var(--wa-primary)]' : ''
                    }`}
                  >
                    {op.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DataTable
          columns={[
            { header: 'Fecha', render: (a) => fecha(a.fecha_apertura) },
            { header: 'Hora', render: (a) => hora(a.fecha_apertura) },
            { header: 'Caja', render: (a) => a.caja?.nombre ?? '—' },
            { header: 'Responsable', render: (a) => responsable(a.usuario) },
            { header: 'Monto inicial', render: (a) => formatCOP(Number(a.efectivo_inicial ?? 0)) },
            {
              header: 'Estado',
              render: (a) => (
                <Badge status={esActiva(a) ? 'active' : 'inactive'} label={esActiva(a) ? 'Abierta' : 'Cerrada'} />
              ),
            },
            {
              header: 'Acción',
              render: (a) => (
                <button
                  type="button"
                  onClick={() =>
                    setDetalle({
                      open: true,
                      title: 'Apertura de caja',
                      rows: [
                        { label: 'Fecha', value: fecha(a.fecha_apertura) },
                        { label: 'Hora', value: hora(a.fecha_apertura) },
                        { label: 'Caja', value: a.caja?.nombre ?? '—' },
                        { label: 'Responsable', value: responsable(a.usuario) },
                        { label: 'Monto inicial', value: formatCOP(Number(a.efectivo_inicial ?? 0)) },
                        { label: 'Cierre', value: a.fecha_cierre ? `${fecha(a.fecha_cierre)} ${hora(a.fecha_cierre)}` : '—' },
                        { label: 'Estado', value: esActiva(a) ? 'Abierta' : 'Cerrada' },
                      ],
                    })
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver apertura"
                >
                  <span className="material-symbols-outlined text-[1.2rem]">visibility</span>
                </button>
              ),
            },
          ]}
          data={aperturasFiltradas}
          isLoading={cargando}
          emptyMessage="No hay aperturas para mostrar."
          keyExtractor={(a) => a.id_turno}
        />
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

export default AperturasCaja
