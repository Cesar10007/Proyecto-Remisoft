import { useState } from 'react'
import { formatCOP } from '../utils'
 
interface ReportesCajaProps {
  onBack: () => void
}
 
const ventasDia = [
  { hora: '12:45 PM', pedido: '#1048', mesa: 'Mesa 12', responsable: 'María Gómez', pago: 'Efectivo', total: 142500 },
  { hora: '01:20 PM', pedido: '#1049', mesa: 'Mesa 04', responsable: 'Carlos Rodríguez', pago: 'Tarjeta', total: 86000 },
  { hora: '02:05 PM', pedido: '#1050', mesa: 'Mesa 08', responsable: 'Juan Pérez', pago: 'Efectivo', total: 215000 },
  { hora: '03:15 PM', pedido: '#1051', mesa: 'Mesa 15', responsable: 'María Gómez', pago: 'Tarjeta', total: 178500 },
  { hora: '04:40 PM', pedido: '#1052', mesa: 'Mesa 22', responsable: 'Carlos Rodríguez', pago: 'Otros', total: 310000 },
]
 
function ReportesCaja({ onBack }: ReportesCajaProps) {
  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroPago, setFiltroPago] = useState('')
 
  const ventasFiltradas = ventasDia.filter(v => (filtroPago ? v.pago === filtroPago : true))
 
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
            <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Reportes de ventas del día</h1>
            <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
              Visualiza un resumen de las ventas realizadas durante el día.
            </p>
          </div>
        </div>
 
        <div className="rounded-[9px] border border-[var(--wa-border)] bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.1rem]">calendar_today</span>
            <span className="text-sm font-semibold">02/09/2026</span>
          </div>
        </div>
      </div>
 
      {/* RESUMEN DE VENTAS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Ventas del día</span>
            <span className="material-symbols-outlined text-[1.4rem]">point_of_sale</span>
          </div>
          <p className="text-[1.5rem] font-bold">$1.245.000</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Total vendido durante el día</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Pedidos realizados</span>
            <span className="material-symbols-outlined text-[1.4rem]">receipt_long</span>
          </div>
          <p className="text-[1.5rem] font-bold">48</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Pedidos completados hoy</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Ticket promedio</span>
            <span className="material-symbols-outlined text-[1.4rem]">trending_up</span>
          </div>
          <p className="text-[1.5rem] font-bold">$25.938</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Promedio por pedido</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Transacciones</span>
            <span className="material-symbols-outlined text-[1.4rem]">check_circle</span>
          </div>
          <p className="text-[1.5rem] font-bold">48</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Ventas contabilizadas</p>
        </div>
      </div>
 
      {/* FORMAS DE PAGO */}
      <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-[1.05rem] font-bold">Ventas por forma de pago</h2>
          <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Distribución de las ventas realizadas según el medio de pago.</p>
        </div>
 
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-white text-[1.2rem]">💵</div>
              <div>
                <p className="text-sm text-[var(--wa-text-muted)]">Efectivo</p>
                <p className="font-bold">$520.000</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[var(--wa-primary)]" style={{ width: '42%' }} />
            </div>
            <p className="mt-2 text-xs text-[var(--wa-text-muted)]">42% de las ventas</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-white text-[1.2rem]">💳</div>
              <div>
                <p className="text-sm text-[var(--wa-text-muted)]">Tarjeta</p>
                <p className="font-bold">$475.000</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[var(--wa-secondary)]" style={{ width: '38%' }} />
            </div>
            <p className="mt-2 text-xs text-[var(--wa-text-muted)]">38% de las ventas</p>
          </div>
 
          <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-white text-[1.2rem]">🏦</div>
              <div>
                <p className="text-sm text-[var(--wa-text-muted)]">Otros medios</p>
                <p className="font-bold">$250.000</p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[var(--wa-tertiary)]" style={{ width: '20%' }} />
            </div>
            <p className="mt-2 text-xs text-[var(--wa-text-muted)]">20% de las ventas</p>
          </div>
        </div>
      </div>
 
      {/* HISTORIAL DE VENTAS */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.05rem] font-bold">Ventas realizadas</h2>
            <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Resumen de las ventas registradas durante el día.</p>
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
                {['Todos', ...Array.from(new Set(ventasDia.map(v => v.pago)))].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setFiltroPago(op === 'Todos' ? '' : op)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      (filtroPago || 'Todos') === op ? 'font-bold text-[var(--wa-primary)]' : ''
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
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[var(--wa-surface-low)] text-left text-sm">
                <th className="px-5 py-3 font-semibold">Hora</th>
                <th className="px-5 py-3 font-semibold">Pedido</th>
                <th className="px-5 py-3 font-semibold">Mesa</th>
                <th className="px-5 py-3 font-semibold">Responsable</th>
                <th className="px-5 py-3 font-semibold">Forma de pago</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map(v => (
                <tr key={v.pedido} className="border-t border-[var(--wa-border)]">
                  <td className="px-5 py-4 text-sm">{v.hora}</td>
                  <td className="px-5 py-4 text-sm font-medium">{v.pedido}</td>
                  <td className="px-5 py-4 text-sm">{v.mesa}</td>
                  <td className="px-5 py-4 text-sm">{v.responsable}</td>
                  <td className="px-5 py-4 text-sm">{v.pago}</td>
                  <td className="px-5 py-4 text-right text-sm font-bold">{formatCOP(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
 
    </section>
  )
}
 
export default ReportesCaja