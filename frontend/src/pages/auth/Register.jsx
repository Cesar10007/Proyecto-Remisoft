import './Auth.css'
import { useState } from 'react'
import api from '../../api/axios'

function Register({ onClose }) {
    const [form, setForm] = useState({
        identificacion: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        contrasena: '',
        contrasena_confirmation: '',
        id_rol: 4,
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [terms, setTerms] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleRegister() {
        setError('')
        if (!terms) return setError('Debes aceptar la política de datos')

        setLoading(true)
        try {
            await api.post('/register', form)
            alert('✓ Usuario registrado correctamente')
            onClose()
        } catch (err) {
            if (err.response?.status === 422) {
                const errores = err.response.data.errors
                const primero = Object.values(errores)[0][0]
                setError(primero)
            } else {
                setError('Error al conectar con el servidor')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-form">
            <div className="auth-header">
                <h3 className="auth-title">Crear cuenta</h3>
                <p className="auth-subtitle">Registra un nuevo usuario en RemiSoft</p>
            </div>

            <div className="form-row-2col">
                <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input type="text" name="nombre" className="form-input"
                        placeholder="Juan" value={form.nombre} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <input type="text" name="apellido" className="form-input"
                        placeholder="Pérez" value={form.apellido} onChange={handleChange} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Identificación</label>
                <input type="text" name="identificacion" className="form-input"
                    placeholder="Número de cédula" value={form.identificacion} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input type="email" name="email" className="form-input"
                    placeholder="correo@ejemplo.com" value={form.email} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="tel" name="telefono" className="form-input"
                    placeholder="300 000 0000" value={form.telefono} onChange={handleChange} />
            </div>

            <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="password-input-wrapper">
                    <input className="form-input password-toggle-input"
                        type={showPassword ? 'text' : 'password'}
                        name="contrasena" placeholder="Mínimo 8 caracteres"
                        value={form.contrasena} onChange={handleChange} />
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="password-toggle-btn">
                        <span className="material-symbols-outlined password-toggle-icon">
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <div className="password-input-wrapper">
                    <input className="form-input password-toggle-input"
                        type={showConfirm ? 'text' : 'password'}
                        name="contrasena_confirmation" placeholder="Repite la contraseña"
                        value={form.contrasena_confirmation} onChange={handleChange} />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="password-toggle-btn">
                        <span className="material-symbols-outlined password-toggle-icon">
                            {showConfirm ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-check-label">
                    <input type="checkbox" className="form-check-input"
                        checked={terms} onChange={e => setTerms(e.target.checked)} />
                    Acepto la política de tratamiento de datos personales (Ley 1581 de 2012)
                </label>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="btn btn-primary auth-btn" onClick={handleRegister} disabled={loading}>
                {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
        </div>
    )
}

export default Register