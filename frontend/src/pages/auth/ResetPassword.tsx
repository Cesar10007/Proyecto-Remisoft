import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import '../auth/Auth.css'

function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleReset() {
        setError('')

        if (password.length < 8) return setError('La contraseña debe tener mínimo 8 caracteres')
        if (password !== passwordConfirmation) return setError('Las contraseñas no coinciden')

        setLoading(true)
        try {
            await api.post('/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            })
            alert('✓ Contraseña actualizada correctamente')
            navigate('/')
        } catch (err) {
            if (err.response?.status === 400) {
                setError('El enlace es inválido o ya expiró. Solicita uno nuevo.')
            } else if (err.response?.status === 422) {
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

    if (!token || !email) {
        return (
            <div className="reset-page">
                <div className="auth-form">
                    <div className="auth-header">
                        <h3 className="auth-title">Enlace inválido</h3>
                        <p className="auth-subtitle">Este enlace no es válido. Solicita uno nuevo desde el login.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="reset-page">
            <div className="auth-form">
                <p className="reset-page-logo">Remi<span>Soft</span></p>
                <div className="auth-header">
                    <h3 className="auth-title">Nueva contraseña</h3>
                    <p className="auth-subtitle">Ingresa tu nueva contraseña para <strong>{email}</strong></p>
                </div>

                <div className="form-group">
                    <label className="form-label">Nueva contraseña</label>
                    <div className="password-input-wrapper">
                        <input
                            className="form-input password-toggle-input"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            className="password-toggle-btn"
                        >
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
                            placeholder="Repite la contraseña"
                            value={passwordConfirmation}
                            onChange={e => setPasswordConfirmation(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(p => !p)}
                            className="password-toggle-btn"
                        >
                            <span className="material-symbols-outlined password-toggle-icon">
                                {showConfirm ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button
                    className="btn btn-primary auth-btn"
                    onClick={handleReset}
                    disabled={loading}
                >
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
            </div>
        </div>
    )
}

export default ResetPassword