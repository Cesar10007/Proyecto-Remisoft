import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { icon: 'soup_kitchen', label: 'Pedidos' },
  { icon: 'history', label: 'Historial' },
]

const filtros = [
  { key: 'todos', label: 'Todos' },
  { key: 'mesa', label: 'Mesa' },
  { key: 'domicilio', label: 'Domicilio' },
]

const stats = [
  { label: 'Pendientes', value: '05', color: 'default' },
  { label: 'En preparación', value: '03', color: 'amber', accented: true },
  { label: 'Listos hoy', value: '27', color: 'green' },
]

// Mokup
const pedidosMock = [
  {
    id: '#8842',
    origen: 'Mesa 04',
    tipo: 'mesa',
    hora: 'hace 3m',
    estado: 'pendiente',
    items: [
      { cant: 1, nombre: 'Risotto de Trufa' },
      { cant: 2, nombre: 'Limonada de Coco' },
    ],
    notas: 'Sin gluten',
  },
  {
    id: '#8845',
    origen: 'Domicilio · The Bistro Main',
    tipo: 'domicilio',
    hora: 'hace 8m',
    estado: 'preparando',
    items: [
      { cant: 1, nombre: 'Ribeye Término Medio' },
      { cant: 1, nombre: 'Papas Rústicas' },
    ],
    notas: '',
  },
  {
    id: '#8848',
    origen: 'Mesa 12',
    tipo: 'mesa',
    hora: 'hace 12m',
    estado: 'preparando',
    items: [{ cant: 2, nombre: 'Lubina a la Parrilla' }],
    notas: 'Extra limón',
  },
  {
    id: '#8850',
    origen: 'Domicilio · Central Plaza Hotel',
    tipo: 'domicilio',
    hora: 'hace 1m',
    estado: 'pendiente',
    items: [{ cant: 3, nombre: 'Empanadas de Pollo' }],
    notas: '',
  },
]

const historialMock = [
  { id: '#8830', origen: 'Mesa 01', hora: 'hace 32m', tiempo: '14 min' },
  { id: '#8831', origen: 'Domicilio · Mamma\'s Kitchen', hora: 'hace 40m', tiempo: '19 min' },
  { id: '#8833', origen: 'Mesa 22', hora: 'hace 51m', tiempo: '11 min' },
]

const estadoBadge: Record<string, string> = {
  pendiente: 'bg-[var(--wa-surface-mid)] text-[var(--wa-text-muted)]',
  preparando: 'bg-[var(--wa-secondary-light)] text-[var(--wa-secondary)]',
  listo: 'bg-[var(--wa-tertiary-light)] text-[var(--wa-tertiary)]',
}

const estadoLabel: Record<string, string> = {
  pendiente: 'Pendiente',
  preparando: 'En proceso',
  listo: 'Preparado',
}

// Config de los 3 botones de estado: rojo / amarillo / verde
const estadosBoton = [
  {
    key: 'pendiente',
    label: 'Pendiente',
    activa: 'bg-[#dc2626] text-white shadow-[0_10px_18px_rgba(220,38,38,0.25)]',
    inactiva: 'bg-[rgba(220,38,38,0.08)] text-[#dc2626] border border-[rgba(220,38,38,0.3)]',
  },
  {
    key: 'preparando',
    label: 'En proceso',
    activa: 'bg-[#d97706] text-white shadow-[0_10px_18px_rgba(217,119,6,0.25)]',
    inactiva: 'bg-[rgba(217,119,6,0.08)] text-[#d97706] border border-[rgba(217,119,6,0.3)]',
  },
  {
    key: 'listo',
    label: 'Preparado',
    activa: 'bg-[#16a34a] text-white shadow-[0_10px_18px_rgba(22,163,74,0.25)]',
    inactiva: 'bg-[rgba(22,163,74,0.08)] text-[#16a34a] border border-[rgba(22,163,74,0.3)]',
  },
]

export default function Cocina() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [activeItem, setActiveItem] = useState('Pedidos')
  const [filtro, setFiltro] = useState('todos')
  const [pedidos, setPedidos] = useState(pedidosMock)

  const setEstadoPedido = (id: string, estado: string) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estado } : p))
    )
  }

  const pedidosFiltrados = pedidos.filter((p) =>
    filtro === 'todos' ? true : p.tipo === filtro
  )

  return (
    <div
      className="flex min-h-screen font-['Manrope',_'DM_Sans',_sans-serif]"
      style={{
        ['--wa-primary' as any]: '#a5360d',
        ['--wa-primary-dark' as any]: '#852400',
        ['--wa-primary-light' as any]: '#ffdbd0',
        ['--wa-primary-container' as any]: '#c74d24',
        ['--wa-secondary' as any]: '#855400',
        ['--wa-secondary-light' as any]: '#ffddb7',
        ['--wa-secondary-fixed-dim' as any]: '#ffb95d',
        ['--wa-secondary-container' as any]: '#fcaa33',
        ['--wa-tertiary' as any]: '#00694c',
        ['--wa-tertiary-light' as any]: '#86f8c9',
        ['--wa-bg' as any]: '#fcf9f8',
        ['--wa-surface' as any]: '#ffffff',
        ['--wa-surface-low' as any]: '#f6f3f2',
        ['--wa-surface-mid' as any]: '#f0eded',
        ['--wa-surface-high' as any]: '#e5e2e1',
        ['--wa-text' as any]: '#1c1b1b',
        ['--wa-text-muted' as any]: '#58423b',
        ['--wa-border' as any]: 'rgba(224, 192, 182, 0.2)',
        background: 'var(--wa-bg)',
        color: 'var(--wa-text)',
      }}
    >
      <aside className="flex h-screen w-64 min-w-64 shrink-0 flex-col bg-[var(--wa-bg)] p-6 px-4">
        <div className="mb-10 px-2">
          <span className="block text-[1.25rem] font-extrabold tracking-[-0.03em] text-[var(--wa-primary)]">
            Remi<span className="text-[var(--wa-primary)]">Soft</span>
          </span>
          <div className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">
            Cocina
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-[0.95rem] font-bold transition-all duration-150 ease-in-out active:scale-[0.97] ${
                activeItem === item.label
                  ? 'bg-[var(--wa-surface)] text-[var(--wa-primary)] shadow-[0_2px_10px_rgba(28,27,27,0.05)]'
                  : 'bg-transparent text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2">
  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[var(--wa-primary)] to-[var(--wa-primary-container)] px-4 py-3.5 text-[0.9rem] font-extrabold text-white shadow-[0_16px_24px_rgba(165,54,13,0.22)]">
    <span className="material-symbols-outlined text-[18px]">add</span>
    Acción Rápida
  </button>
  
  <button
    onClick={() => { logout(); navigate('/') }}
    className="flex w-full items-center gap-3 rounded-xl bg-transparent px-3 py-3.5 text-left text-[0.95rem] font-bold text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)]"
  >
    <span className="material-symbols-outlined text-[18px]">logout</span>
    Cerrar sesión
  </button>
</div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--wa-surface-low)]">
        <header className="flex items-center justify-between gap-6 border-b border-[var(--wa-border)] bg-[rgba(252,249,248,0.8)] px-6 py-3 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] backdrop-blur-[12px]">
          <span className="text-[1.125rem] font-black text-[var(--wa-text)]">
            Bienvenido, {user?.nombre ?? 'Cocina'}
          </span>
          <div className="flex items-center gap-6">
            <button className="flex items-center justify-center border-none bg-transparent text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-2 border-l border-[var(--wa-border)] pl-4">
              <span className="block text-[0.75rem] font-extrabold">{user?.nombre ?? 'Cocina'}</span>
              <span className="material-symbols-outlined text-[var(--wa-primary)] [font-variation-settings:'FILL'_1]">account_circle</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">
          {activeItem === 'Pedidos' && (
            <>
              <section className="grid grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className={`flex min-h-[112px] flex-col justify-between rounded-[20px] bg-[var(--wa-surface)] p-6 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.03)] ${
                      stat.accented ? 'border-l-4 border-[var(--wa-secondary)]' : ''
                    }`}
                  >
                    <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">
                      {stat.label}
                    </p>
                    <span
                      className={`text-[2.25rem] font-black tracking-[-0.05em] ${
                        stat.color === 'amber' ? 'text-[var(--wa-secondary)]' : stat.color === 'green' ? 'text-[var(--wa-tertiary)]' : ''
                      }`}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </section>

              <section className="flex items-center gap-3">
                {filtros.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFiltro(f.key)}
                    className={`rounded-full border px-4 py-2 text-[0.75rem] font-extrabold uppercase tracking-[0.1em] transition-all ${
                      filtro === f.key
                        ? 'border-[var(--wa-primary)] bg-[var(--wa-primary)] text-white'
                        : 'border-[var(--wa-border)] bg-[var(--wa-surface)] text-[var(--wa-text-muted)]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </section>

              <section className="grid grid-cols-3 gap-6">
                {pedidosFiltrados.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="flex flex-col gap-4 rounded-[20px] bg-[var(--wa-surface)] p-5 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.03)]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[0.95rem] font-black">{pedido.id}</p>
                        <p className="text-[0.75rem] font-bold text-[var(--wa-text-muted)]">{pedido.origen}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[0.625rem] font-extrabold uppercase tracking-[0.1em] ${estadoBadge[pedido.estado]}`}>
                        {estadoLabel[pedido.estado]}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-1.5">
                      {pedido.items.map((it, i) => (
                        <li key={i} className="text-[0.85rem] font-bold text-[var(--wa-text)]">
                          {it.cant}x {it.nombre}
                        </li>
                      ))}
                    </ul>

                    {pedido.notas && (
                      <p className="rounded-lg bg-[var(--wa-surface-low)] px-3 py-2 text-[0.75rem] font-bold text-[var(--wa-secondary)]">
                        Nota: {pedido.notas}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 border-t border-[var(--wa-border)] pt-3">
                      <span className="text-[0.7rem] font-bold text-[var(--wa-text-muted)]">{pedido.hora}</span>
                      <div className="flex items-center gap-2">
                        {estadosBoton.map((eb) => (
                          <button
                            key={eb.key}
                            onClick={() => setEstadoPedido(pedido.id, eb.key)}
                            className={`flex-1 rounded-xl px-3 py-2 text-[0.7rem] font-extrabold transition-all ${
                              pedido.estado === eb.key ? eb.activa : eb.inactiva
                            }`}
                          >
                            {eb.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </>
          )}

          {activeItem === 'Historial' && (
            <section className="flex flex-col gap-3 rounded-[20px] bg-[var(--wa-surface)] p-6 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.03)]">
              <h2 className="mb-2 text-[1.125rem] font-black">Historial de pedidos completados</h2>
              {historialMock.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between border-b border-[var(--wa-border)] py-3 last:border-none"
                >
                  <div>
                    <p className="text-[0.85rem] font-black">{h.id}</p>
                    <p className="text-[0.75rem] font-bold text-[var(--wa-text-muted)]">{h.origen}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.75rem] font-bold text-[var(--wa-text-muted)]">{h.hora}</p>
                    <p className="text-[0.75rem] font-extrabold text-[var(--wa-tertiary)]">Prep: {h.tiempo}</p>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  )
}