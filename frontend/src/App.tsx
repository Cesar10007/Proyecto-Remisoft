import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense, useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './pages/auth/Landing'
import Login from './pages/auth/Login'
import ResetPassword from './pages/auth/ResetPassword'
import ForgotPassword from './pages/auth/ForgotPassword'
import Modal from './components/common/Modal'
import AyudasContextuales from './components/common/AyudasContextuales'
import PrivateRoute from './components/common/PrivateRoute'
import SuperAdmin from './pages/superadmin/SuperAdmin'
import Dashboard from './pages/superadmin/Dashboard/Dashboard'
import GestionGerentes from './pages/superadmin/GestionGerentes/GestionGerentes'
import Solicitudes from './pages/superadmin/Solicitudes/Solicitudes'
import Gerente from './pages/gerente/Gerente'
import Repartidor from './pages/repartidor/Repartidor'
import Cajero from './pages/cajero/Cajero'
import Cocina from './pages/cocina/Cocina'

const Mesero = lazy(() => import('./pages/mesero/Mesero'))

function App() {
  const [modal, setModal] = useState<string | null>(null)

  return (
    <BrowserRouter>
      <AyudasContextuales />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar onLogin={() => setModal('login')} />
              <main>
                <Landing onLogin={() => setModal('login')} />
              </main>
              <Footer />
              <Modal
                title="Bienvenido"
                size="compact"
                isOpen={modal === 'login'}
                onClose={() => setModal(null)}
              >
                <Login onClose={() => setModal(null)} />
              </Modal>
            </>
          }
        />

        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/cajero"
          element={
            <PrivateRoute rolesPermitidos={['CAJERO', 'GERENTE', 'SUPERADMIN']}>
              <Cajero />
            </PrivateRoute>
          }
        />

        <Route
          path="/cocina"
          element={
            <PrivateRoute rolesPermitidos={['MESERO', 'GERENTE', 'SUPERADMIN']}>
              <Cocina />
            </PrivateRoute>
          }
        />

        <Route
          path="/superadmin"
          element={
            <PrivateRoute rolRequerido="SUPERADMIN">
              <SuperAdmin />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="gerentes" element={<GestionGerentes />} />
          <Route path="solicitudes" element={<Solicitudes />} />
        </Route>

        <Route
          path="/gerente"
          element={
            <PrivateRoute rolRequerido="GERENTE">
              <Gerente />
            </PrivateRoute>
          }
        />

        <Route
          path="/mesero"
          element={
            <PrivateRoute rolRequerido="MESERO">
              <Suspense fallback={<p className="p-6" role="status">Cargando salón…</p>}><Mesero /></Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/repartidor"
          element={
            <PrivateRoute rolRequerido="REPARTIDOR">
              <Repartidor />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
