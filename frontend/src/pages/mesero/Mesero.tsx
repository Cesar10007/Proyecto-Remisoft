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
    <div className="wa-wrapper">
      <aside className="wa-sidebar">
        <div className="wa-sidebar-brand">
          <div className="wa-sidebar-logo">Remi<span className="wa-sidebar-logo-accent">Soft</span></div>
          <div className="wa-sidebar-role">Mesero</div>
        </div>
        <div className="wa-sidebar-nav">
          {navItems.map((item) => (
            <button key={item.label} onClick={() => setActiveItem(item.label)}
              className={`wa-sidebar-nav-btn${activeItem === item.label ? ' wa-sidebar-nav-btn--active' : ''}`}>
              <span className="material-symbols-outlined wa-sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="wa-sidebar-footer">
          <button className="wa-sidebar-primary-btn">
            <span className="material-symbols-outlined wa-sidebar-footer-icon">add</span>
            Acción Rápida
          </button>
          <button className="wa-sidebar-secondary-btn">
            <span className="material-symbols-outlined wa-sidebar-footer-icon">settings</span>
            Configuraciones
          </button>
          <button onClick={() => { logout(); navigate('/') }} className="wa-sidebar-secondary-btn">
            <span className="material-symbols-outlined wa-sidebar-footer-icon">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="wa-main">
        <header className="wa-topbar">
          <div className="wa-topbar__left">
            <span className="wa-topbar__brand">Bienvenido de nuevo, {user?.nombre ?? 'Mesero'}</span>
            <div className="wa-topbar__tabs">
              <button className="wa-topbar__tab wa-topbar__tab--active">Plano del Piso</button>
              <button className="wa-topbar__tab">Pago Rápido</button>
            </div>
          </div>
          <div className="wa-topbar__right">
            <div className="wa-search">
              <span className="material-symbols-outlined wa-search__icon">search</span>
              <input type="text" placeholder="Buscar mesas o artículos..." />
            </div>
            <button className="wa-icon-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="wa-profile">
              <span className="wa-profile__name">{user?.nombre ?? 'Mesero'}</span>
              <span className="material-symbols-outlined wa-profile__icon">account_circle</span>
            </div>
          </div>
        </header>

        <div className="wa-content">

          {activeItem === 'Mesas' && (
            <>
              <section className="wa-stats-grid">
                {stats.map((stat) => (
                  <div key={stat.label} className={`wa-stat-card${stat.accented ? ' wa-stat-card--attention' : ''}`}>
                    <p className="wa-stat-card__label">{stat.label}</p>
                    <div className="wa-stat-card__value-wrap">
                      {stat.prefix && <span className="wa-stat-card__prefix">{stat.prefix}</span>}
                      <span className={`wa-stat-card__value${stat.color === 'amber' ? ' wa-stat-card__value--amber' : ''}`}>{stat.value}</span>
                      {stat.detail && stat.label === 'Mesas activas' && <span className="wa-stat-card__detail wa-stat-card__detail--green">{stat.detail}</span>}
                      {stat.detail && stat.label === 'Mesas en espera' && <span className="wa-stat-card__detail">{stat.detail}</span>}
                    </div>
                  </div>
                ))}
                <button className="wa-sale-card">
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                  <p>Registrar Venta</p>
                </button>
              </section>
              <div className="wa-grid">
                <section className="wa-floor-section">
                  <div className="wa-floor-section__header">
                    <div>
                      <h2>Sala de Comedor Principal</h2>
                      <p>Haz clic en una mesa para gestionar pedidos o generar facturas.</p>
                    </div>
                    <div className="wa-floor-section__legend">
                      <span className="wa-legend-pill wa-legend-pill--green"><span className="wa-legend-dot wa-legend-dot--green" />Disponible</span>
                      <span className="wa-legend-pill wa-legend-pill--amber"><span className="wa-legend-dot wa-legend-dot--amber" />Ocupada</span>
                    </div>
                  </div>
                  <div className="wa-table-grid">
                    {tables.map((table) => {
                      if (table.state === 'available') {
                        return (
                          <div key={table.number} className="wa-table-card wa-table-card--available">
                            <div className="wa-table-card__number wa-table-card__number--available">{table.number}</div>
                            <p className="wa-table-card__empty-label">Disponible</p>
                          </div>
                        )
                      }
                      return (
                        <div key={table.number} className={`wa-table-card wa-table-card--${table.state}`}>
                          <div className="wa-table-card__top">
                            <div className={`wa-table-card__number${table.state === 'waiting' ? ' wa-table-card__number--warning' : ''}`}>{table.number}</div>
                            <span className={`wa-table-card__badge${table.state === 'waiting' ? ' wa-table-card__badge--waiting' : ''}${table.state === 'done' ? ' wa-table-card__badge--done' : ''}`}>{table.badge}</span>
                          </div>
                          <div className="wa-table-card__body">
                            <h3>{table.name}</h3>
                            <p>{table.meta}</p>
                          </div>
                          <div className="wa-table-card__footer">
                            <span className="wa-table-card__price">{table.total}</span>
                            {table.state === 'done'
                              ? <button className="wa-table-card__invoice-btn">Factura</button>
                              : <button className="wa-table-card__icon-btn"><span className="material-symbols-outlined">{table.state === 'waiting' ? 'add' : table.number === '12' ? 'arrow_forward' : 'more_horiz'}</span></button>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
                <aside className="wa-feed-panel">
                  <div className="wa-feed-panel__header">
                    <h2>Cocina</h2>
                    <span className="material-symbols-outlined wa-feed-panel__icon">restaurant</span>
                  </div>
                  <div className="wa-feed-list">
                    {feedItems.map((item) => (
                      <div key={`${item.status}-${item.time}`} className={`wa-feed-item wa-feed-item--${item.tone}`}>
                        <div className="wa-feed-item__top">
                          <span className={`wa-feed-item__status wa-feed-item__status--${item.tone}`}>{item.status}</span>
                          <span className="wa-feed-item__time">{item.time}</span>
                        </div>
                        <p className="wa-feed-item__title">{item.title}</p>
                        <p className="wa-feed-item__detail">{item.detail}</p>
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
