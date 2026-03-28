import { useState } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './pages/auth/Landing'
import Modal from './components/common/Modal'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

function App() {
  const [modal, setModal] = useState(null)

  return (
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
  )
}

export default App