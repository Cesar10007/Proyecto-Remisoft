import { useState } from 'react'
import Modal from '../../../components/common/Modal'
import DetalleModal from '../DetalleModal'
import { formatCOP, ahora, inputStyle } from '../utils'
 
interface Cierre {
  id: number
  fecha: string
  turno: string
  responsable: string
  montoInicial: number
  ventas: number
  montoFinal: number
  estado: string
}
 
interface CierresCajaProps {
  nombreUsuario: string
  onBack: () => void
}
 
function CierresCaja({ nombreUsuario, onBack }: CierresCajaProps) {
  const [cierres, setCierres] = useState<Cierre[]>([
    { id: 1, fecha: '01/09/2026', turno: '08:00 AM - 06:00 PM', responsable: 'María Gómez', montoInicial: 150000, ventas: 850000, montoFinal: 980000, estado: 'Cerrado' },
    { id: 2, fecha: '31/08/2026', turno: '08:05 AM - 05:45 PM', responsable: 'Carlos Rodríguez', montoInicial: 120000, ventas: 720000, montoFinal: 840000, estado: 'Cerrado' },
    { id: 3, fecha: '30/08/2026', turno: '08:00 AM - 06:10 PM', responsable: 'Juan Pérez', montoInicial: 100000, ventas: 690000, montoFinal: 790000, estado: 'Cerrado' },
  ])
 
  const [modalCierre, setModalCierre] = useState(false)
  const [nuevoCierre, setNuevoCierre] = useState({ ventas: '', montoFinal: '' })
  const [error, setError] = useState<string | null>(null)
 
  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroResponsable, setFiltroResponsable] = useState('')
 
  const [detalle, setDetalle] = useState<{ open: boolean; title: string; rows: { label: string; value: string }[] }>({
    open: false,
    title: '',
    rows: [],
  })
 
  const cierresFiltrados = cierres.filter(c => (filtroResponsable ? c.responsable === filtroResponsable : true))
 
  const abrirRegistrar = () => {
    setNuevoCierre({ ventas: '', montoFinal: '' })
    setError(null)
    setModalCierre(true)
  }
 
  const guardarCierre = () => {
    if (!nuevoCierre.ventas || !nuevoCierre.montoFinal) {
      setError('Las ventas y el monto final son obligatorios')
      return
    }
 
    const { fecha, hora } = ahora()
 
    setCierres(prev => [
      {
        id: Date.now(),
        fecha,
        turno: `— - ${hora}`,
        responsable: nombreUsuario,
        montoInicial: 0,
        ventas: Number(nuevoCierre.ventas),
        montoFinal: Number(nuevoCierre.montoFinal),
        estado: 'Cerrado',
      },
      ...prev,
    ])
 
    setModalCierre(false)
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
            <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Cierre de turno</h1>
            <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
              Consulta los cierres realizados durante los turnos.
            </p>
          </div>
        </div>
 
        <button
          type="button"
          onClick={abrirRegistrar}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--wa-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--wa-primary-dark)]"
        >
          <span className="material-symbols-outlined text-[1.2rem]">add</span>
          Registrar cierre
        </button>
      </div>
 
      {/* RESUMEN DEL ÚLTIMO CIERRE */}
      <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-[1.05rem] font-bold">Último turno cerrado</h2>
          <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Resumen del cierre más reciente.</p>
        </div>
 
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">person</span>
              <span className="text-sm">Responsable</span>
            </div>
            <p className="font-bold">{cierres[0]?.responsable ?? '—'}</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">calendar_today</span>
              <span className="text-sm">Fecha</span>
            </div>
            <p className="font-bold">{cierres[0]?.fecha ?? '—'}</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">point_of_sale</span>
              <span className="text-sm">Total de ventas</span>
            </div>
            <p className="text-[1.3rem] font-bold">{formatCOP(cierres[0]?.ventas ?? 0)}</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">payments</span>
              <span className="text-sm">Monto final</span>
            </div>
            <p className="text-[1.3rem] font-bold">{formatCOP(cierres[0]?.montoFinal ?? 0)}</p>
          </div>
        </div>
      </div>
 
      {/* HISTORIAL DE CIERRES */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold">Historial de cierres</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Consulta los cierres realizados durante turnos anteriores.</p>
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
                {['Todos', ...Array.from(new Set(cierres.map(c => c.responsable)))].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setFiltroResponsable(op === 'Todos' ? '' : op)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      (filtroResponsable || 'Todos') === op ? 'font-bold text-[var(--wa-primary)]' : ''
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
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="bg-[var(--wa-surface-low)] text-left text-sm">
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Turno</th>
                <th className="px-5 py-3 font-semibold">Responsable</th>
                <th className="px-5 py-3 font-semibold">Monto inicial</th>
                <th className="px-5 py-3 font-semibold">Ventas</th>
                <th className="px-5 py-3 font-semibold">Monto final</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cierresFiltrados.map(c => (
                <tr key={c.id} className="border-t border-[var(--wa-border)]">
                  <td className="px-5 py-4 text-sm">{c.fecha}</td>
                  <td className="px-5 py-4 text-sm">{c.turno}</td>
                  <td className="px-5 py-4 text-sm font-medium">{c.responsable}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{formatCOP(c.montoInicial)}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{formatCOP(c.ventas)}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{formatCOP(c.montoFinal)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[var(--wa-surface-high)] px-3 py-1 text-xs font-semibold text-[var(--wa-text-muted)]">
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setDetalle({
                          open: true,
                          title: 'Cierre de turno',
                          rows: [
                            { label: 'Fecha', value: c.fecha },
                            { label: 'Turno', value: c.turno },
                            { label: 'Responsable', value: c.responsable },
                            { label: 'Monto inicial', value: formatCOP(c.montoInicial) },
                            { label: 'Ventas', value: formatCOP(c.ventas) },
                            { label: 'Monto final', value: formatCOP(c.montoFinal) },
                            { label: 'Estado', value: c.estado },
                          ],
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                      title="Ver cierre"
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
 
      {/* MODAL: REGISTRAR CIERRE */}
      <Modal isOpen={modalCierre} onClose={() => setModalCierre(false)}>
        <div className="px-6 pb-6">
          <h3 className="mb-5 font-bold">Registrar cierre de turno</h3>
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Ventas del turno *</label>
              <input
                type="number"
                placeholder="Ej: 850000"
                value={nuevoCierre.ventas}
                onChange={e => setNuevoCierre(prev => ({ ...prev, ventas: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Monto final *</label>
              <input
                type="number"
                placeholder="Ej: 980000"
                value={nuevoCierre.montoFinal}
                onChange={e => setNuevoCierre(prev => ({ ...prev, montoFinal: e.target.value }))}
                style={inputStyle}
              />
            </div>
            {error && (
              <p className="rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">{error}</p>
            )}
            <div className="mt-2 flex justify-end gap-3">
              <button
                className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
                onClick={() => setModalCierre(false)}
              >
                Cancelar
              </button>
              <button
                className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 text-[0.875rem] font-semibold text-white"
                onClick={guardarCierre}
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
 
export default CierresCaja