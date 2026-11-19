import { useState, type FormEvent } from 'react'
import Button from '../../../components/common/Button'
import api from '../../../api/axios'
import { InputField } from '../../../components/common/InputField'
import { SelectField } from '../../../components/common/SelectField'
import { useConsulta } from '../../../hook/useConsulta'
import { mensajeError } from '../../../utils/mensajeError'
import { cantidadConUnidad, unidadDeCantidad } from '../../../utils/unidadesInventario'
import Modal from '../../../components/common/Modal'
import type { Ingrediente } from '../types'

interface Ficha { unidad_base?: string | null; factor_unidad?: number; cantidad_base?: number; unidad_medida: string | null; stock_actual: number }

export default function MovimientosIngrediente({ ingrediente, actualizar, cerrar }: { ingrediente: Ingrediente; actualizar: () => Promise<void>; cerrar: () => void }) {
  const id = ingrediente.id_ingrediente
  const ficha = useConsulta<{ data: Ficha }>(`/inventario/${id}`)
  const unidad = ficha.data?.data.unidad_medida
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  async function ajustar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (guardando) return
    const form = e.currentTarget, campos = new FormData(form)
    setGuardando(true); setError(''); setAviso('')
    try {
      await api.post('/inventario/ajuste', { id_ingrediente: id, unidad_esperada: unidad, factor_esperado: ficha.data?.data.factor_unidad, base_esperada: ficha.data?.data.cantidad_base, tipo: campos.get('tipo'), cantidad: Number(campos.get('cantidad')), motivo: String(campos.get('motivo')).trim() })
      form.reset(); setAviso('Movimiento registrado.')
      await Promise.all([actualizar(), ficha.cargar()])
    } catch (e) { setError(mensajeError(e)) }
    finally { setGuardando(false) }
  }
  return <Modal title={`Movimientos de ${ingrediente.nombre}`} onClose={cerrar} busy={guardando}>
    {ficha.error ? <p role="alert">{ficha.error} <button aria-description="Vuelve a consultar el saldo del ingrediente." onClick={ficha.cargar}>Reintentar</button></p> : !ficha.data ? <p role="status">Cargando movimientos…</p> : <>
      <p className="mb-4 font-semibold">Stock actual: {cantidadConUnidad(ficha.data.data.stock_actual, unidad)}</p>
      <form aria-description="Registra una entrada o una salida de inventario." onSubmit={ajustar} className="grid gap-3">
        <SelectField aria-description="Elige si la cantidad se suma o se resta del stock." label="Tipo de movimiento" name="tipo"><option value="ENTRADA">Entrada</option><option value="SALIDA">Salida</option></SelectField>
        <InputField aria-description="Indica cuánto entra o sale, no el saldo final." label={`Cantidad (${unidadDeCantidad(unidad) || 'sin unidad'})`} name="cantidad" type="number" min="0.000000001" step="any" required />
        <InputField aria-description="Explica por qué se registra este movimiento." label="Motivo" name="motivo" minLength={5} maxLength={1000} placeholder="Ej.: conteo inicial" required />
        {error && <p role="alert" className="text-[var(--rojo-dark)]">{error}</p>}
        {aviso && <p role="status">{aviso}</p>}
        <Button aria-description="Guarda el movimiento y actualiza el saldo del ingrediente." type="submit" disabled={guardando}>{guardando ? 'Registrando…' : 'Registrar movimiento'}</Button>
      </form>
    </>}
  </Modal>
}
