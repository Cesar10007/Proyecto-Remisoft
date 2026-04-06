import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './pages/auth/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Modal from './components/common/Modal'

function App() {
  const [modal, setModal] = useState(null)

  return (
    <BrowserRouter>
      <Navbar onLogin={() => setModal('login')} onRegister={() => setModal('registro')} />
      <main>
        <Routes>
          <Route path="/" element={<Landing onRegister={() => setModal('registro')} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />

      <Modal isOpen={modal === 'login'} onClose={() => setModal(null)}>
        <Login onClose={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'registro'} onClose={() => setModal(null)}>
        <Register onClose={() => setModal(null)} />
      </Modal>
    </BrowserRouter>
  )
}

export default App