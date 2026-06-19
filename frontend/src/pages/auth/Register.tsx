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

    function validarFormulario() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

        if (form.nombre.length < 3) {
            return 'El nombre debe tener mínimo 3 caracteres'
        }
        if (form.apellido.length < 3) {
            return 'El apellido debe tener mínimo 3 caracteres'
        }
        if (!/^\d+$/.test(form.identificacion)) {
            return 'La identificación solo debe contener números'
        }
        if (form.identificacion.length < 6 || form.identificacion.length > 10) {
            return 'La identificación debe tener entre 6 y 10 dígitos'
        }
        if (!emailRegex.test(form.email)) {
            return 'El correo no es válido. Debe tener @ y un dominio correcto (ej: .com, .co)'
        }
        if (!/^\d{10}$/.test(form.telefono)) {
            return 'El teléfono debe tener exactamente 10 dígitos numéricos'
        }
        if (form.contrasena.length < 8) {
            return 'La contraseña debe tener mínimo 8 caracteres'
        }
        if (!/[A-Z]/.test(form.contrasena)) {
            return 'La contraseña debe tener al menos una mayúscula'
        }
        if (!/[0-9]/.test(form.contrasena)) {
            return 'La contraseña debe tener al menos un número'
        }
        if (!/[!@#$%^&*(),.?":{}|<>_\+\-]/.test(form.contrasena)) {
            return 'La contraseña debe tener al menos un carácter especial (!@#$%...)'
        }
        if (form.contrasena !== form.contrasena_confirmation) {
            return 'Las contraseñas no coinciden'
        }

        return null
    }

    function handleChange(e) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleRegister() {
        setError('')
        if (!terms) return setError('Debes aceptar la política de datos')

        const errorValidacion = validarFormulario()
        if (errorValidacion) return setError(errorValidacion)

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
                    <input
                        type="text"
                        name="nombre"
                        className="form-input"
                        placeholder="Juan"
                        value={form.nombre}
                        onChange={handleChange}
                        minLength={3}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Apellido</label>
                    <input
                        type="text"
                        name="apellido"
                        className="form-input"
                        placeholder="Pérez"
                        value={form.apellido}
                        onChange={handleChange}
                        minLength={3}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Identificación</label>
                <input
                    type="text"
                    name="identificacion"
                    className="form-input"
                    placeholder="Número de cédula"
                    value={form.identificacion}
                    onChange={handleChange}
                    minLength={6}
                    maxLength={10}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="correo@ejemplo.com"
                    value={form.email}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                    type="tel"
                    name="telefono"
                    className="form-input"
                    placeholder="300 000 0000"
                    value={form.telefono}
                    onChange={handleChange}
                    minLength={10}
                    maxLength={10}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div className="password-input-wrapper">
                    <input
                        className="form-input password-toggle-input"
                        type={showPassword ? 'text' : 'password'}
                        name="contrasena"
                        placeholder="Mín. 8 caracteres, mayúscula, número y símbolo"
                        value={form.contrasena}
                        onChange={handleChange}
                    />
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
                    <input
                        className="form-input password-toggle-input"
                        type={showConfirm ? 'text' : 'password'}
                        name="contrasena_confirmation"
                        placeholder="Repite la contraseña"
                        value={form.contrasena_confirmation}
                        onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)} className="password-toggle-btn">
                        <span className="material-symbols-outlined password-toggle-icon">
                            {showConfirm ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label className="form-check-label">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={terms}
                        onChange={e => setTerms(e.target.checked)}
                    />
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