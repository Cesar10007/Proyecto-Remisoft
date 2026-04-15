import { useState } from 'react'
import '../../styles/pages/superadmin.css'
import Footer from '../../components/layout/Footer'

const menuItems = [
  { icon: 'group', label: 'Gestión de Usuarios' },
  { icon: 'mark_email_unread', label: 'Solicitudes de Usuarios' },
  { icon: 'settings_applications', label: 'Configuración del Sistema' },
]

const metrics = [
  { label: 'Usuarios Activos Totales', value: '12,482', detail: '+8.4% este mes', icon: 'trending_up', color: 'green' },
  { label: 'Solicitudes Pendientes', value: '42', detail: '12 Prioridad Urgente', icon: null, color: 'amber' },
  { label: 'Tiempo de Actividad del Sistema', value: '99.98%', detail: 'Todos los nodos saludables', icon: 'check_circle', color: 'green' },
  { label: 'Respuesta de API', value: '142ms', detail: 'Latencia promedio global', icon: null, color: 'default' },
]

const users = [
  { name: 'Elena Rodriguez', email: 'elena.rod@culinary.app', role: 'Chef Ejecutivo', status: 'Activo', active: true, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgKVzMh8RGrwjXaPArZfC27ioglR8ckA-xbE6HO5DGYA4CaLheRWr4d-zWK2rxyiilQLZeUxwg3ak9wY2QO0igkopXaUpNXfDIms3kg17m-oS464Ff0gRpcIqMDWcRyxYQNgAGEMHUSuGwey7sfAJWBg7hJluvy32OI5y0M0h02gtPFE4fr_PGuIEIx-n9EqyCmTvAmhtiCWAr8TpjtzQFymtyDxH3Ajsl0RRmjTtaoLcZzXvwNnreOzLD79vpJF2jF7ziLLlQS9s' },
  { name: 'Marcus Thorne', email: 'm.thorne@vanguard.io', role: 'Gerente Regional', status: 'Activo', active: true, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd_CEMmwx5oO5De7cTWM-IcG31-c1C495Hd6FCdOqvQboJa7_fu4MRhJzlVftQXk2MB68JjdhLDq-569i7GF91IpEqOp90qfxQUblMXjiWe6wOOvJBZAMEPL6Mk71WijbWtRaK0w5Lcjh65t_mOdJ0Q34IzIBUMewNg6ssi6AI0LcKLLXWP0Z1D4_EwVYnrngbQHW_h4bh5ROYt8XV_5D4g-EYkOPv9eNISTSxTAq2g_mpE0jsrKZWNH2fMKvKUlyyl0V2krNJDoQ' },
  { name: 'Silas Vane', email: 'silas.v@sys.admin', role: 'Editor', status: 'Inactivo', active: false, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVdcGeib1pUsuFWFo-mozhtDTN7dkeLDeK8VTzoUe1G_63RBVpcao5G56H6TtM_PjGOYY_R3AjXNhaAL_iwTNwkcxNaT5v96ILwSChXjsG9Q3CwKZPzb0NsCpOU1WIbUvvreE_L6lWR1GyP6dckzPpXB3BnP-jMNStLq4S4eZMrKHPu8u3XZsbmMyZRWk0R3U3XVTtXcvjrhH6tFjhSIQwwf0NpS-WjiVsqTsCD9vkWheTeDh6PxCLURxPxQCe47_n0mWQtLAyfME' },
]

const requests = [
  { icon: 'key', title: 'Omisión de Restablecimiento de Contraseña', sub: 'Solicitud de David Lynch', color: 'primary' },
  { icon: 'person_search', title: 'Verificación de Cuenta', sub: 'Se requiere verificación manual de ID', color: 'secondary' },
]

const serverStats = [
  { name: 'Motor de Autenticación', value: 'ESTABLE', color: 'green' },
  { name: 'Sincronización de Datos', value: '94.2% CARGA', color: 'green' },
  { name: 'Cola de Correo', value: 'RECUPERANDO', color: 'amber' },
]

function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('Gestión de Usuarios')

  return (
    <div className="sa-wrapper">
      <aside style={{
        width: '240px', minHeight: '100vh', background: 'var(--bg-card)',
        borderRight: '1px solid var(--borde)', display: 'flex', flexDirection: 'column',
        padding: '24px 16px', position: 'fixed', top: 0, left: 0, zIndex: 100
      }}>
        <div style={{ marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: 'var(--rojo-dark)' }}>
            Remi<span style={{ color: 'var(--amarillo)' }}>Soft</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--texto-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' }}>
            Superadministrador
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                background: activeTab === item.label ? 'var(--rojo-light)' : 'transparent',
                color: activeTab === item.label ? 'var(--rojo-dark)' : 'var(--texto-muted)',
                borderRight: activeTab === item.label ? '3px solid var(--rojo)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--borde)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button style={{
            background: 'var(--rojo)', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '10px', fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', marginBottom: '8px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '8px' }}>contact_support</span>
            Soporte
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--texto-muted)', fontSize: '0.875rem', padding: '8px 12px',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history_edu</span>
            Registros
          </button>
          <button style={{
            background: 'var(--rojo)', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '10px', fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
          }}>
            Parada de Emergencia Global
          </button>
        </div>
      </aside>

      <main className="sa-main" style={{ marginLeft: '240px', flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <header className="sa-topbar">
          <div className="sa-topbar__left">
            <h1 className="sa-topbar__title">Centro de Comando Administrativo</h1>
            <div className="sa-topbar__tabs">
              <button className="sa-topbar__tab sa-topbar__tab--active">Resumen</button>
              <button className="sa-topbar__tab">Rutas de Auditoría</button>
            </div>
          </div>

          <div className="sa-topbar__right">
            <div className="sa-search">
              <span className="material-symbols-outlined sa-search__icon">search</span>
              <input type="text" placeholder="Buscar parámetros..." />
            </div>
            <button className="sa-icon-btn"><span className="material-symbols-outlined">notifications</span></button>
            <button className="sa-icon-btn"><span className="material-symbols-outlined">admin_panel_settings</span></button>
            <div className="sa-avatar-wrap">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYA_w4xq4FO56_E-LP5rS02cr_rwV1IeCSlk7c1APa2msilQVu0hJvDbm939jn2jZbD33jMM-XIBgUwFsxs6lqySTcBDp0eQiMBfXNtWSf9O4v348emGmL7OP4Ex311pCicMuBvV_8Z9TvW0OG1hc5q_LFI6Ld4jghagujeuxm3eoBmZqA-G8j5XPEp6_CTYO4m6GKNav0mkcszK-4bRp7N5H8PmdWYEyzVYjW_GpV64tkU022Sk0kMegnZew8FHDlcZamPyAD3g"
                alt="Avatar de Superadmin"
                className="sa-avatar"
              />
            </div>
          </div>
        </header>

        <div className="sa-content">
          <section className="sa-metrics-grid">
            {metrics.map((metric) => (
              <div key={metric.label} className="sa-metric-card">
                <p className="sa-metric-card__label">{metric.label}</p>
                <h3 className={`sa-metric-card__value${metric.color ? ` sa-metric-card__value--${metric.color}` : ''}`}>{metric.value}</h3>
                {metric.icon ? (
                  <div className={`sa-metric-card__detail sa-metric-card__detail--${metric.color}`}>
                    <span className="material-symbols-outlined">{metric.icon}</span>
                    <span>{metric.detail}</span>
                  </div>
                ) : (
                  <p className="sa-metric-card__text-detail">{metric.detail}</p>
                )}
              </div>
            ))}
          </section>

          <section className="sa-main-grid">
            <section className="sa-users-panel">
              <div className="sa-panel-header">
                <div>
                  <h2 className="sa-panel-title">Gestión de Usuarios</h2>
                  <p className="sa-panel-subtitle">Controlar acceso a la plataforma y privilegios de usuario</p>
                </div>
                <button className="sa-btn-add-member">
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Agregar Miembro</span>
                </button>
              </div>

              <div className="sa-table-card">
                <div className="sa-table-scroll">
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>Perfil de Usuario</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.email}>
                          <td>
                            <div className="sa-user-cell">
                              <div className="sa-user-avatar-wrap">
                                <img src={user.avatar} alt={user.name} className="sa-user-avatar" />
                              </div>
                              <div>
                                <p className="sa-user-name">{user.name}</p>
                                <p className="sa-user-email">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="sa-role-pill">{user.role}</span>
                          </td>
                          <td>
                            <div className="sa-status-wrap">
                              <span className={`sa-status-dot${user.active ? ' sa-status-dot--active' : ''}`} />
                              <span className={`sa-status-text${user.active ? ' sa-status-text--active' : ''}`}>{user.status}</span>
                            </div>
                          </td>
                          <td>
                            <div className="sa-actions-cell">
                              <button className="sa-action-btn"><span className="material-symbols-outlined">edit</span></button>
                              <button className="sa-action-btn sa-action-btn--danger"><span className="material-symbols-outlined">block</span></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sa-table-footer">
                  <span>Mostrando 1 a 3 de 1,248 usuarios</span>
                  <div className="sa-pagination">
                    <button className="sa-page-btn"><span className="material-symbols-outlined">chevron_left</span></button>
                    <button className="sa-page-btn sa-page-btn--active">1</button>
                    <button className="sa-page-btn">2</button>
                    <button className="sa-page-btn"><span className="material-symbols-outlined">chevron_right</span></button>
                  </div>
                </div>
              </div>
            </section>

            <aside className="sa-side-panels">
              <div className="sa-config-card">
                <h2 className="sa-panel-title sa-panel-title--mb">Configuración del Sistema</h2>

                <div className="sa-config-list">
                  <div className="sa-config-row">
                    <div>
                      <p className="sa-config-row__title">Modo de Mantenimiento</p>
                      <p className="sa-config-row__sub">Pausar todo el tráfico público</p>
                    </div>
                    <label className="sa-switch">
                      <input type="checkbox" />
                      <span className="sa-switch__slider" />
                    </label>
                  </div>

                  <div className="sa-config-row">
                    <div>
                      <p className="sa-config-row__title">Estado de Registro</p>
                      <p className="sa-config-row__sub">Aceptar nuevos registros de usuarios</p>
                    </div>
                    <label className="sa-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="sa-switch__slider sa-switch__slider--green" />
                    </label>
                  </div>

                  <div className="sa-api-block">
                    <label className="sa-api-label">Clave API Global</label>
                    <div className="sa-api-input-wrap">
                      <input type="password" value="sk_live_51M3fG9L9Zz8f4j3H" readOnly className="sa-api-input" />
                      <button className="sa-api-visibility-btn">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </div>

                  <button className="sa-btn-update-env">Actualizar Entorno Global</button>
                </div>
              </div>

              <div className="sa-requests-card">
                <div className="sa-requests-header">
                  <h2 className="sa-panel-title">Solicitudes Pendientes</h2>
                  <span className="sa-urgent-badge">Urgente</span>
                </div>

                <div className="sa-requests-list">
                  {requests.map((req) => (
                    <div key={req.title} className="sa-request-item">
                      <div className="sa-request-item__top">
                        <div className={`sa-request-icon sa-request-icon--${req.color}`}>
                          <span className="material-symbols-outlined">{req.icon}</span>
                        </div>
                        <div>
                          <p className="sa-request-title">{req.title}</p>
                          <p className="sa-request-sub">{req.sub}</p>
                        </div>
                      </div>
                      <div className="sa-request-actions">
                        <button className="sa-request-btn sa-request-btn--approve">Aprobar</button>
                        <button className="sa-request-btn sa-request-btn--reject">Rechazar</button>
                      </div>
                    </div>
                  ))}
                  <button className="sa-view-all-btn">Ver Todas las 42 Solicitudes</button>
                </div>
              </div>
            </aside>
          </section>

          <section className="sa-bottom-grid">
            <div className="sa-server-card">
              <div className="sa-server-card__content">
                <h2 className="sa-panel-title">Radar de Salud del Servidor</h2>
                <p className="sa-panel-subtitle">Estado en tiempo real de microservicios</p>
                <div className="sa-server-stats">
                  {serverStats.map((item) => (
                    <div key={item.name} className={`sa-server-stat${item.color === 'amber' ? ' sa-server-stat--warning' : ''}`}>
                      <span className={`sa-server-stat__dot sa-server-stat__dot--${item.color}`} />
                      <div>
                        <p className="sa-server-stat__label">{item.name}</p>
                        <p className="sa-server-stat__value">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sa-server-card__bg-icon">
                <span className="material-symbols-outlined">hub</span>
              </div>
            </div>

            <div className="sa-audit-card">
              <div className="sa-audit-card__content">
                <span className="material-symbols-outlined sa-audit-card__icon">auto_awesome</span>
                <h3>Inteligencia de Auditoría</h3>
                <p>Patrones impulsados por IA detectaron 3 intentos potenciales de acceso no autorizado hoy.</p>
              </div>
              <button className="sa-audit-btn">Ejecutar Auditoría de Seguridad Completa</button>
              <div className="sa-audit-card__glow" />
            </div>
          </section>

          <Footer />
        </div>
      </main>

      <button className="sa-fab">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  )
}

export default SuperAdmin