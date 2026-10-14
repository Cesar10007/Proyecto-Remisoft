import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { DataTable } from '../../../components/common/DataTable'
import { formatCOP } from '../utils'

// Forma de GET /api/reportes/ventas-diarias (sin parámetros = hoy, hora de Bogotá).
interface TotalesVentas {
  total_pedidos: number
  ingresos_brutos: number
  total_iva: number
  total_descuentos: number
  total_propinas: number
  ingresos_netos: number
}

interface ReporteVentas {
  desde: string
  hasta: string
  total: TotalesVentas
  productos_top: { id_producto: number; producto: string; unidades: number; ingresos: number }[]
}

interface ReportesCajaProps {
  onBack: () => void
}

const TOTALES_VACIOS: TotalesVentas = {
  total_pedidos: 0,
  ingresos_brutos: 0,
  total_iva: 0,
  total_descuentos: 0,
  total_propinas: 0,
  ingresos_netos: 0,
}

function ReportesCaja({ onBack }: ReportesCajaProps) {
  const [reporte, setReporte] = useState<ReporteVentas | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ data: ReporteVentas }>('/reportes/ventas-diarias')
      .then(({ data }) => setReporte(data.data))
      .catch((err) => setError(err?.response?.data?.message ?? 'No fue posible cargar el reporte de ventas.'))
      .finally(() => setCargando(false))
  }, [])

  const total = reporte?.total ?? TOTALES_VACIOS
  const ticketPromedio = total.total_pedidos > 0 ? total.ingresos_brutos / total.total_pedidos : 0
  const productos = reporte?.productos_top ?? []

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
              Resumen de las ventas del día y los productos más vendidos.
            </p>
          </div>
        </div>

        <div className="rounded-[9px] border border-[var(--wa-border)] bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.1rem]">calendar_today</span>
            <span className="text-sm font-semibold">{reporte ? reporte.desde : cargando ? 'Cargando…' : '—'}</span>
          </div>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-sm text-[var(--rojo)]">{error}</p>}

      {/* RESUMEN DE VENTAS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Ventas del día</span>
            <span className="material-symbols-outlined text-[1.4rem]">point_of_sale</span>
          </div>
          <p className="text-[1.5rem] font-bold">{formatCOP(total.ingresos_brutos)}</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Ingresos brutos del día</p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Pedidos realizados</span>
            <span className="material-symbols-outlined text-[1.4rem]">receipt_long</span>
          </div>
          <p className="text-[1.5rem] font-bold">{total.total_pedidos}</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Pedidos del día</p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Ticket promedio</span>
            <span className="material-symbols-outlined text-[1.4rem]">trending_up</span>
          </div>
          <p className="text-[1.5rem] font-bold">{formatCOP(ticketPromedio)}</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Promedio por pedido</p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Ingresos netos</span>
            <span className="material-symbols-outlined text-[1.4rem]">account_balance</span>
          </div>
          <p className="text-[1.5rem] font-bold">{formatCOP(total.ingresos_netos)}</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Después de descuentos</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <p className="text-sm text-[var(--wa-text-muted)]">IVA</p>
          <p className="mt-1 text-[1.2rem] font-bold">{formatCOP(total.total_iva)}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <p className="text-sm text-[var(--wa-text-muted)]">Descuentos</p>
          <p className="mt-1 text-[1.2rem] font-bold">{formatCOP(total.total_descuentos)}</p>
        </div>
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <p className="text-sm text-[var(--wa-text-muted)]">Propinas</p>
          <p className="mt-1 text-[1.2rem] font-bold">{formatCOP(total.total_propinas)}</p>
        </div>
      </div>

      {/* PRODUCTOS MÁS VENDIDOS */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
        <div className="border-b border-[var(--wa-border)] p-5">
          <h2 className="text-[1.05rem] font-bold">Productos más vendidos</h2>
          <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Top 5 por unidades vendidas en el día.</p>
        </div>

        <DataTable
          columns={[
            { header: 'Producto', render: (p) => <span className="font-medium">{p.producto}</span> },
            { header: 'Unidades', render: (p) => p.unidades },
            { header: 'Ingresos', render: (p) => <span className="font-semibold">{formatCOP(p.ingresos)}</span> },
          ]}
          data={productos}
          isLoading={cargando}
          emptyMessage="No hay ventas facturadas hoy."
          keyExtractor={(p) => p.id_producto}
        />
      </div>

    </section>
  )
}

export default ReportesCaja
