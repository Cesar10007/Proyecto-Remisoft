import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

function Mesero() {
  const [activeItem, setActiveItem] = useState('Mesas')
  const navigate = useNavigate()

  return (
    <div className="wa-wrapper">
      <aside className="wa-sidebar">
        <div className="wa-sidebar-brand">
          <div className="wa-sidebar-logo">
            Remi<span className="wa-sidebar-logo-accent">Soft</span>
          </div>
          <div className="wa-sidebar-role">Mesero</div>
        </div>

        <div className="wa-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={`wa-sidebar-nav-btn${activeItem === item.label ? ' wa-sidebar-nav-btn--active' : ''}`}
            >
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

          <button onClick={() => navigate('/')} className="wa-sidebar-secondary-btn">
            <span className="material-symbols-outlined wa-sidebar-footer-icon">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="wa-main">
        <header className="wa-topbar">
          <div className="wa-topbar__left">
            <span className="wa-topbar__brand">POS Culinario</span>
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
              <span className="wa-profile__name">Julian Rossi</span>
              <span className="material-symbols-outlined wa-profile__icon">account_circle</span>
            </div>
          </div>
        </header>

        <div className="wa-content">
          <section className="wa-stats-grid">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`wa-stat-card${stat.accented ? ' wa-stat-card--attention' : ''}`}
              >
                <p className="wa-stat-card__label">{stat.label}</p>
                <div className="wa-stat-card__value-wrap">
                  {stat.prefix && <span className="wa-stat-card__prefix">{stat.prefix}</span>}
                  <span className={`wa-stat-card__value${stat.color === 'amber' ? ' wa-stat-card__value--amber' : ''}`}>
                    {stat.value}
                  </span>
                  {stat.detail && stat.label === 'Mesas activas' && (
                    <span className="wa-stat-card__detail wa-stat-card__detail--green">{stat.detail}</span>
                  )}
                  {stat.detail && stat.label === 'Mesas en espera' && (
                    <span className="wa-stat-card__detail">{stat.detail}</span>
                  )}
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
                  <span className="wa-legend-pill wa-legend-pill--green">
                    <span className="wa-legend-dot wa-legend-dot--green" />
                    Disponible
                  </span>
                  <span className="wa-legend-pill wa-legend-pill--amber">
                    <span className="wa-legend-dot wa-legend-dot--amber" />
                    Ocupada
                  </span>
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
                    <div
                      key={table.number}
                      className={`wa-table-card wa-table-card--${table.state}`}
                    >
                      <div className="wa-table-card__top">
                        <div className={`wa-table-card__number${table.state === 'waiting' ? ' wa-table-card__number--warning' : ''}`}>
                          {table.number}
                        </div>
                        <span className={`wa-table-card__badge${table.state === 'waiting' ? ' wa-table-card__badge--waiting' : ''}${table.state === 'done' ? ' wa-table-card__badge--done' : ''}`}>
                          {table.badge}
                        </span>
                      </div>

                      <div className="wa-table-card__body">
                        <h3>{table.name}</h3>
                        <p>{table.meta}</p>
                      </div>

                      <div className="wa-table-card__footer">
                        <span className="wa-table-card__price">{table.total}</span>
                        {table.state === 'done' ? (
                          <button className="wa-table-card__invoice-btn">Factura</button>
                        ) : (
                          <button className="wa-table-card__icon-btn">
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
                    <h4>{item.title}</h4>
                    <p>{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="wa-feed-panel__footer">
                <button className="wa-activity-btn">
                  <span className="material-symbols-outlined">history</span>
                  <span>Ver Toda la Actividad</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <button className="wa-fab">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  )
}

export default Mesero