import { useState, type FormEvent } from 'react'
import Button from '../../../components/common/Button'
import api from '../../../api/axios'
import { InputField } from '../../../components/common/InputField'
import { useConsulta } from '../../../hook/useConsulta'
import { mensajeError } from '../../../utils/mensajeError'
import type { Producto } from '../types'
import { unidadDeCantidad } from '../../../utils/unidadesInventario'
import Modal from '../../../components/common/Modal'

interface Renglon { id_ingrediente: number; nombre: string; unidad_medida: string | null; cantidad: number }

export default function RecetaProducto({ producto, cerrar }: { producto: Producto; cerrar: () => void }) {
  const ruta = `/productos/${producto.id_producto}/receta`
  const { data, error, cargar } = useConsulta<{ data: Renglon[] }>(ruta)
  const [guardando, setGuardando] = useState(false)
  const [fallo, setFallo] = useState('')
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!data || guardando) return
    const form = new FormData(e.currentTarget)
    const ingredientes = data.data.map(({ id_ingrediente, unidad_medida }) => ({ id_ingrediente, unidad_esperada: unidad_medida, cantidad: Number(form.get(String(id_ingrediente))) })).filter(l => l.cantidad > 0)
    setGuardando(true); setFallo('')
    try { await api.put(ruta, { ingredientes }); cerrar() }
    catch (e) { setFallo(mensajeError(e)) }
    finally { setGuardando(false) }
  }
  return (
    <Modal title={`Receta de ${producto.Nombre}`} onClose={cerrar} busy={guardando}>
      {error ? <p role="alert">{error} <button onClick={cargar}>Reintentar</button></p> : !data ? <p role="status">Cargando receta…</p> : !data.data.length ?
        <p>Primero crea un ingrediente en Inventario.</p> :
        <form onSubmit={guardar} className="grid gap-4">
          <p className="text-sm text-[var(--texto-muted)]">Cantidad que se descuenta al pedir una unidad del producto. Deja en blanco los ingredientes que no se usan.</p>
          {data.data.map(i => <InputField key={i.id_ingrediente} label={`${i.nombre} (${unidadDeCantidad(i.unidad_medida) || 'sin unidad'})`} name={String(i.id_ingrediente)}
            type="number" min="0" max="9999999.999" step="0.001" placeholder="0" defaultValue={i.cantidad || ''} />)}
          {fallo && <p role="alert" className="text-[var(--rojo-dark)]">{fallo}</p>}
          <Button type="submit" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar receta'}</Button>
        </form>}
    </Modal>
  )
}
