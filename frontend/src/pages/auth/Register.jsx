import { useState } from 'react'

function Register({ onClose }) {
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [email, setEmail] = useState('')
    const [telefono, setTelefono] = useState('')
    const [password, setPassword] = useState('')
    const [terms, setTerms] = useState(false)

function validateEmail(e) {
    return /\S+@\S+\.\S+/.test(e)
}

function handleRegister() {
    if (!nombre) return alert('Ingresa tu nombre')
    if (!email || !validateEmail(email)) return alert('Correo inválido')
    if (password.length < 8) return alert('La contraseña debe tener mínimo 8 caracteres')
    if (!terms) return alert('Debes aceptar la política de datos')
    alert('✓ Cuenta creada exitosamente. ¡Bienvenido!')
    onClose()
}

return (
    <div className="auth-card">
        <h3>Crear cuenta</h3>
        <p className="auth-sub">Regístrate en RemiSoft como cliente</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Juan"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Apellido</label>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Pérez"
                    value={apellido}
                    onChange={e => setApellido(e.target.value)}
                />
            </div>
        </div>

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
            <label className="form-label">Teléfono</label>
            <input
            type="tel"
            className="form-input"
            placeholder="300 000 0000"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            />
        </div>

        <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
            type="password"
            className="form-input"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            />
        </div>

        <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.75rem', color: 'var(--texto-muted)', cursor: 'pointer' }}>
            <input
                type="checkbox"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--rojo)' }}
            />
            Acepto la política de tratamiento de datos personales (Ley 1581 de 2012)
            </label>
        </div>

        <button className="btn-form btn-form-primary" onClick={handleRegister}>
            Crear mi cuenta
        </button>
    </div>
)
}

export default Register