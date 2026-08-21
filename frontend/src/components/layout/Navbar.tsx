import { useTheme } from '../../context/ThemeContext'

interface NavbarProps {
  onLogin: () => void
}

function Navbar({ onLogin }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="nav-publica">
      <a href="#" className="nav-logo">
        Remi<span>Soft</span>
      </a>
      <div className="nav-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onLogin}
        >
          Iniciar sesión
        </button>
      </div>
    </nav>
  )
}

export default Navbar
