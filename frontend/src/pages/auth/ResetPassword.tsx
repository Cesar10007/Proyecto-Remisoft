import { useState, type FormEvent } from 'react'
import axios from 'axios'
import api from '../../api/axios'
import './Auth.css'

export default function ResetPassword() {
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setMensaje('')
    try {
      await api.post('/auth/reset-password', {})
      setMensaje('Contraseña actualizada.')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          setMensaje('El enlace de recuperación no es válido.')
        } else if (err.response?.status === 422) {
          const errores = err.response.data?.errors as Record<string, string[]> | undefined
          const primero = errores ? Object.values(errores)[0]?.[0] : undefined
          setMensaje(primero ?? 'Revisa los datos enviados.')
        } else {
          setMensaje('No fue posible restablecer la contraseña.')
        }
      } else {
        setMensaje('No fue posible restablecer la contraseña.')
      }
    } finally {
      setCargando(false)
    }
  }

  return null
}
