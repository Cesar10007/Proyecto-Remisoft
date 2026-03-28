function Navbar({ onLogin, onRegister }) {
  return (
    <nav>
      <a href="#" className="nav-logo">Remi<span>Soft</span></a>
      <div className="nav-actions">
        <button className="btn btn-ghost" onClick={onLogin}>Iniciar sesión</button>
        <button className="btn btn-primary" onClick={onRegister}>Registrarse</button>
      </div>
    </nav>
  )
}

export default Navbar