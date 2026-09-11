import { useState } from 'react'
import Modal from '../../../components/common/Modal'
import DetalleModal from '../DetalleModal'
import { formatCOP, ahora, inputStyle } from '../utils'
 
interface Apertura {
  id: number
  fecha: string
  hora: string
  responsable: string
  monto: number
  estado: 'Abierta' | 'Cerrada'
}
 
interface AperturasCajaProps {
  nombreUsuario: string
  onBack: () => void
}
 
function AperturasCaja({ nombreUsuario, onBack }: AperturasCajaProps) {
  const [aperturas, setAperturas] = useState<Apertura[]>([
    { id: 1, fecha: '02/09/2026', hora: '08:02 AM', responsable: 'Juan Pérez', monto: 100000, estado: 'Abierta' },
    { id: 2, fecha: '01/09/2026', hora: '07:58 AM', responsable: 'María Gómez', monto: 150000, estado: 'Cerrada' },
    { id: 3, fecha: '31/08/2026', hora: '08:05 AM', responsable: 'Carlos Rodríguez', monto: 120000, estado: 'Cerrada' },
  ])
 
  const [modalApertura, setModalApertura] = useState(false)
  const [nuevaApertura, setNuevaApertura] = useState({ monto: '' })
  const [error, setError] = useState<string | null>(null)
 
  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
 
  const [detalle, setDetalle] = useState<{ open: boolean; title: string; rows: { label: string; value: string }[] }>({
    open: false,
    title: '',
    rows: [],
  })
 
  const aperturaActiva = aperturas.find(a => a.estado === 'Abierta') ?? aperturas[0]
 
  const aperturasFiltradas = aperturas.filter(a => (filtroEstado ? a.estado === filtroEstado : true))
 
  const abrirRegistrar = () => {
    setNuevaApertura({ monto: '' })
    setError(null)
    setModalApertura(true)
  }
 
  const guardarApertura = () => {
    if (!nuevaApertura.monto) {
      setError('El monto inicial es obligatorio')
      return
    }
 
    const { fecha, hora } = ahora()
 
    setAperturas(prev => [
      { id: Date.now(), fecha, hora, responsable: nombreUsuario, monto: Number(nuevaApertura.monto), estado: 'Abierta' },
      ...prev.map(a => ({ ...a, estado: 'Cerrada' as const })),
    ])
 
    setModalApertura(false)
  }
 
  return (
    <section className="m-6">
 
      {/* ENCABEZADO */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
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
              Registra y consulta las aperturas realizadas.
            </p>
          </div>
        </div>
 
        <button
          type="button"
          onClick={abrirRegistrar}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--wa-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--wa-primary-dark)]"
        >
          <span className="material-symbols-outlined text-[1.2rem]">add</span>
          Registrar apertura
        </button>
      </div>
 
      {/* ESTADO ACTUAL */}
      <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold">Estado actual de la caja</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Información de la apertura activa</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-[#dcfce7] px-3 py-1.5 text-sm font-semibold text-[#166534]">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            {aperturaActiva.estado}
          </span>
        </div>
 
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">payments</span>
              <span className="text-sm">Monto inicial</span>
            </div>
            <p className="text-[1.3rem] font-bold">{formatCOP(aperturaActiva.monto)}</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">person</span>
              <span className="text-sm">Responsable</span>
            </div>
            <p className="font-bold">{aperturaActiva.responsable}</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">calendar_today</span>
              <span className="text-sm">Fecha</span>
            </div>
            <p className="font-bold">{aperturaActiva.fecha}</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">schedule</span>
              <span className="text-sm">Hora de apertura</span>
            </div>
            <p className="font-bold">{aperturaActiva.hora}</p>
          </div>
        </div>
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
                {['Todos', 'Abierta', 'Cerrada'].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setFiltroEstado(op === 'Todos' ? '' : op)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      (filtroEstado || 'Todos') === op ? 'font-bold text-[var(--wa-primary)]' : ''
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
 
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[var(--wa-surface-low)] text-left text-sm">
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Hora</th>
                <th className="px-5 py-3 font-semibold">Responsable</th>
                <th className="px-5 py-3 font-semibold">Monto inicial</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {aperturasFiltradas.map(a => (
                <tr key={a.id} className="border-t border-[var(--wa-border)]">
                  <td className="px-5 py-4 text-sm">{a.fecha}</td>
                  <td className="px-5 py-4 text-sm">{a.hora}</td>
                  <td className="px-5 py-4 text-sm font-medium">{a.responsable}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{formatCOP(a.monto)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        a.estado === 'Abierta' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[var(--wa-surface-high)] text-[var(--wa-text-muted)]'
                      }`}
                    >
                      {a.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setDetalle({
                          open: true,
                          title: 'Apertura de caja',
                          rows: [
                            { label: 'Fecha', value: a.fecha },
                            { label: 'Hora', value: a.hora },
                            { label: 'Responsable', value: a.responsable },
                            { label: 'Monto inicial', value: formatCOP(a.monto) },
                            { label: 'Estado', value: a.estado },
                          ],
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                      title="Ver apertura"
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
 
      {/* MODAL: REGISTRAR APERTURA */}
      <Modal isOpen={modalApertura} onClose={() => setModalApertura(false)}>
        <div className="px-6 pb-6">
          <h3 className="mb-5 font-bold">Registrar apertura</h3>
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Monto inicial *</label>
              <input
                type="number"
                placeholder="Ej: 100000"
                value={nuevaApertura.monto}
                onChange={e => setNuevaApertura({ monto: e.target.value })}
                style={inputStyle}
              />
            </div>
            {error && (
              <p className="rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">{error}</p>
            )}
            <div className="mt-2 flex justify-end gap-3">
              <button
                className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
                onClick={() => setModalApertura(false)}
              >
                Cancelar
              </button>
              <button
                className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 text-[0.875rem] font-semibold text-white"
                onClick={guardarApertura}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </Modal>
 
      <DetalleModal
        open={detalle.open}
        title={detalle.title}
        rows={detalle.rows}
        onClose={() => setDetalle(d => ({ ...d, open: false }))}
      />
 
    </section>
  )
}
 
export default AperturasCaja