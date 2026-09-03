import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Footer from '../../components/layout/Footer'
import './SuperAdmin.css'

const menuItems = [
  { icon: 'dashboard', label: 'Resumen', path: '/superadmin' },
  { icon: 'group', label: 'Gestión de Gerentes', path: '/superadmin/gerentes' },
  { icon: 'mark_email_unread', label: 'Solicitudes', path: '/superadmin/solicitudes' },
]

function SuperAdmin() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const cerrarSesion = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="sa-wrapper">
      <aside className="ge-sidebar">
        <div className="ge-sidebar-brand">
          <div className="ge-logo">
            Remi<span className="ge-logo-accent">Soft</span>
          </div>
          <div className="ge-role">Superadministrador</div>
        </div>

        <nav
          className="ge-sidebar-menu"
          aria-label="Navegación del superadministrador"
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/superadmin'}
              className={({ isActive }) =>
                `ge-menu-btn ${isActive ? 'is-active' : ''}`
              }
            >
              <span className="material-symbols-outlined ge-menu-icon">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ge-sidebar-footer">
          <button
            onClick={cerrarSesion}
            className="ge-logout-btn"
            type="button"
          >
            <span className="material-symbols-outlined ge-logout-icon">
              logout
            </span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="sa-main">
        <header className="sa-topbar">
          <div className="sa-topbar__left">
            <h1 className="sa-topbar__title">
              Centro de Comando Administrativo
            </h1>
            <p className="sa-welcome">
              Bienvenido, {user?.nombre ?? 'SuperAdmin'}
            </p>
          </div>

          <div className="sa-topbar__right">
            <button
              className="sa-icon-btn"
              type="button"
              aria-label="Notificaciones"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <button
              className="sa-icon-btn"
              type="button"
              aria-label="Configuración de cuenta"
            >
              <span className="material-symbols-outlined">
                admin_panel_settings
              </span>
            </button>
          </div>
        </header>

        <div className="sa-content">
          <Outlet />
          <Footer />
        </div>
      </main>
    </div>
  )
}

export default SuperAdmin