import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './pages/auth/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Modal from './components/common/Modal'

// dashboards (los creamos después)
import SuperAdmin from './pages/superadmin/SuperAdmin'
import Gerente from './pages/gerente/Gerente'
import Mesero from './pages/mesero/Mesero'
import Repartidor from './pages/repartidor/Repartidor'

function App() {
  const [modal, setModal] = useState(null)

  return (
    <BrowserRouter>
      <Routes>

        {/* rutas públicas con navbar y footer */}
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

        {/* rutas de dashboards sin navbar ni footer */}
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/gerente" element={<Gerente />} />
        <Route path="/mesero" element={<Mesero />} />
        <Route path="/repartidor" element={<Repartidor />} />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App