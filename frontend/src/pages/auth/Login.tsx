import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from '../../api/axios'
import { setCredentials } from '../../store/authSlice'
import { useAuth } from '../../context/AuthContext'

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
    <div className="flex min-w-[300px] flex-col gap-2 px-1 py-2">
      <div className="mb-2">
        <h2 className="mb-1 font-['Syne'] text-[1.4rem] font-bold tracking-[-0.4px] text-[var(--texto)]">
          Bienvenido
        </h2>
        <p className="text-[0.85rem] text-[var(--texto-muted)]">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3.5">
          <label
            className="mb-1.5 block text-[0.78rem] font-medium text-[var(--texto-muted)]"
            htmlFor="login-email"
          >
            Correo electrónico
          </label>

          <input
            id="login-email"
            className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[#fdfaf7] px-3.5 py-2.5 font-['DM_Sans'] text-[0.9rem] text-[var(--texto)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#b0a9a2] focus:border-[var(--rojo)] focus:shadow-[0_0_0_3px_rgba(216,90,48,0.12)]"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3.5">
          <label
            className="mb-1.5 block text-[0.78rem] font-medium text-[var(--texto-muted)]"
            htmlFor="login-password"
          >
            Contraseña
          </label>

          <div className="relative">
            <input
              id="login-password"
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[#fdfaf7] py-2.5 pl-3.5 pr-[46px] font-['DM_Sans'] text-[0.9rem] text-[var(--texto)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#b0a9a2] focus:border-[var(--rojo)] focus:shadow-[0_0_0_3px_rgba(216,90,48,0.12)]"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 inline-flex items-center justify-center border-none bg-transparent px-2 leading-none text-[var(--texto-muted)]"
              aria-label={
                showPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
            >
              <span className="material-symbols-outlined block text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-1 rounded-lg border border-[var(--rojo-mid)] bg-[var(--rojo-light)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-1 w-full cursor-pointer justify-center rounded-full border-[1.5px] border-[var(--rojo)] bg-[var(--rojo)] px-5 py-2.5 font-['DM_Sans'] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-[var(--rojo-dark)] hover:bg-[var(--rojo-dark)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <button
          type="button"
          className="w-full cursor-pointer border-none bg-transparent px-0 py-1 text-center text-[0.82rem] text-[var(--rojo)] underline underline-offset-[3px]"
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
