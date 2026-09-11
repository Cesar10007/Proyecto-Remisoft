import { useState } from 'react'
import Modal from '../../../components/common/Modal'
import DetalleModal from '../DetalleModal'
import { formatCOP, ahora, inputStyle } from '../utils'
 
interface Arqueo {
  id: number
  fecha: string
  hora: string
  responsable: string
  caja: string
  esperado: number
  contado: number
  diferencia: number
  estado: 'Cuadrado' | 'Sobrante' | 'Faltante'
}
 
interface ArqueosCajaProps {
  nombreUsuario: string
  onBack: () => void
}
 
function ArqueosCaja({ nombreUsuario, onBack }: ArqueosCajaProps) {
  const [arqueos, setArqueos] = useState<Arqueo[]>([
    { id: 1, fecha: '02/09/2026', hora: '03:45 PM', responsable: 'Juan Pérez', caja: 'Caja principal', esperado: 1482500, contado: 1482500, diferencia: 0, estado: 'Cuadrado' },
    { id: 2, fecha: '01/09/2026', hora: '05:50 PM', responsable: 'María Gómez', caja: 'Caja principal', esperado: 980000, contado: 990000, diferencia: 10000, estado: 'Sobrante' },
    { id: 3, fecha: '31/08/2026', hora: '05:40 PM', responsable: 'Carlos Rodríguez', caja: 'Caja principal', esperado: 840000, contado: 830000, diferencia: -10000, estado: 'Faltante' },
    { id: 4, fecha: '30/08/2026', hora: '05:35 PM', responsable: 'Juan Pérez', caja: 'Caja principal', esperado: 760000, contado: 760000, diferencia: 0, estado: 'Cuadrado' },
  ])
 
  const [modalArqueo, setModalArqueo] = useState(false)
  const [nuevoArqueo, setNuevoArqueo] = useState({ contado: '' })
  const [error, setError] = useState<string | null>(null)
 
  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
 
  const [detalle, setDetalle] = useState<{ open: boolean; title: string; rows: { label: string; value: string }[] }>({
    open: false,
    title: '',
    rows: [],
  })
 
  const arqueoActual = arqueos[0]
  const arqueosFiltrados = arqueos.filter(a => (filtroEstado ? a.estado === filtroEstado : true))
 
  const abrirRealizar = () => {
    setNuevoArqueo({ contado: '' })
    setError(null)
    setModalArqueo(true)
  }
 
  const guardarArqueo = () => {
    if (!nuevoArqueo.contado) {
      setError('El monto contado es obligatorio')
      return
    }
 
    const { fecha, hora } = ahora()
    const esperado = 1482500
    const contado = Number(nuevoArqueo.contado)
    const diferencia = contado - esperado
 
    setArqueos(prev => [
      {
        id: Date.now(),
        fecha,
        hora,
        responsable: nombreUsuario,
        caja: 'Caja principal',
        esperado,
        contado,
        diferencia,
        estado: diferencia === 0 ? 'Cuadrado' : diferencia > 0 ? 'Sobrante' : 'Faltante',
      },
      ...prev,
    ])
 
    setModalArqueo(false)
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
            <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Arqueos de caja</h1>
            <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">Revisa y controla los arqueos realizados.</p>
          </div>
        </div>
 
        <button
          type="button"
          onClick={abrirRealizar}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--wa-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--wa-primary-dark)]"
        >
          <span className="material-symbols-outlined text-[1.2rem]">calculate</span>
          Realizar arqueo
        </button>
      </div>
 
      {/* RESUMEN DEL ARQUEO ACTUAL */}
      <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">Arqueo actual</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Comparación entre el dinero esperado y el dinero contado.</p>
          </div>
 
          <span
            className={`flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
              arqueoActual.estado === 'Cuadrado'
                ? 'bg-[#dcfce7] text-[#166534]'
                : arqueoActual.diferencia > 0
                ? 'bg-[var(--wa-secondary-light)] text-[var(--wa-secondary)]'
                : 'bg-[var(--wa-primary-light)] text-[var(--wa-primary)]'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${arqueoActual.estado === 'Cuadrado' ? 'bg-[#22c55e]' : 'bg-current'}`} />
            {arqueoActual.estado}
          </span>
        </div>
 
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">payments</span>
              <span className="text-sm">Monto esperado</span>
            </div>
            <p className="text-[1.3rem] font-bold text-[var(--wa-text)]">{formatCOP(arqueoActual.esperado)}</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">account_balance_wallet</span>
              <span className="text-sm">Monto contado</span>
            </div>
            <p className="text-[1.3rem] font-bold text-[var(--wa-text)]">{formatCOP(arqueoActual.contado)}</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">compare_arrows</span>
              <span className="text-sm">Diferencia</span>
            </div>
            <p
              className={`text-[1.3rem] font-bold ${
                arqueoActual.diferencia === 0
                  ? 'text-[var(--wa-tertiary)]'
                  : arqueoActual.diferencia > 0
                  ? 'text-[var(--wa-secondary)]'
                  : 'text-[var(--wa-primary)]'
              }`}
            >
              {formatCOP(arqueoActual.diferencia)}
            </p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined text-[1.2rem]">person</span>
              <span className="text-sm">Responsable</span>
            </div>
            <p className="font-bold text-[var(--wa-text)]">{arqueoActual.responsable}</p>
          </div>
        </div>
      </div>
 
      {/* HISTORIAL DE ARQUEOS */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">Historial de arqueos</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Consulta y verifica los arqueos realizados anteriormente.</p>
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
                {['Todos', 'Cuadrado', 'Sobrante', 'Faltante'].map(op => (
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
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-[var(--wa-surface-low)] text-left text-sm">
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Hora</th>
                <th className="px-5 py-3 font-semibold">Responsable</th>
                <th className="px-5 py-3 font-semibold">Caja</th>
                <th className="px-5 py-3 font-semibold">Esperado</th>
                <th className="px-5 py-3 font-semibold">Contado</th>
                <th className="px-5 py-3 font-semibold">Diferencia</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {arqueosFiltrados.map(a => (
                <tr key={a.id} className="border-t border-[var(--wa-border)]">
                  <td className="px-5 py-4 text-sm">{a.fecha}</td>
                  <td className="px-5 py-4 text-sm">{a.hora}</td>
                  <td className="px-5 py-4 text-sm font-medium">{a.responsable}</td>
                  <td className="px-5 py-4 text-sm">{a.caja}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{formatCOP(a.esperado)}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{formatCOP(a.contado)}</td>
                  <td
                    className={`px-5 py-4 text-sm font-semibold ${
                      a.diferencia === 0 ? 'text-[var(--wa-tertiary)]' : a.diferencia > 0 ? 'text-[var(--wa-secondary)]' : 'text-[var(--wa-primary)]'
                    }`}
                  >
                    {formatCOP(a.diferencia)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        a.estado === 'Cuadrado'
                          ? 'bg-[#dcfce7] text-[#166534]'
                          : a.estado === 'Sobrante'
                          ? 'bg-[var(--wa-secondary-light)] text-[var(--wa-secondary)]'
                          : 'bg-[var(--wa-primary-light)] text-[var(--wa-primary)]'
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
                          title: 'Arqueo de caja',
                          rows: [
                            { label: 'Fecha', value: a.fecha },
                            { label: 'Hora', value: a.hora },
                            { label: 'Responsable', value: a.responsable },
                            { label: 'Caja', value: a.caja },
                            { label: 'Esperado', value: formatCOP(a.esperado) },
                            { label: 'Contado', value: formatCOP(a.contado) },
                            { label: 'Diferencia', value: formatCOP(a.diferencia) },
                            { label: 'Estado', value: a.estado },
                          ],
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                      title="Ver arqueo"
                    >
                      <span className="material-symbols-outlined text-[1.1rem]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
 
      {/* MODAL: REALIZAR ARQUEO */}
      <Modal isOpen={modalArqueo} onClose={() => setModalArqueo(false)}>
        <div className="px-6 pb-6">
          <h3 className="mb-5 font-bold">Realizar arqueo</h3>
          <div className="flex flex-col gap-3.5">
            <p className="text-[0.85rem] text-[var(--texto-muted)]">
              Monto esperado: <strong>{formatCOP(1482500)}</strong>
            </p>
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Monto contado *</label>
              <input
                type="number"
                placeholder="Ej: 1482500"
                value={nuevoArqueo.contado}
                onChange={e => setNuevoArqueo({ contado: e.target.value })}
                style={inputStyle}
              />
            </div>
            {error && (
              <p className="rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">{error}</p>
            )}
            <div className="mt-2 flex justify-end gap-3">
              <button
                className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
                onClick={() => setModalArqueo(false)}
              >
                Cancelar
              </button>
              <button
                className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 text-[0.875rem] font-semibold text-white"
                onClick={guardarArqueo}
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
 
export default ArqueosCaja