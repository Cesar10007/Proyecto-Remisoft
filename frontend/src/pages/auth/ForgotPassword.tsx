import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { api } from '../../api/axios'
import './Auth.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCargando(true)
    setMensaje('')
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setMensaje(data?.message ?? 'Si el correo existe, recibirás instrucciones.')
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setMensaje('Ingresa un correo válido.')
      } else {
        setMensaje('No fue posible procesar la solicitud.')
      }
    } finally {
      setCargando(false)
    }
  }

  return null
}
