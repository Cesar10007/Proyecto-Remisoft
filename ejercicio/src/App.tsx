import { useState } from 'react'
import Usuarios from './components/Usuarios'
import Productos from './components/Productos'

function App() {
  const [pagina, setPagina] = useState<string>('usuarios')

  return (
    <div className="app-shell">
      <nav className="app-nav">
        <button
          type="button"
          onClick={() => setPagina('usuarios')}
          className={pagina === 'usuarios' ? 'nav-button active' : 'nav-button'}
        >
          Ver Usuarios
        </button>
        <button
          type="button"
          onClick={() => setPagina('productos')}
          className={pagina === 'productos' ? 'nav-button active' : 'nav-button'}
        >
          Ver Productos
        </button>
      </nav>

      <hr className="divider" />

      <main className="app-main">
        {pagina === 'usuarios' && <Usuarios />}
        {pagina === 'productos' && <Productos />}
      </main>
    </div>
  )
}

export default App
