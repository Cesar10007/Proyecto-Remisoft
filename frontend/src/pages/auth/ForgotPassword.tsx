import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/common/Button'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/send-reset-link', { email })
      setEnviado(true)
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Ingresa un correo electrónico válido.')
      } else {
        setError('Error al conectar con el servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-5">
      <div className="flex w-full max-w-[420px] flex-col gap-2 rounded-[20px] border border-[var(--borde)] bg-[var(--bg-card)] p-9 shadow-[26px_26px_26px_rgba(0,0,0,0.1)]">
        <p className="mb-6 text-center font-['Syne'] text-[1.8rem] font-extrabold tracking-[-0.5px] text-[var(--rojo-dark)]">
          Remi<span className="text-[var(--amarillo)]">Soft</span>
        </p>

        {!enviado ? (
          <>
            <div className="mb-2">
              <h2 className="mb-1 font-['Syne'] text-[1.4rem] font-bold tracking-[-0.4px] text-[var(--texto)]">
                Recuperar contraseña
              </h2>
              <p className="text-[0.85rem] text-[var(--texto-muted)]">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3.5">
                <label className="mb-1.5 block text-[0.78rem] font-medium text-[var(--texto-muted)]">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    className={`w-full rounded-[10px] border-[1.5px] bg-[#fdfaf7] px-3.5 py-2.5 font-['DM_Sans'] text-[0.9rem] text-[var(--texto)] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#b0a9a2] focus:border-[var(--rojo)] focus:shadow-[0_0_0_3px_rgba(216,90,48,0.12)] ${
                      error
                        ? 'border-[var(--amarillo)] shadow-[0_0_0_3px_rgba(239,159,39,0.15)]'
                        : 'border-[var(--borde)]'
                    }`}
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    required
                  />
                  {error && (
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--amarillo)]">
                      warning
                    </span>
                  )}
                </div>
                {error && (
                  <p className="mt-1.5 text-[0.8rem] text-[var(--amarillo)]">{error}</p>
                )}
              </div>

              <Button type="submit" fullWidth disabled={loading} className="mt-1">
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
            </form>

            <button
              className="w-full cursor-pointer border-none bg-transparent px-0 py-1 text-center text-[0.82rem] text-[var(--rojo)] underline underline-offset-[3px]"
              onClick={() => navigate('/')}
            >
              ← Volver al inicio
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="material-symbols-outlined text-[56px] text-[var(--verde)]">
              check_circle
            </span>
            <h2 className="font-['Syne'] text-[1.3rem] font-bold text-[var(--verde)]">
              ¡Enlace enviado!
            </h2>
            <p className="text-[0.88rem] leading-[1.6] text-[var(--texto-muted)]">
              Te hemos enviado las instrucciones a tu correo.
            </p>
            <Button onClick={() => navigate('/')} className="mt-1 w-full">
              Volver al inicio
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
