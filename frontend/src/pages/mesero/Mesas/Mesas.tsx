import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import './Mesas.css'
 
interface MesaApi {
  numero: number
  capacidad: number | null
  estado: 'available' | 'occupied'
  pedidos: number
  articulos: number
  total: number
  id_pedido: number | null
  mesero: string | null
  fecha_hora: string | null
}

interface MesaVista {
  number: string
  name?: string
  meta?: string
  total?: string
  badge?: string
  state: 'available' | 'occupied' | 'waiting' | 'done'
}

const formatoPesos = (valor: number) => Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })

const minutosDesde = (fecha: string) => `${Math.max(0, Math.round((Date.now() - new Date(fecha).getTime()) / 60000))}m`

// Forma de GET /api/cocina/comandas (solo los campos que usamos).
interface ComandaApi {
  id_pedido: number
  mesa: number | null
  tipo_pedido: string
  fecha_hora: string | null
  items: { id_detalle: number; nombre: string; cantidad: number; estado: string }[]
}

interface FeedItem {
  key: string
  status: string
  time: string
  title: string
  detail: string
  tone: 'ready' | 'warning' | 'default'
}

const etiquetaEstadoItem: Record<string, string> = { PENDIENTE: 'Nueva orden', PREPARANDO: 'Preparando', LISTO: 'Lista' }

// Una fila por ítem de comanda activo en cocina.
const feedDesdeComandas = (comandas: ComandaApi[]): FeedItem[] =>
  comandas.flatMap(p => p.items.map(i => ({
    key: `${p.id_pedido}-${i.id_detalle}`,
    status: `${p.mesa ? `Mesa ${String(p.mesa).padStart(2, '0')}` : (p.tipo_pedido || 'Pedido')} • ${etiquetaEstadoItem[i.estado] ?? i.estado}`,
    time: p.fecha_hora ? `hace ${minutosDesde(p.fecha_hora)}` : '—',
    title: `${i.cantidad}x ${i.nombre}`,
    detail: `Pedido #${p.id_pedido}`,
    tone: i.estado === 'LISTO' ? 'ready' : 'default',
  })))
 
function Mesas() {
  const [mesas, setMesas] = useState<MesaApi[]>([])
  const [feed, setFeed] = useState<FeedItem[]>([])

  useEffect(() => {
    const cargar = () => {
      api.get('/mesas').then(({ data }) => setMesas(data.data)).catch(console.error)
      api.get('/cocina/comandas').then(({ data }: { data: ComandaApi[] }) => setFeed(feedDesdeComandas(data))).catch(console.error)
    }
    cargar()
    const intervalo = setInterval(cargar, 15000)
    return () => clearInterval(intervalo)
  }, [])

  const ocupadas = mesas.filter(m => m.estado === 'occupied')
  const pedidosEnCurso = mesas.reduce((acc, m) => acc + m.pedidos, 0)
  const totalEnMesas = mesas.reduce((acc, m) => acc + m.total, 0)

  const stats = [
    { label: 'Mesas activas', value: String(ocupadas.length).padStart(2, '0'), detail: `/ ${mesas.length} total`, color: 'green' },
    { label: 'Pedidos en curso', value: String(pedidosEnCurso), color: 'amber', accented: true },
    { label: 'En mesas', value: formatoPesos(totalEnMesas), prefix: '$', color: 'default' },
  ]

  const tables: MesaVista[] = mesas.map(m => {
    if (m.estado === 'available' || m.id_pedido === null) {
      return { number: String(m.numero).padStart(2, '0'), state: 'available' }
    }
    return {
      number: String(m.numero).padStart(2, '0'),
      name: `Pedido #${m.id_pedido}`,
      meta: `${m.articulos} artículos • ${m.mesero ?? 'Sin mesero'}`,
      total: `$${formatoPesos(m.total)}`,
      badge: m.fecha_hora ? minutosDesde(m.fecha_hora) : '',
      state: 'occupied',
    }
  })

  return (
    <>
      <section className="grid grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`flex min-h-[128px] flex-col justify-between rounded-[20px] bg-[var(--wa-surface)] p-6 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.03)] ${
              stat.accented ? 'border-l-4 border-[var(--wa-secondary)]' : ''
            }`}
          >
            <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">{stat.label}</p>
            <div className="flex flex-wrap items-baseline gap-2">
              {stat.prefix && <span className="text-[1.125rem] font-extrabold text-[var(--wa-text-muted)]">{stat.prefix}</span>}
              <span className={`text-[2.25rem] font-black tracking-[-0.05em] ${stat.color === 'amber' ? 'text-[var(--wa-secondary)]' : ''}`}>
                {stat.value}
              </span>
              {stat.detail && stat.label === 'Mesas activas' && (
                <span className="text-[0.75rem] font-extrabold text-[var(--wa-tertiary)]">{stat.detail}</span>
              )}
              {stat.detail && stat.label === 'Mesas en espera' && (
                <span className="text-[0.75rem] font-extrabold text-[var(--wa-text-muted)]">{stat.detail}</span>
              )}
            </div>
          </div>
        ))}
        <button className="flex min-h-[128px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[20px] border-none bg-gradient-to-br from-[var(--wa-primary)] to-[var(--wa-primary-container)] text-white shadow-[0_12px_32px_-4px_rgba(165,54,13,0.2)] transition-transform duration-150 ease-in-out active:scale-95">
          <span className="material-symbols-outlined text-[32px]">add_shopping_cart</span>
          <p className="text-[0.9rem] font-extrabold">Registrar Venta</p>
        </button>
      </section>
 
      <div className="grid grid-cols-[8fr_4fr] gap-8">
        <section className="flex flex-col gap-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[1.75rem] font-black tracking-[-0.04em]">Sala de Comedor Principal</h2>
              <p className="text-[0.875rem] font-semibold text-[var(--wa-text-muted)]">
                Haz clic en una mesa para gestionar pedidos o generar facturas.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(0,105,76,0.1)] px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-[var(--wa-tertiary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--wa-tertiary)]" />
                Disponible
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(133,84,0,0.1)] px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-[var(--wa-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--wa-secondary)]" />
                Ocupada
              </span>
            </div>
          </div>
 
          <div className="grid grid-cols-4 gap-4">
            {tables.map((table) => {
              if (table.state === 'available') {
                return (
                  <div
                    key={table.number}
                    className="flex min-h-[206px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[rgba(140,113,105,0.3)] bg-[var(--wa-surface-low)] p-5 text-center opacity-60 transition-opacity duration-200 ease-in-out hover:opacity-100"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--wa-surface-high)] text-[1.25rem] font-black text-[var(--wa-text-muted)]">
                      {table.number}
                    </div>
                    <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">Disponible</p>
                  </div>
                )
              }
              return (
                <div
                  key={table.number}
                  className={`rounded-[20px] border-2 bg-[var(--wa-surface)] p-5 transition-all duration-200 ease-in-out ${
                    table.state === 'waiting'
                      ? 'border-[rgba(133,84,0,0.2)] shadow-[0_14px_26px_rgba(133,84,0,0.08)]'
                      : table.state === 'done'
                      ? 'border-[rgba(0,105,76,0.2)]'
                      : 'border-transparent hover:border-[rgba(165,54,13,0.1)] hover:shadow-[0_18px_30px_rgba(28,27,27,0.08)]'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full text-[1.25rem] font-black ${
                        table.state === 'waiting' ? 'bg-[var(--wa-secondary-container)] text-[var(--t-txt-2a1700,#2a1700)]' : 'bg-[var(--wa-secondary-fixed-dim)] text-[var(--t-txt-2a1700,#2a1700)]'
                      }`}
                    >
                      {table.number}
                    </div>
                    <span
                      className={`rounded-lg px-2 py-1.5 text-[0.625rem] font-extrabold ${
                        table.state === 'waiting'
                          ? 'animate-pulse bg-[var(--wa-secondary-light)] text-[var(--wa-secondary)]'
                          : table.state === 'done'
                          ? 'bg-[var(--wa-tertiary-light)] text-[var(--wa-tertiary)]'
                          : 'bg-[var(--wa-surface-mid)] text-[var(--wa-text-muted)]'
                      }`}
                    >
                      {table.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[1rem] font-extrabold text-[var(--wa-text)]">{table.name}</h3>
                    <p className="mt-1 text-[0.75rem] text-[var(--wa-text-muted)]">{table.meta}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[rgba(224,192,182,0.1)] pt-4">
                    <span className="text-[1rem] font-black text-[var(--wa-primary)]">{table.total}</span>
                    {table.state === 'done' ? (
                      <button className="cursor-pointer rounded-full border-none bg-[var(--wa-tertiary)] px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.06em] text-white">
                        Factura
                      </button>
                    ) : (
                      <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-[var(--wa-primary)] hover:bg-[var(--wa-primary-light)]">
                        <span className="material-symbols-outlined">
                          {table.state === 'waiting' ? 'add' : table.number === '12' ? 'arrow_forward' : 'more_horiz'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
 
        <aside className="flex h-[calc(100vh-12rem)] flex-col rounded-[20px] bg-[var(--wa-surface)] p-6 shadow-[0_2px_10px_rgba(28,27,27,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[1.125rem] font-black">Cocina</h2>
            <span className="material-symbols-outlined text-[var(--wa-secondary)] [font-variation-settings:'FILL'_1]">restaurant</span>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-2">
            {feed.map((item) => (
              <div
                key={item.key}
                className={`rounded-2xl p-4 ${
                  item.tone === 'ready'
                    ? 'border-l-4 border-[var(--wa-tertiary)] bg-[rgba(0,105,76,0.05)]'
                    : item.tone === 'warning'
                    ? 'border-l-4 border-[var(--wa-secondary)] bg-[rgba(133,84,0,0.05)]'
                    : 'bg-[var(--wa-surface-low)]'
                }`}
              >
                <div className="mb-1 flex justify-between gap-3">
                  <span
                    className={`text-[0.625rem] font-extrabold uppercase ${
                      item.tone === 'ready' ? 'text-[var(--wa-tertiary)]' : item.tone === 'warning' ? 'text-[var(--wa-secondary)]' : 'text-[var(--wa-text-muted)]'
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[0.625rem] font-semibold text-[var(--wa-text-muted)]">{item.time}</span>
                </div>
                <p className="text-[0.9rem] font-bold text-[var(--wa-text)]">{item.title}</p>
                <p className="text-[0.8rem] text-[var(--wa-text-muted)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}
 
export default Mesas