import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './pages/auth/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Modal from './components/common/Modal'
import PrivateRoute from './components/common/PrivateRoute'

import SuperAdmin from './pages/superadmin/SuperAdmin'
import Gerente from './pages/gerente/Gerente'
import Mesero from './pages/mesero/Mesero'
import Repartidor from './pages/repartidor/Repartidor'

function App() {
  const [modal, setModal] = useState(null)

  return (
    <BrowserRouter>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/" element={
          <>
            <Navbar onLogin={() => setModal('login')} onRegister={() => setModal('registro')} />
            <main>
              <Landing onRegister={() => setModal('registro')} />
            </main>
            <Footer />
            <Modal isOpen={modal === 'login'} onClose={() => setModal(null)}>
              <Login onClose={() => setModal(null)} />
            </Modal>
            <Modal isOpen={modal === 'registro'} onClose={() => setModal(null)}>
              <Register onClose={() => setModal(null)} />
            </Modal>
          </>
        } />

        {/* Rutas protegidas — redirigen a "/" si no hay token */}
        <Route path="/superadmin" element={
          <PrivateRoute><SuperAdmin /></PrivateRoute>
        } />
        <Route path="/gerente" element={
          <PrivateRoute><Gerente /></PrivateRoute>
        } />
        <Route path="/mesero" element={
          <PrivateRoute><Mesero /></PrivateRoute>
        } />
        <Route path="/repartidor" element={
          <PrivateRoute><Repartidor /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App