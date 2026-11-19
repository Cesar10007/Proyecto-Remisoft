import { cantidadConUnidad } from '../../../utils/unidadesInventario'
import { useConsulta } from '../../../hook/useConsulta'
import { formatoCOP, type VentasDia } from '../useDatosGerente'

interface AlertaStock {
  id_ingrediente: number
  nombre: string
  unidad_medida: string | null
  stock_minimo: number
  stock_actual: number
  alerta: 'SIN STOCK' | 'BAJO MÍNIMO'
}

function DashboardOperativo({ reporte }: { reporte: ReturnType<typeof useConsulta<{ data: VentasDia }>> }) {
  const stock = useConsulta<{ data: AlertaStock[] }>('/inventario/alertas/stock-bajo', 15000)
  const alertas = stock.error ? null : stock.data?.data ?? null
  const ventas = reporte.error ? null : reporte.data?.data ?? null

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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

        {stock.error && <p role="alert" className="text-[0.85rem] text-[var(--rojo)]">No se pudieron cargar las alertas. <button aria-description="Vuelve a consultar los ingredientes con poco stock." onClick={stock.cargar}>Reintentar</button></p>}
        {!stock.error && alertas === null && <p className="text-[0.85rem] text-[var(--texto-muted)]">Cargando...</p>}
        {alertas && alertas.length === 0 && (
          <p className="text-[0.85rem] text-[var(--texto-muted)]">Sin alertas de stock para este establecimiento.</p>
        )}
        {alertas && alertas.length > 0 && (
          <ul className="flex flex-col gap-2">
            {alertas.map(a => (
              <li key={a.id_ingrediente} className="flex items-center justify-between rounded-xl bg-[var(--t-bg-f0ebe5,#f0ebe5)] px-4 py-2.5">
                <div>
                  <p className="text-[0.88rem] font-semibold text-[var(--texto)]">{a.nombre}</p>
                  <p className="text-[0.75rem] text-[var(--texto-muted)]">
                    Stock {cantidadConUnidad(a.stock_actual, a.unidad_medida)} · mínimo {cantidadConUnidad(a.stock_minimo, a.unidad_medida)}
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
          <p className="mt-0.5 text-[0.8rem] text-[var(--texto-muted)]">Pagos aprobados de esta sede · {ventas?.desde} · Bogotá</p>
        </div>

        {reporte.error && <p role="alert" className="text-[0.85rem] text-[var(--rojo)]">No se pudo cargar el resumen de ventas. <button aria-description="Vuelve a consultar las ventas de hoy." onClick={reporte.cargar}>Reintentar</button></p>}
        {!reporte.error && ventas === null && <p className="text-[0.85rem] text-[var(--texto-muted)]">Cargando...</p>}
        {ventas && (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <p className="text-[0.75rem] text-[var(--texto-muted)]">Total cobrado</p>
                <p className="font-number text-[1.3rem] font-bold text-[var(--texto)]">{formatoCOP.format(ventas.total.ingresos_netos)}</p>
              </div>
              <div>
                <p className="text-[0.75rem] text-[var(--texto-muted)]">Facturas con pago</p>
                <p className="font-number text-[1.3rem] font-bold text-[var(--texto)]">{ventas.total.total_pedidos}</p>
              </div>
              <div>
                <p className="text-[0.75rem] text-[var(--texto-muted)]">Propinas</p>
                <p className="font-number text-[1.3rem] font-bold text-[var(--texto)]">{formatoCOP.format(ventas.total.total_propinas)}</p>
              </div>
            </div>

            <p className="mb-2 text-[0.78rem] font-semibold text-[var(--texto-muted)]">Productos más vendidos</p>
            {ventas.productos_top.length === 0 ? (
              <p className="text-[0.85rem] text-[var(--texto-muted)]">{ventas.total.total_pedidos === 0 ? 'Sin ventas registradas hoy en este establecimiento.' : 'Sin productos desglosados con primer cobro hoy.'}</p>
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
