import './Auth.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from '../../api/axios'
import { setCredentials } from '../../store/authSlice'
import { useAuth } from '../../context/AuthContext'

function Register({ onClose }) {
  const [form, setForm] = useState({
    identificacion: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    contrasena: '',
    contrasena_confirmation: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { login } = useAuth()

  function validarFormulario() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

    if (form.nombre.trim().length < 3) {
      return 'El nombre debe tener mínimo 3 caracteres'
    }

    if (form.apellido.trim().length < 3) {
      return 'El apellido debe tener mínimo 3 caracteres'
    }

    if (!/^\d{6,10}$/.test(form.identificacion)) {
      return 'La identificación debe tener entre 6 y 10 dígitos numéricos'
    }

    if (!emailRegex.test(form.email.trim())) {
      return 'El correo no es válido. Debe incluir @ y un dominio válido'
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

    if (!/\d/.test(form.contrasena)) {
      return 'La contraseña debe tener al menos un número'
    }

    if (!/[!@#$%^&*(),.?":{}|<>_+\-]/.test(form.contrasena)) {
      return 'La contraseña debe tener al menos un carácter especial'
    }

    if (form.contrasena !== form.contrasena_confirmation) {
      return 'Las contraseñas no coinciden'
    }

    return null
  }

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  async function handleRegister() {
    setError('')

    if (!terms) {
      setError('Debes aceptar la política de tratamiento de datos')
      return
    }

    const errorValidacion = validarFormulario()

    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/register', form)
      const { token, user, rol } = response.data
      const rolNormalizado = String(rol).toUpperCase()

      // La API decide el rol: el registro público siempre crea CLIENTE.
      dispatch(setCredentials({ token, rol: rolNormalizado, user }))
      login(token, rolNormalizado, user)

      onClose?.()
      navigate('/cliente')
    } catch (err) {
      const errores = err.response?.data?.errors

      if (
        (err.response?.status === 422 || err.response?.status === 409) &&
        errores
      ) {
        const primerCampo = Object.values(errores)[0]
        const primerError = Array.isArray(primerCampo)
          ? primerCampo[0]
          : null

        setError(primerError || 'No fue posible registrar el usuario')
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
        <p className="auth-subtitle">
          Regístrate como cliente de RemiSoft
        </p>
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
            required
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
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Identificación</label>
        <input
          type="text"
          name="identificacion"
          className="form-input"
          placeholder="Número de identificación"
          value={form.identificacion}
          onChange={handleChange}
          inputMode="numeric"
          minLength={6}
          maxLength={10}
          required
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
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Teléfono</label>
        <input
          type="tel"
          name="telefono"
          className="form-input"
          placeholder="3000000000"
          value={form.telefono}
          onChange={handleChange}
          inputMode="numeric"
          minLength={10}
          maxLength={10}
          required
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
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            className="password-toggle-btn"
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
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
            name="contrasena_confirmation"
            placeholder="Repite la contraseña"
            value={form.contrasena_confirmation}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            onClick={() => setShowConfirm((previous) => !previous)}
            className="password-toggle-btn"
            aria-label={
              showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
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
            onChange={(event) => setTerms(event.target.checked)}
          />
          Acepto la política de tratamiento de datos personales
        </label>
      </div>

      {error && <p className="auth-error">{error}</p>}

      <button
        type="button"
        className="btn btn-primary auth-btn"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>
    </div>
  )
}

export default Register