import { useState } from 'react'
import api from '../../../api/axios'
import { DataTable } from '../../../components/common/DataTable'
import { mensajeError } from '../../../utils/mensajeError'
import AltaMesa from '../components/AltaMesa'
import Modal from '../../../components/common/Modal'
import { etiquetaMesa } from '../data'
import type { MesaGerente } from '../types'

export default function MesasSection({ mesas, actualizar }: { mesas: MesaGerente[]; actualizar: () => Promise<void> }) {
  const [seleccion, setSeleccion] = useState<MesaGerente | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  async function eliminar() {
    if (!seleccion || eliminando) return
    setEliminando(true)
    try {
      await api.delete(`/mesas/${seleccion.numero}`)
      setAviso(`Mesa ${seleccion.numero} eliminada.`)
    } catch (e) { setError(mensajeError(e)) }
    finally {
      await actualizar() // También ante un conflicto: alguien pudo ocuparla después de abrir el diálogo.
      setSeleccion(null)
      setEliminando(false)
    }
  }
  return (
    <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6">
      <h3 className="font-['Syne'] text-lg font-bold">Administrar mesas</h3>
      <p className="mb-5 text-sm text-[var(--texto-muted)]">Agrega mesas al salón. Solo puedes eliminar las que estén disponibles.</p>
      <AltaMesa alCrear={async numero => { setError(''); setAviso(`Mesa ${numero} agregada.`); await actualizar() }} />
      {error && <p role="alert" className="mb-3 text-[var(--rojo-dark)]">{error}</p>}
      {aviso && <p role="status" className="mb-3 text-sm">{aviso}</p>}
      <DataTable data={mesas} keyExtractor={m => m.numero} emptyMessage="No hay mesas registradas para este establecimiento." columns={[
        { header: 'Mesa', render: m => <strong>{etiquetaMesa(m.numero)}</strong> },
        { header: 'Capacidad', render: m => m.capacidad == null ? 'Sin especificar' : `${m.capacidad} personas` },
        { header: 'Estado', render: m => m.ocupada ? 'Ocupada' : 'Disponible' },
        { header: 'Acciones', render: m => <button type="button" disabled={m.ocupada} aria-label={`Eliminar mesa ${m.numero}`}
          className="font-semibold text-[var(--rojo-dark)] disabled:opacity-40" onClick={() => { setError(''); setAviso(''); setSeleccion(m) }}>Eliminar</button> },
      ]} />
      {seleccion && <Modal title={`¿Eliminar la mesa ${seleccion.numero}?`} onClose={() => setSeleccion(null)} busy={eliminando}>
        <p className="mb-5 text-sm">Se retirará del plano de tu establecimiento. Se conservarán sus pedidos y facturas anteriores.</p>
        <div className="flex justify-end gap-3">
          <button disabled={eliminando} className="ge-secondary-btn" onClick={() => setSeleccion(null)}>Cancelar</button>
          <button disabled={eliminando} className="ge-primary-btn" onClick={eliminar}>{eliminando ? 'Eliminando…' : 'Eliminar mesa'}</button>
        </div>
      </Modal>}
    </section>
  )
}
