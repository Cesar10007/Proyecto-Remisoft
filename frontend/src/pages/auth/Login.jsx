import './Auth.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login({ onClose }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleLogin() {
        setLoading(true)
        setError('')

        try {
            const response = await fetch('http://127.0.0.1:8000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, contrasena: password })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.message || 'Correo o contraseña incorrectos')
                return
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('rol', data.rol)
            localStorage.setItem('usuario', JSON.stringify(data.user))

            onClose()
            navigate('/' + data.rol.toLowerCase())

        } catch (e) {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
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

            <button className="btn-form btn-form-primary" onClick={handleLogin} disabled={loading}>
                {loading ? 'Ingresando...' : 'Ingresar al sistema'}
            </button>
        </div>
    )
}

export default Login
