import { Outlet } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import Footer from '../../components/layout/Footer'
import './SuperAdmin.css'

const menuItems = [
  { id: 'resumen', icon: 'dashboard', label: 'Resumen', path: '/superadmin', end: true },
  { id: 'gerentes', icon: 'group', label: 'Gestión de Gerentes', path: '/superadmin/gerentes' },
  { id: 'solicitudes', icon: 'mark_email_unread', label: 'Solicitudes', path: '/superadmin/solicitudes' },
]

function SuperAdmin() {
  return (
    <DashboardLayout roleTitle="Superadministrador" navItems={menuItems}>
      <div className="flex min-h-[calc(100vh-140px)] flex-col justify-between">
        <Outlet />
        <div className="mt-8">
          <Footer />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SuperAdmin