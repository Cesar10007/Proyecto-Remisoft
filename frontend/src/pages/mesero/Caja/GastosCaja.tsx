import { useState } from 'react'
import Modal from '../../../components/common/Modal'
import DetalleModal from '../DetalleModal'
import { formatCOP, ahora, inputStyle } from '../utils'
 
interface Gasto {
  id: number
  fecha: string
  hora: string
  concepto: string
  categoria: string
  responsable: string
  metodo: string
  monto: number
}
 
interface GastosCajaProps {
  nombreUsuario: string
  onBack: () => void
}
 
function GastosCaja({ nombreUsuario, onBack }: GastosCajaProps) {
  const [gastos, setGastos] = useState<Gasto[]>([
    { id: 1, fecha: '02/09/2026', hora: '10:15 AM', concepto: 'Compra de suministros', categoria: 'Suministros', responsable: 'Juan Pérez', metodo: 'Efectivo', monto: 25000 },
    { id: 2, fecha: '02/09/2026', hora: '09:20 AM', concepto: 'Compra de hielo', categoria: 'Insumos', responsable: 'María Gómez', metodo: 'Efectivo', monto: 18000 },
    { id: 3, fecha: '01/09/2026', hora: '03:40 PM', concepto: 'Transporte', categoria: 'Transporte', responsable: 'Carlos Rodríguez', metodo: 'Efectivo', monto: 15000 },
    { id: 4, fecha: '01/09/2026', hora: '11:30 AM', concepto: 'Material de limpieza', categoria: 'Limpieza', responsable: 'Juan Pérez', metodo: 'Efectivo', monto: 12500 },
    { id: 5, fecha: '31/08/2026', hora: '04:10 PM', concepto: 'Papelería', categoria: 'Oficina', responsable: 'María Gómez', metodo: 'Efectivo', monto: 17000 },
  ])
 
  const [modalGasto, setModalGasto] = useState(false)
  const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', categoria: '', metodo: 'Efectivo', monto: '' })
  const [error, setError] = useState<string | null>(null)
 
  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState('')
 
  const [detalle, setDetalle] = useState<{ open: boolean; title: string; rows: { label: string; value: string }[] }>({
    open: false,
    title: '',
    rows: [],
  })
 
  const totalGastosHoy = gastos.filter(g => g.fecha === ahora().fecha).reduce((acc, g) => acc + g.monto, 0)
  const gastosFiltrados = gastos.filter(g => (filtroCategoria ? g.categoria === filtroCategoria : true))
 
  const abrirRegistrar = () => {
    setNuevoGasto({ concepto: '', categoria: '', metodo: 'Efectivo', monto: '' })
    setError(null)
    setModalGasto(true)
  }
 
  const guardarGasto = () => {
    if (!nuevoGasto.concepto.trim() || !nuevoGasto.categoria.trim() || !nuevoGasto.monto) {
      setError('Concepto, categoría y monto son obligatorios')
      return
    }
 
    const { fecha, hora } = ahora()
 
    setGastos(prev => [
      {
        id: Date.now(),
        fecha,
        hora,
        concepto: nuevoGasto.concepto,
        categoria: nuevoGasto.categoria,
        responsable: nombreUsuario,
        metodo: nuevoGasto.metodo,
        monto: Number(nuevoGasto.monto),
      },
      ...prev,
    ])
 
    setModalGasto(false)
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
            <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Gastos menores</h1>
            <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
              Registra y consulta los gastos menores realizados desde caja.
            </p>
          </div>
        </div>
 
        <button
          type="button"
          onClick={abrirRegistrar}
          className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--wa-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--wa-primary-dark)]"
        >
          <span className="material-symbols-outlined text-[1.2rem]">add</span>
          Registrar gasto
        </button>
      </div>
 
      {/* RESUMEN DE GASTOS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Gastos de hoy</span>
            <span className="text-[1.2rem]">🧾</span>
          </div>
          <p className="text-[1.5rem] font-black text-[var(--wa-text)]">{formatCOP(totalGastosHoy)}</p>
          <p className="mt-1 text-xs text-[var(--wa-text-muted)]">{gastos.length} gastos registrados</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Gastos del mes</span>
            <span className="text-[1.2rem]">📅</span>
          </div>
          <p className="text-[1.5rem] font-black text-[var(--wa-text)]">$425.000</p>
          <p className="mt-1 text-xs text-[var(--wa-text-muted)]">Agosto - Septiembre 2026</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Último gasto</span>
            <span className="text-[1.2rem]">💵</span>
          </div>
          <p className="text-[1.5rem] font-black text-[var(--wa-text)]">{formatCOP(gastos[0]?.monto ?? 0)}</p>
          <p className="mt-1 text-xs text-[var(--wa-text-muted)]">{gastos[0]?.concepto ?? '—'}</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Saldo disponible</span>
            <span className="text-[1.2rem]">👛</span>
          </div>
          <p className="text-[1.5rem] font-black text-[var(--wa-tertiary)]">{formatCOP(1482500 - totalGastosHoy)}</p>
          <p className="mt-1 text-xs text-[var(--wa-text-muted)]">Disponible en caja</p>
        </div>
      </div>
 
      {/* HISTORIAL */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">Historial de gastos</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Consulta los gastos menores registrados en caja.</p>
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
                {['Todos', ...Array.from(new Set(gastos.map(g => g.categoria)))].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setFiltroCategoria(op === 'Todos' ? '' : op)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      (filtroCategoria || 'Todos') === op ? 'font-bold text-[var(--wa-primary)]' : ''
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
          <table className="w-full min-w-[1050px]">
            <thead>
              <tr className="bg-[var(--wa-surface-low)] text-left text-sm">
                <th className="px-5 py-3 font-semibold">Fecha</th>
                <th className="px-5 py-3 font-semibold">Hora</th>
                <th className="px-5 py-3 font-semibold">Concepto</th>
                <th className="px-5 py-3 font-semibold">Categoría</th>
                <th className="px-5 py-3 font-semibold">Responsable</th>
                <th className="px-5 py-3 font-semibold">Método</th>
                <th className="px-5 py-3 font-semibold">Monto</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map(g => (
                <tr key={g.id} className="border-t border-[var(--wa-border)]">
                  <td className="px-5 py-4 text-sm">{g.fecha}</td>
                  <td className="px-5 py-4 text-sm">{g.hora}</td>
                  <td className="px-5 py-4 text-sm font-medium">{g.concepto}</td>
                  <td className="px-5 py-4 text-sm">{g.categoria}</td>
                  <td className="px-5 py-4 text-sm">{g.responsable}</td>
                  <td className="px-5 py-4 text-sm">{g.metodo}</td>
                  <td className="px-5 py-4 text-sm font-bold">{formatCOP(g.monto)}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setDetalle({
                          open: true,
                          title: 'Gasto menor',
                          rows: [
                            { label: 'Fecha', value: g.fecha },
                            { label: 'Hora', value: g.hora },
                            { label: 'Concepto', value: g.concepto },
                            { label: 'Categoría', value: g.categoria },
                            { label: 'Responsable', value: g.responsable },
                            { label: 'Método', value: g.metodo },
                            { label: 'Monto', value: formatCOP(g.monto) },
                          ],
                        })
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                      title="Ver gasto"
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
 
      {/* MODAL: REGISTRAR GASTO */}
      <Modal isOpen={modalGasto} onClose={() => setModalGasto(false)}>
        <div className="px-6 pb-6">
          <h3 className="mb-5 font-bold">Registrar gasto menor</h3>
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Concepto *</label>
              <input
                type="text"
                placeholder="Ej: Compra de suministros"
                value={nuevoGasto.concepto}
                onChange={e => setNuevoGasto(prev => ({ ...prev, concepto: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Categoría *</label>
              <input
                type="text"
                placeholder="Ej: Suministros"
                value={nuevoGasto.categoria}
                onChange={e => setNuevoGasto(prev => ({ ...prev, categoria: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Método de pago</label>
              <select
                value={nuevoGasto.metodo}
                onChange={e => setNuevoGasto(prev => ({ ...prev, metodo: e.target.value }))}
                style={inputStyle}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Monto *</label>
              <input
                type="number"
                placeholder="Ej: 25000"
                value={nuevoGasto.monto}
                onChange={e => setNuevoGasto(prev => ({ ...prev, monto: e.target.value }))}
                style={inputStyle}
              />
            </div>
            {error && (
              <p className="rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">{error}</p>
            )}
            <div className="mt-2 flex justify-end gap-3">
              <button
                className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
                onClick={() => setModalGasto(false)}
              >
                Cancelar
              </button>
              <button
                className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 text-[0.875rem] font-semibold text-white"
                onClick={guardarGasto}
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
 
export default GastosCaja