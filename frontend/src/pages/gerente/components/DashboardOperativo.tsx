import { useEffect, useState } from 'react'
import api from '../../../api/axios'

interface AlertaStock {
  id_ingrediente: number
  nombre: string
  unidad_medida: string | null
  stock_minimo: number
  stock_actual: number
  alerta: 'SIN STOCK' | 'BAJO MÍNIMO'
}

interface ResumenDia {
  fecha: string
  total_pedidos: number
  ingresos_brutos: number
  total_iva: number
  total_descuentos: number
  total_propinas: number
  ingresos_netos: number
}

interface ProductoTop {
  id_producto: number
  producto: string
  unidades: number
  ingresos: number
}

interface VentasDiarias {
  desde: string
  hasta: string
  dias: ResumenDia[]
  total: Omit<ResumenDia, 'fecha'>
  productos_top: ProductoTop[]
}

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function DashboardOperativo() {
  const [alertas, setAlertas] = useState<AlertaStock[] | null>(null)
  const [ventas, setVentas] = useState<VentasDiarias | null>(null)
  const [errorAlertas, setErrorAlertas] = useState(false)
  const [errorVentas, setErrorVentas] = useState(false)

  useEffect(() => {
    api.get('/inventario/alertas/stock-bajo')
      .then(({ data }) => setAlertas(data.data))
      .catch(() => setErrorAlertas(true))

    api.get('/reportes/ventas-diarias')
      .then(({ data }) => setVentas(data.data))
      .catch(() => setErrorVentas(true))
  }, [])

  return (
    <section className="grid grid-cols-[1fr_1fr] gap-4">
      <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-[var(--sombra)]">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="font-['Syne'] text-[1.1rem] font-bold text-[var(--texto)]">Alertas de inventario</h3>
            <p className="mt-0.5 text-[0.8rem] text-[var(--texto-muted)]">Ingredientes en o bajo su stock mínimo</p>
          </div>
          {alertas && (
            <span className="rounded-full bg-[var(--rojo-light)] px-2.5 py-0.5 text-[0.72rem] font-semibold text-[var(--rojo-dark)]">
              {alertas.length}
            </span>
          )}
        </div>

        {errorAlertas && <p className="text-[0.85rem] text-[var(--rojo)]">No se pudieron cargar las alertas.</p>}
        {!errorAlertas && alertas === null && <p className="text-[0.85rem] text-[var(--texto-muted)]">Cargando...</p>}
        {alertas && alertas.length === 0 && (
          <p className="text-[0.85rem] text-[var(--texto-muted)]">Sin alertas de stock.</p>
        )}
        {alertas && alertas.length > 0 && (
          <ul className="flex flex-col gap-2">
            {alertas.map(a => (
              <li key={a.id_ingrediente} className="flex items-center justify-between rounded-xl bg-[var(--t-bg-f0ebe5,#f0ebe5)] px-4 py-2.5">
                <div>
                  <p className="text-[0.88rem] font-semibold text-[var(--texto)]">{a.nombre}</p>
                  <p className="text-[0.75rem] text-[var(--texto-muted)]">
                    Stock {a.stock_actual} {a.unidad_medida ?? ''} · mínimo {a.stock_minimo} {a.unidad_medida ?? ''}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${
                  a.alerta === 'SIN STOCK' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' : 'bg-[var(--verde-light)] text-[var(--texto-muted)]'
                }`}>{a.alerta}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-[var(--sombra)]">
        <div className="mb-4">
          <h3 className="font-['Syne'] text-[1.1rem] font-bold text-[var(--texto)]">Ventas de hoy</h3>
          <p className="mt-0.5 text-[0.8rem] text-[var(--texto-muted)]">Facturas pagadas del día</p>
        </div>

        {errorVentas && <p className="text-[0.85rem] text-[var(--rojo)]">No se pudo cargar el resumen de ventas.</p>}
        {!errorVentas && ventas === null && <p className="text-[0.85rem] text-[var(--texto-muted)]">Cargando...</p>}
        {ventas && (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[0.75rem] text-[var(--texto-muted)]">Ingresos brutos</p>
                <p className="font-['Syne'] text-[1.3rem] font-bold text-[var(--texto)]">{formatoCOP.format(ventas.total.ingresos_brutos)}</p>
              </div>
              <div>
                <p className="text-[0.75rem] text-[var(--texto-muted)]">Pedidos pagados</p>
                <p className="font-['Syne'] text-[1.3rem] font-bold text-[var(--texto)]">{ventas.total.total_pedidos}</p>
              </div>
              <div>
                <p className="text-[0.75rem] text-[var(--texto-muted)]">Propinas</p>
                <p className="font-['Syne'] text-[1.3rem] font-bold text-[var(--texto)]">{formatoCOP.format(ventas.total.total_propinas)}</p>
              </div>
            </div>

            <p className="mb-2 text-[0.78rem] font-semibold text-[var(--texto-muted)]">Productos más vendidos</p>
            {ventas.productos_top.length === 0 ? (
              <p className="text-[0.85rem] text-[var(--texto-muted)]">Sin ventas registradas hoy.</p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {ventas.productos_top.map((p, i) => (
                  <li key={p.id_producto} className="flex items-center justify-between text-[0.85rem]">
                    <span className="text-[var(--texto)]">{i + 1}. {p.producto}</span>
                    <span className="text-[var(--texto-muted)]">{p.unidades} u · {formatoCOP.format(p.ingresos)}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default DashboardOperativo
