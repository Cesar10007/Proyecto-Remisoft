import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/common/Button'

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
      await api.post('/auth/reset-password', {
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-5">
        <div className="flex w-full max-w-[420px] flex-col gap-2 rounded-[20px] border border-[var(--borde)] bg-[var(--bg-card)] p-9 shadow-[26px_26px_26px_rgba(0,0,0,0.1)]">
          <div className="mb-2">
            <h3 className="mb-1 font-['Syne'] text-[1.4rem] font-bold tracking-[-0.4px] text-[var(--texto)]">
              Enlace inválido
            </h3>
            <p className="text-[0.85rem] text-[var(--texto-muted)]">
              Este enlace no es válido. Solicita uno nuevo desde el login.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-5">
      <div className="flex w-full max-w-[420px] flex-col gap-2 rounded-[20px] border border-[var(--borde)] bg-[var(--bg-card)] p-9 shadow-[26px_26px_26px_rgba(0,0,0,0.1)]">
        <p className="mb-6 text-center font-['Syne'] text-[1.8rem] font-extrabold tracking-[-0.5px] text-[var(--rojo-dark)]">
          Remi<span className="text-[var(--amarillo)]">Soft</span>
        </p>

        <div className="mb-2">
          <h3 className="mb-1 font-['Syne'] text-[1.4rem] font-bold tracking-[-0.4px] text-[var(--texto)]">
            Nueva contraseña
          </h3>
          <p className="text-[0.85rem] text-[var(--texto-muted)]">
            Ingresa tu nueva contraseña para <strong>{email}</strong>
          </p>
        </div>

        <div className="mb-3.5">
          <label className="mb-1.5 block text-[0.78rem] font-medium text-[var(--texto-muted)]">
            Nueva contraseña
          </label>
          <div className="relative">
            <input
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[#fdfaf7] py-2.5 pl-3.5 pr-[46px] font-['DM_Sans'] text-[0.9rem] text-[var(--texto)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#b0a9a2] focus:border-[var(--rojo)] focus:shadow-[0_0_0_3px_rgba(216,90,48,0.12)]"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-3 inline-flex items-center justify-center border-none bg-transparent px-2 leading-none text-[var(--texto-muted)]"
            >
              <span className="material-symbols-outlined block text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="mb-3.5">
          <label className="mb-1.5 block text-[0.78rem] font-medium text-[var(--texto-muted)]">
            Confirmar contraseña
          </label>
          <div className="relative">
            <input
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[#fdfaf7] py-2.5 pl-3.5 pr-[46px] font-['DM_Sans'] text-[0.9rem] text-[var(--texto)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#b0a9a2] focus:border-[var(--rojo)] focus:shadow-[0_0_0_3px_rgba(216,90,48,0.12)]"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repite la contraseña"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute inset-y-0 right-3 inline-flex items-center justify-center border-none bg-transparent px-2 leading-none text-[var(--texto-muted)]"
            >
              <span className="material-symbols-outlined block text-[20px]">
                {showConfirm ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-1 rounded-lg border border-[var(--rojo-mid)] bg-[var(--rojo-light)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">
            {error}
          </p>
        )}

        <Button onClick={handleReset} disabled={loading} fullWidth className="mt-1">
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </Button>
      </div>
    </div>
  )
}

export default ResetPassword
