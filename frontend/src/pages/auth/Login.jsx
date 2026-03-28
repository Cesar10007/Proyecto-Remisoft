import { useState } from 'react'

function Login({ onClose }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rol, setRol] = useState('')

function validateEmail(e) {
    return /\S+@\S+\.\S+/.test(e)
}

function handleLogin() {
    if (!email || !validateEmail(email)) return alert('Ingresa un correo válido')
    if (password.length < 6) return alert('Contraseña muy corta')
    if (!rol) return alert('Selecciona tu rol')
    alert('✓ Bienvenido — conectando al sistema como ' + rol)
    onClose()
}

return (
        <div className="auth-card">
            <h3>Iniciar sesión</h3>
            <p className="auth-sub">Accede a tu cuenta de RemiSoft</p>

            <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                type="email"
                className="form-input"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Rol</label>
                <select
                className="form-select"
                value={rol}
                onChange={e => setRol(e.target.value)}
                >
                    <option value="">Selecciona tu rol</option>
                    <option>Administrador</option>
                    <option>Mesero</option>
                    <option>Repartidor</option>
                    <option>Cliente</option>
                </select>
            </div>

            <button className="btn-form btn-form-primary" onClick={handleLogin}>
                Ingresar al sistema
            </button>
        </div>
    )
}

export default Login