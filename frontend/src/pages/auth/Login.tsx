import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from '../../api/axios'
import { setCredentials } from '../../store/authSlice'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

interface LoginProps {
  onClose?: () => void
}

function Login({ onClose }: LoginProps) {
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', {
        email,
        contrasena,
      })

      const { token, user, rol } = response.data
      const rolNormalizado = String(rol).toUpperCase()

      dispatch(
        setCredentials({
          token,
          rol: rolNormalizado,
          user,
        }),
      )

      login(token, rolNormalizado, user)

      onClose?.()

      if (rolNormalizado === 'SUPERADMIN') {
        navigate('/superadmin')
      } else if (rolNormalizado === 'GERENTE') {
        navigate('/gerente')
      } else if (rolNormalizado === 'MESERO') {
        navigate('/mesero')
      } else if (rolNormalizado === 'REPARTIDOR') {
        navigate('/repartidor')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas')
      } else if (err.response?.status === 422) {
        setError('Revisa los datos ingresados')
      } else if (err.response?.status === 403) {
        setError('El usuario está inactivo')
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
        <h2 className="auth-title">Bienvenido</h2>
        <p className="auth-subtitle">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">
            Correo electrónico
          </label>

          <input
            id="login-email"
            className="form-input"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group password-toggle-wrapper">
          <label className="form-label" htmlFor="login-password">
            Contraseña
          </label>

          <div className="password-input-wrapper">
            <input
              id="login-password"
              className="form-input password-toggle-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="password-toggle-btn"
              aria-label={
                showPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
            >
              <span className="material-symbols-outlined password-toggle-icon">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary auth-btn"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <button
          type="button"
          className="auth-link"
          onClick={() => {
            onClose?.()
            navigate('/forgot-password')
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </div>
  )
}

export default Login