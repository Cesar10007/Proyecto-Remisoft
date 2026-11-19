import { useState, type FormEvent } from 'react'
import Button from '../../../components/common/Button'
import api from '../../../api/axios'
import { mensajeError } from '../../../utils/mensajeError'
import { InputField } from '../../../components/common/InputField'

import type { MesaGerente } from '../types'

export default function AltaMesa({ alCrear, mesa, bloqueada = false, alConflicto }: {
  alCrear: (numero: number) => Promise<void>; mesa?: MesaGerente; bloqueada?: boolean; alConflicto?: () => Promise<void>
}) {
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  async function crear(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (guardando || bloqueada) return
    const form = e.currentTarget
    const datos = new FormData(form)
    const numero = Number(datos.get('numero'))
    setError('')
    setGuardando(true)
    try {
      const campos = { numero, capacidad: Number(datos.get('capacidad')) }
      if (mesa) await api.put(`/mesas/${mesa.numero}`, { ...campos, id_mesa: mesa.id_mesa, capacidad_esperada: mesa.capacidad })
      else await api.post('/mesas', campos)
      form.reset()
      await alCrear(numero)
    } catch (err) { setError(mensajeError(err)); if (alConflicto) void alConflicto() }
    finally { setGuardando(false) }
  }
  return (
    <form onSubmit={crear}><fieldset disabled={bloqueada || guardando} className="mb-6 flex flex-wrap items-end gap-3">
      <InputField label="Número de mesa" name="numero" defaultValue={mesa?.numero} type="number" min="1" max="2147483647" step="1" required />
      <InputField label="Capacidad" name="capacidad" defaultValue={mesa?.capacidad ?? undefined} type="number" min="1" max="2147483647" step="1" required />
      <Button type="submit" disabled={bloqueada || guardando}>{mesa ? 'Guardar mesa' : 'Agregar mesa'}</Button>
      </fieldset>
      {bloqueada && <p role="alert">Esta mesa ya no está disponible. No se pueden guardar cambios.</p>}
      {error && <p role="alert" className="text-[var(--rojo-dark)]">{error}</p>}
    </form>
  )
}
