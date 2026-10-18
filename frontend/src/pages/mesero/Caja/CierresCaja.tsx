import { useEffect, useMemo, useState } from 'react'
import api from '../../../api/axios'
import { DataTable } from '../../../components/common/DataTable'
import DetalleModal from '../DetalleModal'
import { formatCOP } from '../utils'

// Forma de GET /api/turnos/aperturas (solo los campos que usamos).
interface TurnoApi {
  id_turno: number
  fecha_apertura: string | null
  fecha_cierre: string | null
  efectivo_inicial: string | number | null
  efectivo_esperado: string | number | null
  efectivo_real: string | number | null
  diferencia: string | number | null
  notas: string | null
  estado: string | null
  caja: { nombre: string | null } | null
  usuario: { nombre: string | null; apellido: string | null } | null
}

interface CierresCajaProps {
  onBack: () => void
}

const ZONA = 'America/Bogota'

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-CO', { timeZone: ZONA }) : '—'

const hora = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: ZONA }) : '—'

const responsable = (u: TurnoApi['usuario']) => [u?.nombre, u?.apellido].filter(Boolean).join(' ') || '—'

const dinero = (valor: string | number | null) => (valor === null ? '—' : formatCOP(Number(valor)))

// Un turno aparece en cierres cuando ya no está ABIERTA.
const esCerrado = (t: TurnoApi) => t.estado !== 'ABIERTA'

function CierresCaja({ onBack }: CierresCajaProps) {
  const [turnos, setTurnos] = useState<TurnoApi[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroResponsable, setFiltroResponsable] = useState('')

  const [detalle, setDetalle] = useState<{ open: boolean; title: string; rows: { label: string; value: string }[] }>({
    open: false,
    title: '',
    rows: [],
  })

  useEffect(() => {
    api
      .get<{ data: TurnoApi[] }>('/turnos/aperturas')
      .then(({ data }) => setTurnos(data.data))
      .catch((err) => setError(err?.response?.data?.message ?? 'No fue posible cargar los cierres.'))
      .finally(() => setCargando(false))
  }, [])

  // Más reciente primero, por fecha de cierre.
  const cierres = useMemo(
    () =>
      turnos
        .filter(esCerrado)
        .sort((a, b) => new Date(b.fecha_cierre ?? 0).getTime() - new Date(a.fecha_cierre ?? 0).getTime()),
    [turnos],
  )

  const responsables = useMemo(
    () => Array.from(new Set(cierres.map((c) => responsable(c.usuario)).filter((r) => r !== '—'))),
    [cierres],
  )

  const cierresFiltrados = cierres.filter((c) => (filtroResponsable ? responsable(c.usuario) === filtroResponsable : true))

  const ultimo = cierres[0] ?? null

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
          <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Cierre de turno</h1>
          <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
            Consulta los cierres realizados. Los turnos se cierran desde el panel de Gerente.
          </p>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[var(--rojo)]">{error}</p>}

      {/* ÚLTIMO CIERRE */}
      <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-[1.05rem] font-bold">Último turno cerrado</h2>
          <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
            {ultimo ? 'Resumen del cierre más reciente.' : cargando ? 'Cargando…' : 'Todavía no hay turnos cerrados.'}
          </p>
        </div>

        {ultimo && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">person</span>
                <span className="text-sm">Responsable</span>
              </div>
              <p className="font-bold">{responsable(ultimo.usuario)}</p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">calendar_today</span>
                <span className="text-sm">Fecha de cierre</span>
              </div>
              <p className="font-bold">{fecha(ultimo.fecha_cierre)} {hora(ultimo.fecha_cierre)}</p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">calculate</span>
                <span className="text-sm">Efectivo esperado</span>
              </div>
              <p className="text-[1.3rem] font-bold">{dinero(ultimo.efectivo_esperado)}</p>
            </div>

            <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
                <span className="material-symbols-outlined text-[1.2rem]">point_of_sale</span>
                <span className="text-sm">Efectivo contado</span>
              </div>
              <p className="text-[1.3rem] font-bold">{dinero(ultimo.efectivo_real)}</p>
            </div>
          </div>
        )}
      </div>

      {/* HISTORIAL */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold">Historial de cierres</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Cierres de turnos anteriores.</p>
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
                {['', ...responsables].map((nombre) => (
                  <button
                    key={nombre || 'todos'}
                    type="button"
                    onClick={() => {
                      setFiltroResponsable(nombre)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      filtroResponsable === nombre ? 'font-bold text-[var(--wa-primary)]' : ''
                    }`}
                  >
                    {nombre || 'Todos'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DataTable
          columns={[
            { header: 'Fecha', render: (c) => fecha(c.fecha_cierre) },
            { header: 'Cierre', render: (c) => hora(c.fecha_cierre) },
            { header: 'Caja', render: (c) => c.caja?.nombre ?? '—' },
            { header: 'Responsable', render: (c) => responsable(c.usuario) },
            { header: 'Esperado', render: (c) => dinero(c.efectivo_esperado) },
            { header: 'Contado', render: (c) => dinero(c.efectivo_real) },
            {
              header: 'Diferencia',
              render: (c) => (
                <span className={`font-semibold ${Number(c.diferencia ?? 0) < 0 ? 'text-[var(--rojo)]' : ''}`}>
                  {dinero(c.diferencia)}
                </span>
              ),
            },
            {
              header: 'Acción',
              render: (c) => (
                <button
                  type="button"
                  onClick={() =>
                    setDetalle({
                      open: true,
                      title: 'Cierre de turno',
                      rows: [
                        { label: 'Apertura', value: `${fecha(c.fecha_apertura)} ${hora(c.fecha_apertura)}` },
                        { label: 'Cierre', value: `${fecha(c.fecha_cierre)} ${hora(c.fecha_cierre)}` },
                        { label: 'Caja', value: c.caja?.nombre ?? '—' },
                        { label: 'Responsable', value: responsable(c.usuario) },
                        { label: 'Efectivo inicial', value: dinero(c.efectivo_inicial) },
                        { label: 'Efectivo esperado', value: dinero(c.efectivo_esperado) },
                        { label: 'Efectivo contado', value: dinero(c.efectivo_real) },
                        { label: 'Diferencia', value: dinero(c.diferencia) },
                        { label: 'Notas', value: c.notas || '—' },
                      ],
                    })
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver cierre"
                >
                  <span className="material-symbols-outlined text-[1.2rem]">visibility</span>
                </button>
              ),
            },
          ]}
          data={cierresFiltrados}
          isLoading={cargando}
          emptyMessage="No hay cierres para mostrar."
          keyExtractor={(c) => c.id_turno}
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

export default CierresCaja
