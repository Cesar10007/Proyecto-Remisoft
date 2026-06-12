import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Repartidor.css'

const menuItems = [
  { icon: 'dashboard', label: 'Resumen' },
  { icon: 'local_shipping', label: 'Entregas' },
  { icon: 'history', label: 'Historial' },
  { icon: 'support_agent', label: 'Soporte' },
]

const stats = [
  { label: 'Ganancias del día', value: '$142.500', detail: '+12% vs ayer', tone: 'primary', highlighted: true },
  { label: 'Entregas completadas', value: '18', detail: '2 pendientes en cola', tone: 'success' },
  { label: 'Tiempo de turno', value: '6h 14m', detail: 'Inicio: 11:30 AM', tone: 'default' },
]

const orderDetails = [
  { name: '1x Truffle Risotto', price: '$32.000' },
  { name: '2x Vintage Negroni', price: '$28.000' },
]

const paymentMethods = [
  { icon: 'payments', label: 'Efectivo' },
  { icon: 'credit_card', label: 'Tarjeta', active: true },
  { icon: 'qr_code_2', label: 'App Pay' },
]

const queue = [
  { id: 'Pedido #8845', restaurant: 'The Bistro Main', eta: '12 min', distance: '2.4 km', address: '42 West Side Apts', icon: 'restaurant' },
  { id: 'Pedido #8848', restaurant: "Mamma's Kitchen", eta: '22 min', distance: '4.1 km', address: 'Central Plaza Hotel', icon: 'local_pizza' },
]

function Repartidor() {
  const [activeItem, setActiveItem] = useState('Entregas')
  const navigate = useNavigate()

  return (
    <div className="rd-wrapper">
      <aside className="rd-sidebar">
        <div className="rd-sidebar-brand">
          <div className="rd-sidebar-logo">
            Remi<span className="rd-sidebar-logo-accent">Soft</span>
          </div>
          <div className="rd-sidebar-role">Operación de Reparto</div>
        </div>

        <div className="rd-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={`rd-sidebar-nav-btn${activeItem === item.label ? ' rd-sidebar-nav-btn--active' : ''}`}
            >
              <span className="material-symbols-outlined rd-sidebar-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="rd-sidebar-footer">
          <button className="rd-sidebar-primary-btn">
            <span className="material-symbols-outlined rd-sidebar-primary-btn__icon">schedule</span>
            Finalizar turno
          </button>

          <button className="rd-sidebar-secondary-btn">
            <span className="material-symbols-outlined rd-sidebar-footer-icon">settings</span>
            Configuraciones
          </button>

          <button onClick={() => navigate('/')} className="rd-sidebar-secondary-btn">
            <span className="material-symbols-outlined rd-sidebar-footer-icon">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="rd-main">
        <header className="rd-topbar">
          <div className="rd-topbar__left">
            <h1 className="rd-topbar__title">Panel de Repartidor</h1>
            <p className="rd-topbar__subtitle">Control de entregas activas, rutas y rendimiento del turno</p>
          </div>

          <div className="rd-topbar__right">
            <div className="rd-search">
              <span className="material-symbols-outlined rd-search__icon">search</span>
              <input type="text" placeholder="Buscar pedido, cliente o dirección..." />
            </div>
            <div className="rd-status-pill">
              <span className="rd-status-pill__dot" />
              <span>En línea</span>
            </div>
            <button className="rd-icon-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="rd-avatar-wrap">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5UJulGuq3heQhQ9rTk-dtg5k1IjkezBfDQp_HOJa1fArdRqsFURGoXJHLjk1Ljb4O6lLe4nr7svhUVYFUWBm_b5DTk8alriMqO1ekRf0bq8HZ2jXOHsjnkYlOyOaS8TvRJJ8pCr1W0N9rr_Zr4OnWa4ks_hToxOnumDdp9s-_FKz2O3gimjTs6nex-hWn45Uo-YChUCNkUJ_neaFx9bfi5oTt5bz2kejByzpfnFmNq7TCCdplh9BaWPpDhN1Cumzv7S5BxZPJPp4"
                alt="Repartidor"
                className="rd-avatar"
              />
            </div>
          </div>
        </header>

        <div className="rd-content">
          <section className="rd-stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className={`rd-stat-card${stat.highlighted ? ' rd-stat-card--highlighted' : ''}`}>
                <p className="rd-stat-card__label">{stat.label}</p>
                <h3 className={`rd-stat-card__value${stat.tone === 'success' ? ' rd-stat-card__value--success' : ''}`}>
                  {stat.value}
                </h3>
                <p className={`rd-stat-card__detail${stat.tone === 'success' ? ' rd-stat-card__detail--success' : ''}`}>
                  {stat.detail}
                </p>
              </div>
            ))}
          </section>

          <div className="rd-grid">
            <section className="rd-delivery-panel">
              <div className="rd-panel-header">
                <div>
                  <h2 className="rd-panel-title">Entrega activa</h2>
                  <p className="rd-panel-subtitle">Sigue la ruta, verifica el pedido y confirma la entrega</p>
                </div>
                <span className="rd-badge">Prioridad</span>
              </div>

              <div className="rd-map-card">
                <div className="rd-map-card__media">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeY9XMUzjnZPdHbkVGpSIMaQjnNHPBFWiOx1xPhyIyOwEO9gFKdw1AbLR4gmIYyGEx8Z6n8j5dF-t8lmNPmHzuAsIyVAupz6tRR7Q3Z4pKi-0QLA4vqFlkMKrtY1X70qCpVSbiZqe1Rj3-lTDoxKEkt9FuE7IPesKZV60fLz1V1fyibGNO2DeSQZD5t7McmnB25Bkn3UHqhLPktA2IURC-h9wpzd6TR0VY9XXm8wlMLYP4eXqhenpF6JexdmUtqK4_X5TDrotn00g"
                    alt="Mapa de ruta"
                  />
                  <div className="rd-map-card__overlay" />
                  <div className="rd-map-card__nav">
                    <div className="rd-map-card__nav-icon">
                      <span className="material-symbols-outlined">navigation</span>
                    </div>
                    <div>
                      <p>Próximo giro</p>
                      <h4>200 m • Derecha en Oak St.</h4>
                    </div>
                  </div>
                </div>

                <div className="rd-map-card__body">
                  <div className="rd-customer-row">
                    <div>
                      <p className="rd-caption">Cliente</p>
                      <h3 className="rd-customer-name">Eleanor Fitzwilliam</h3>
                      <div className="rd-address-row">
                        <span className="material-symbols-outlined">location_on</span>
                        <p>842 North Shore Dr, Apt 4C</p>
                      </div>
                    </div>
                    <button className="rd-call-btn">
                      <span className="material-symbols-outlined">call</span>
                    </button>
                  </div>

                  <div className="rd-order-card">
                    <p className="rd-caption">Detalle del pedido #8842</p>
                    <ul className="rd-order-list">
                      {orderDetails.map((item) => (
                        <li key={item.name}>
                          <span>{item.name}</span>
                          <span>{item.price}</span>
                        </li>
                      ))}
                      <li className="rd-order-list__total">
                        <span>Total a cobrar</span>
                        <span>$60.000</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rd-payment-block">
                    <p className="rd-caption">Finalizar entrega</p>
                    <div className="rd-payment-grid">
                      {paymentMethods.map((method) => (
                        <button key={method.label} className={`rd-payment-btn${method.active ? ' rd-payment-btn--active' : ''}`}>
                          <span className="material-symbols-outlined">{method.icon}</span>
                          <span>{method.label}</span>
                        </button>
                      ))}
                    </div>
                    <button className="rd-confirm-btn">
                      <span className="material-symbols-outlined">task_alt</span>
                      <span>Confirmar entrega</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="rd-side-column">
              <section className="rd-queue-card">
                <div className="rd-panel-header rd-panel-header--compact">
                  <div>
                    <h2 className="rd-panel-title">Siguientes entregas</h2>
                    <p className="rd-panel-subtitle">Pedidos asignados en espera</p>
                  </div>
                  <span className="rd-orders-count">2 pedidos</span>
                </div>

                <div className="rd-queue-list">
                  {queue.map((item) => (
                    <div key={item.id} className="rd-queue-item">
                      <div className="rd-queue-item__top">
                        <div className="rd-queue-item__identity">
                          <div className="rd-queue-item__icon">
                            <span className="material-symbols-outlined">{item.icon}</span>
                          </div>
                          <div>
                            <h5>{item.id}</h5>
                            <p>{item.restaurant}</p>
                          </div>
                        </div>
                        <div className="rd-queue-item__eta">
                          <strong>ETA: {item.eta}</strong>
                          <span>{item.distance}</span>
                        </div>
                      </div>
                      <div className="rd-queue-item__bottom">
                        <div className="rd-queue-item__address">
                          <span className="material-symbols-outlined">location_on</span>
                          <span>{item.address}</span>
                        </div>
                        <button>Ver detalle</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rd-performance-card">
                <div className="rd-performance-card__header">
                  <span className="material-symbols-outlined">insights</span>
                  <h3>Meta del turno</h3>
                </div>
                <div className="rd-progress-block">
                  <div className="rd-progress-top">
                    <span>Racha de entregas</span>
                    <span>8/10</span>
                  </div>
                  <div className="rd-progress-bar">
                    <div className="rd-progress-bar__fill" />
                  </div>
                </div>
                <p className="rd-performance-note">
                  Completa 2 entregas más sin retraso para desbloquear el bono express de $15.000.
                </p>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Repartidor