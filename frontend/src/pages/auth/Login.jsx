import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usuarios } from '../../data/usuarios'

function Login({ onClose }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    function handleLogin() {
        const usuario = usuarios.find(
            u => u.email === email && u.password === password
        )

        if (!usuario) {
            setError('Correo o contraseña incorrectos')
            return
        }

        onClose()
        navigate('/' + usuario.rol)
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
                    onChange={e => { setEmail(e.target.value); setError('') }}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                />
            </div>

            {error && <p style={{ color: 'var(--rojo)', fontSize: '0.82rem', marginBottom: '10px' }}>{error}</p>}

            <button className="btn-form btn-form-primary" onClick={handleLogin}>
                Ingresar al sistema
            </button>
        </div>
    )
}

export default Login