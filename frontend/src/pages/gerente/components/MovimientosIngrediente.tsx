import { useState, type FormEvent } from 'react'
import api from '../../../api/axios'
import { InputField } from '../../../components/common/InputField'
import { SelectField } from '../../../components/common/SelectField'
import { useConsulta } from '../../../hook/useConsulta'
import { mensajeError } from '../../../utils/mensajeError'
import Modal from '../../../components/common/Modal'
import type { Ingrediente } from '../types'

interface Movimiento { id_movimiento: number; fecha_hora: string | null; tipo_movimiento: string; cantidad: string; origen_tipo: string | null; observaciones: string | null }
interface Ficha { stock_actual: number; historial_movimientos: Movimiento[] }

export default function MovimientosIngrediente({ ingrediente, actualizar, cerrar }: { ingrediente: Ingrediente; actualizar: () => Promise<void>; cerrar: () => void }) {
  const id = ingrediente.id_ingrediente
  const ficha = useConsulta<{ data: Ficha }>(`/inventario/${id}`)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  async function ajustar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (guardando) return
    const form = e.currentTarget, campos = new FormData(form)
    setGuardando(true); setError(''); setAviso('')
    try {
      await api.post('/inventario/ajuste', { id_ingrediente: id, tipo: campos.get('tipo'), cantidad: Number(campos.get('cantidad')), motivo: String(campos.get('motivo')).trim() })
      form.reset(); setAviso('Movimiento registrado.')
      await Promise.all([actualizar(), ficha.cargar()])
    } catch (e) { setError(mensajeError(e)) }
    finally { setGuardando(false) }
  }
  return <Modal title={`Movimientos de ${ingrediente.nombre}`} onClose={cerrar} busy={guardando}>
    {ficha.error ? <p role="alert">{ficha.error} <button onClick={ficha.cargar}>Reintentar</button></p> : !ficha.data ? <p role="status">Cargando movimientos…</p> : <>
      <p className="mb-4 font-semibold">Stock actual: {ficha.data.data.stock_actual} {ingrediente.unidad_medida}</p>
      <form onSubmit={ajustar} className="grid gap-3">
        <SelectField label="Tipo de movimiento" name="tipo"><option value="ENTRADA">Entrada</option><option value="SALIDA">Salida</option></SelectField>
        <InputField label={`Cantidad (${ingrediente.unidad_medida || 'unidades'})`} name="cantidad" type="number" min="0.001" max="9999999.999" step="0.001" required />
        <InputField label="Motivo" name="motivo" minLength={5} maxLength={1000} placeholder="Ej.: conteo inicial" required />
        {error && <p role="alert" className="text-[var(--rojo-dark)]">{error}</p>}
        {aviso && <p role="status">{aviso}</p>}
        <button disabled={guardando} className="ge-primary-btn">{guardando ? 'Registrando…' : 'Registrar movimiento'}</button>
      </form>
      <h3 className="mt-4 font-semibold">Historial de movimientos</h3>
      {!ficha.data.data.historial_movimientos.length && <p className="mt-2 text-sm">Sin movimientos registrados.</p>}
      <ul className="divide-y divide-[var(--borde)] text-sm">
        {ficha.data.data.historial_movimientos.map(m => <li key={m.id_movimiento} className="py-2">
          <strong>{m.tipo_movimiento === 'ENTRADA' ? 'Entrada' : m.tipo_movimiento === 'SALIDA' ? 'Salida' : m.tipo_movimiento}: {Number(m.cantidad)} {ingrediente.unidad_medida}</strong>
          <span className="ml-2">{m.origen_tipo}</span>
          {m.fecha_hora && <time dateTime={m.fecha_hora} className="ml-2 text-xs text-[var(--texto-muted)]">{new Date(m.fecha_hora).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'short', timeStyle: 'short' })}</time>}
          <p className="text-[var(--texto-muted)]">{m.observaciones}</p>
        </li>)}
      </ul>
    </>}
  </Modal>
}
