import { useState, type FormEvent } from 'react'
import Button from '../../../components/common/Button'
import api from '../../../api/axios'
import { mensajeError } from '../../../utils/mensajeError'
import { InputField } from '../../../components/common/InputField'

export default function AltaMesa({ alCrear }: { alCrear: (numero: number) => Promise<void> }) {
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  async function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const datos = new FormData(form)
    const numero = Number(datos.get('numero'))
    setError('')
    setGuardando(true)
    try {
      await api.post('/mesas', { numero, capacidad: Number(datos.get('capacidad')) })
      form.reset()
      await alCrear(numero)
    } catch (err) { setError(mensajeError(err)) }
    finally { setGuardando(false) }
  }
  return (
    <form onSubmit={crear} className="mb-6 flex flex-wrap items-end gap-3">
      <InputField label="Número de mesa" name="numero" type="number" min="1" max="2147483647" step="1" required />
      <InputField label="Capacidad" name="capacidad" type="number" min="1" max="2147483647" step="1" required />
      <Button type="submit" disabled={guardando}>Agregar mesa</Button>
      {error && <p role="alert" className="text-[var(--rojo-dark)]">{error}</p>}
    </form>
  )
}
