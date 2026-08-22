/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import './Mesero.css'

const navItems = [
  { icon: 'table_restaurant', label: 'Mesas' },
  { icon: 'receipt_long', label: 'Pedidos' },
  { icon: 'point_of_sale', label: 'Caja' },
  { icon: 'description', label: 'Facturas' },
]

const stats = [
  { label: 'Mesas activas', value: '12', detail: '/ 24 total', color: 'green' },
  { label: 'Mesas en espera', value: '04', detail: 'Mesas esperando', color: 'amber', accented: true },
  { label: 'Ingresos', value: '2,482', prefix: '$', color: 'default' },
]

const tables = [
  { number: '12', name: 'The Smiths', meta: '4 Invitados • 6 Artículos', total: '$142.50', badge: '24m', state: 'occupied' },
  { number: '08', state: 'available' },
  { number: '04', name: 'Mesa 04', meta: '2 Invitados • Ordenando', total: '$0.00', badge: 'Esperando', state: 'waiting' },
  { number: '15', name: 'Alex & Co.', meta: '3 Invitados • Cuenta Lista', total: '$89.20', badge: 'Hecho', state: 'done' },
  { number: '22', name: 'Mesa 22', meta: '5 Invitados • Platos Principales Servidos', total: '$310.00', badge: '45m', state: 'occupied' },
  { number: '01', name: 'Mesa 01', meta: '2 Invitados • Entrantes', total: '$45.00', badge: '12m', state: 'occupied' },
  { number: '03', state: 'available' },
  { number: '09', state: 'available' },
]

const feedItems = [
  { status: 'Mesa 12 • Lista', time: 'Ahora mismo', title: '2x Lubina a la Parrilla', detail: 'Plato Principal • Paso A', tone: 'ready' },
  { status: 'Mesa 04 • Nueva Orden', time: 'hace 3m', title: '1x Risotto de Trufa', detail: 'Cocinando • Estación 2', tone: 'default' },
  { status: 'Mesa 01 • Retrasado', time: 'hace 8m', title: '1x Ribeye Poco Hecho', detail: 'Esperando guarnición • Estación 1', tone: 'warning' },
  { status: 'Mesa 15 • Lista', time: 'hace 12m', title: 'Botella de Chablis', detail: 'Lista en Barra', tone: 'ready' },
  { status: 'Mesa 22 • Enviado', time: 'hace 15m', title: 'Selección de Postres', detail: 'Preparando • Pastelería', tone: 'default' },
]

interface Pedido {
  id_pedido: number
  id_cliente: number | null
  id_mesero: number | null
  estado: string
  Tipo_pedido: string
  Mesa_num: number | null
  notas: string
  nombre_cliente?: string
  nombre_mesero?: string
}

const pedidoVacio = {
  id_cliente: '',
  id_mesero: '',
  estado: 'ABIERTO',
  Tipo_pedido: 'MESA',
  Mesa_num: '',
  notas: '',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
  border: '1.5px solid var(--borde)', background: 'var(--bg)',
  fontSize: '0.95rem', color: 'var(--texto)', outline: 'none',
  boxSizing: 'border-box',
}

function Mesero() {
  const [activeItem, setActiveItem] = useState('Mesas')
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargandoPedidos, setCargandoPedidos] = useState(false)
  const [modalPedido, setModalPedido] = useState(false)
  const [modoEdicionPedido, setModoEdicionPedido] = useState(false)
  const [pedidoActual, setPedidoActual] = useState(pedidoVacio)
  const [idEditandoPedido, setIdEditandoPedido] = useState<number | null>(null)
  const [guardandoPedido, setGuardandoPedido] = useState(false)
  const [errorPedido, setErrorPedido] = useState<string | null>(null)

  const cargarPedidos = () => {
    setCargandoPedidos(true)
    api.get('/pedidos').then(r => setPedidos(r.data)).catch(console.error).finally(() => setCargandoPedidos(false))
  }

  useEffect(() => { if (activeItem === 'Pedidos') cargarPedidos() }, [activeItem])

  const abrirCrearPedido = () => {
    setModoEdicionPedido(false)
    setPedidoActual(pedidoVacio)
    setIdEditandoPedido(null)
    setErrorPedido(null)
    setModalPedido(true)
  }

  // Comunicación HIJO → PADRE: la fila de la tabla (hijo) llama esta función
  // pasando sus datos al estado del padre para poblar el formulario
  const abrirEditarPedido = (p: Pedido) => {
    setModoEdicionPedido(true)
    setPedidoActual({
      id_cliente: p.id_cliente?.toString() ?? '',
      id_mesero: p.id_mesero?.toString() ?? '',
      estado: p.estado,
      Tipo_pedido: p.Tipo_pedido,
      Mesa_num: p.Mesa_num?.toString() ?? '',
      notas: p.notas ?? '',
    })
    setIdEditandoPedido(p.id_pedido)
    setErrorPedido(null)
    setModalPedido(true)
  }

  const guardarPedido = async () => {
    if (!pedidoActual.Tipo_pedido.trim()) { setErrorPedido('El tipo de pedido es obligatorio'); return }
    setGuardandoPedido(true)
    setErrorPedido(null)
    try {
      const payload = {
        ...pedidoActual,
        id_cliente: pedidoActual.id_cliente ? Number(pedidoActual.id_cliente) : null,
        id_mesero: pedidoActual.id_mesero ? Number(pedidoActual.id_mesero) : null,
        Mesa_num: pedidoActual.Mesa_num ? Number(pedidoActual.Mesa_num) : null,
      }
      modoEdicionPedido && idEditandoPedido
        ? await api.put(`/pedidos/${idEditandoPedido}`, payload)
        : await api.post('/pedidos', payload)
      setModalPedido(false)
      cargarPedidos()
    } catch (err: any) {
      setErrorPedido(err.response?.data?.message ?? 'Error al guardar')
    } finally {
      setGuardandoPedido(false)
    }
  }

  const cancelarPedido = async (id: number) => {
    if (!confirm('¿Deseas cancelar este pedido?')) return
    try { await api.delete(`/pedidos/${id}`); cargarPedidos() } catch { alert('Error al cancelar') }
  }
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
            Mesero
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
          <button className="flex w-full items-center gap-3 rounded-xl bg-transparent px-3 py-3.5 text-left text-[0.95rem] font-bold text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)]">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Configuraciones
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
          <div className="flex items-center gap-6">
            <span className="text-[1.125rem] font-black text-[var(--wa-text)]">Bienvenido de nuevo, {user?.nombre ?? 'Mesero'}</span>
            <div className="flex items-center gap-6">
              <button className="border-none bg-transparent text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-primary)]">Plano del Piso</button>
              <button className="border-none bg-transparent text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">Pago Rápido</button>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[var(--wa-text-muted)]">search</span>
              <input
                type="text"
                placeholder="Buscar mesas o artículos..."
                className="w-full rounded-full border border-[var(--wa-border)] bg-[var(--wa-surface)] py-2.5 pl-10 pr-4 text-[0.875rem] outline-none focus:border-[var(--wa-primary)]"
              />
            </div>
            <button className="flex items-center justify-center border-none bg-transparent text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-2 border-l border-[var(--wa-border)] pl-4">
              <span className="block text-[0.75rem] font-extrabold">{user?.nombre ?? 'Mesero'}</span>
              <span className="material-symbols-outlined text-[var(--wa-primary)] [font-variation-settings:'FILL'_1]">account_circle</span>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">

          {activeItem === 'Mesas' && (
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
                      <span className={`text-[2.25rem] font-black tracking-[-0.05em] ${stat.color === 'amber' ? 'text-[var(--wa-secondary)]' : ''}`}>{stat.value}</span>
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
                      <p className="text-[0.875rem] font-semibold text-[var(--wa-text-muted)]">Haz clic en una mesa para gestionar pedidos o generar facturas.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(0,105,76,0.1)] px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-[var(--wa-tertiary)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--wa-tertiary)]" />Disponible
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(133,84,0,0.1)] px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-[var(--wa-secondary)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--wa-secondary)]" />Ocupada
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
                                table.state === 'waiting' ? 'bg-[var(--wa-secondary-container)] text-[#2a1700]' : 'bg-[var(--wa-secondary-fixed-dim)] text-[#2a1700]'
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
                    {feedItems.map((item) => (
                      <div
                        key={`${item.status}-${item.time}`}
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
          )}

          {/* CRUD Pedidos
              Padre → Hijo: modalPedido, modoEdicionPedido, pedidoActual, errorPedido,
                            guardandoPedido se pasan como props al Modal (hijo)
              Hijo → Padre: botón Editar en la tabla llama abrirEditarPedido(p)
                            actualizando el estado del padre con los datos del pedido
          */}
          {activeItem === 'Pedidos' && (
            <section style={{ margin: '1.5rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--borde)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Gestión de Pedidos</h3>
                <button className="wa-sidebar-primary-btn" style={{ width: 'auto', padding: '0.5rem 1.25rem' }} onClick={abrirCrearPedido}>
                  + Nuevo Pedido
                </button>
              </div>
              {cargandoPedidos
                ? <p style={{ color: 'var(--texto-muted)', fontSize: '0.85rem' }}>Cargando...</p>
                : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--borde)' }}>
                          {['#', 'Cliente', 'Mesero', 'Tipo', 'Mesa', 'Estado', 'Notas', 'Acciones'].map(h => (
                            <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--texto-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pedidos.length === 0
                          ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--texto-muted)' }}>Sin pedidos registrados</td></tr>
                          : pedidos.map(p => (
                            <tr key={p.id_pedido} style={{ borderBottom: '1px solid var(--borde)' }}>
                              <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600 }}>{p.id_pedido}</td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>{p.nombre_cliente ?? p.id_cliente ?? '—'}</td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>{p.nombre_mesero ?? p.id_mesero ?? '—'}</td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>{p.Tipo_pedido}</td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>{p.Mesa_num ?? '—'}</td>
                              <td style={{ padding: '0.6rem 0.75rem', color: p.estado === 'ABIERTO' ? 'var(--verde, #22c55e)' : p.estado === 'CANCELADO' ? 'var(--rojo, #ef4444)' : 'var(--texto-muted)' }}>{p.estado}</td>
                              <td style={{ padding: '0.6rem 0.75rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.notas || '—'}</td>
                              <td style={{ padding: '0.6rem 0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button className="wa-sidebar-secondary-btn" style={{ width: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.8rem' }} onClick={() => abrirEditarPedido(p)}>Editar</button>
                                  <button className="wa-sidebar-secondary-btn" style={{ width: 'auto', padding: '0.35rem 0.85rem', fontSize: '0.8rem', color: 'var(--rojo, #ef4444)', borderColor: 'var(--rojo, #ef4444)' }} onClick={() => cancelarPedido(p.id_pedido)} disabled={p.estado === 'CANCELADO'}>Cancelar</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

              <Modal isOpen={modalPedido} onClose={() => setModalPedido(false)}>
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  <h3 style={{ marginBottom: '1.25rem', fontWeight: 700 }}>{modoEdicionPedido ? 'Editar Pedido' : 'Nuevo Pedido'}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-muted)', display: 'block', marginBottom: '0.3rem' }}>ID Cliente</label>
                      <input style={inputStyle} type="number" placeholder="Opcional" value={pedidoActual.id_cliente} onChange={e => setPedidoActual(prev => ({ ...prev, id_cliente: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-muted)', display: 'block', marginBottom: '0.3rem' }}>ID Mesero</label>
                      <input style={inputStyle} type="number" placeholder="Opcional" value={pedidoActual.id_mesero} onChange={e => setPedidoActual(prev => ({ ...prev, id_mesero: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-muted)', display: 'block', marginBottom: '0.3rem' }}>Tipo de Pedido *</label>
                      <select style={inputStyle} value={pedidoActual.Tipo_pedido} onChange={e => setPedidoActual(prev => ({ ...prev, Tipo_pedido: e.target.value }))}>
                        <option value="MESA">MESA</option>
                        <option value="DOMICILIO">DOMICILIO</option>
                        <option value="LLEVAR">LLEVAR</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-muted)', display: 'block', marginBottom: '0.3rem' }}>Número de Mesa</label>
                      <input style={inputStyle} type="number" placeholder="Opcional" value={pedidoActual.Mesa_num} onChange={e => setPedidoActual(prev => ({ ...prev, Mesa_num: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-muted)', display: 'block', marginBottom: '0.3rem' }}>Estado</label>
                      <select style={inputStyle} value={pedidoActual.estado} onChange={e => setPedidoActual(prev => ({ ...prev, estado: e.target.value }))}>
                        <option value="ABIERTO">ABIERTO</option>
                        <option value="EN_PROCESO">EN_PROCESO</option>
                        <option value="LISTO">LISTO</option>
                        <option value="ENTREGADO">ENTREGADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--texto-muted)', display: 'block', marginBottom: '0.3rem' }}>Notas</label>
                      <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' } as React.CSSProperties} placeholder="Indicaciones especiales..." value={pedidoActual.notas} onChange={e => setPedidoActual(prev => ({ ...prev, notas: e.target.value }))} />
                    </div>
                    {errorPedido && <p style={{ color: 'var(--rojo, #ef4444)', fontSize: '0.82rem', background: 'rgba(239,68,68,0.08)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>{errorPedido}</p>}
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button className="wa-sidebar-secondary-btn" style={{ width: 'auto', padding: '0.5rem 1.25rem' }} onClick={() => setModalPedido(false)}>Cancelar</button>
                      <button className="wa-sidebar-primary-btn" style={{ width: 'auto', padding: '0.5rem 1.25rem' }} onClick={guardarPedido} disabled={guardandoPedido}>{guardandoPedido ? 'Guardando...' : modoEdicionPedido ? 'Actualizar' : 'Crear Pedido'}</button>
                    </div>
                  </div>
                </div>
              </Modal>
            </section>
          )}

          {(activeItem === 'Caja' || activeItem === 'Facturas') && (
            <div style={{ margin: '1.5rem', padding: '3rem', textAlign: 'center', color: 'var(--texto-muted)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>{activeItem === 'Caja' ? 'point_of_sale' : 'description'}</span>
              Sección <strong>{activeItem}</strong> en construcción
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


export default Mesero
