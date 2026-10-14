import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import Footer from '../../components/layout/Footer'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import './SuperAdmin.css'

const menuItems = [
  { icon: 'dashboard', label: 'Resumen', path: '/superadmin' },
  { icon: 'group', label: 'Gestión de Gerentes', path: '/superadmin/gerentes' },
  { icon: 'mark_email_unread', label: 'Solicitudes', path: '/superadmin/solicitudes' },
]

function SuperAdmin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()

  const nombreCompleto = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'SuperAdmin'

  // Sección activa según la ruta actual.
  const itemActual =
    menuItems.find((item) => item.path === location.pathname) ??
    menuItems.find((item) => item.path !== '/superadmin' && location.pathname.startsWith(item.path)) ??
    menuItems[0]

  const cerrarSesion = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="sa-wrapper flex min-h-screen">
      <Sidebar
        subtitulo="Superadministrador"
        menuItems={menuItems}
        vistaActual={itemActual.label.toLowerCase()}
        onNavigate={(vista) => {
          const destino = menuItems.find((item) => item.label.toLowerCase() === vista)
          if (destino) navigate(destino.path)
        }}
        onLogout={cerrarSesion}
      />

      <main className="sa-main">
        <div className="border-b border-[var(--borde)] bg-[var(--bg-card)] px-4 py-4 pt-16 md:px-8 md:py-5 md:pt-5">
          <Header seccionActiva="Centro de Comando Administrativo" nombreUsuario={nombreCompleto} />
        </div>

        <div className="sa-content">
          <Outlet />
          <Footer />
        </div>
      </main>
    </div>
  )
}

export default SuperAdmin
