import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LibroCaja from '../components/LibroCaja'
import Button from '../../../components/common/Button'
import type { Caja } from '../types'
import { DataTable } from '../../../components/common/DataTable'
import { Badge } from '../../../components/common/Badge'
import { mensajeError } from '../../../utils/mensajeError'

interface CajasSectionProps {
  cajas: Caja[]
  onCreate: () => void
  onEdit: (caja: Caja) => void
  onToggle: (id: number, estado: string) => Promise<void>
}

export default function CajasSection({ cajas, onCreate, onEdit, onToggle }: CajasSectionProps) {
  const [params, setParams] = useSearchParams()
  const estado = params.get('estado_caja') === 'INACTIVA' ? 'INACTIVA' : 'ACTIVA'
  const visibles = cajas.filter(c => (c.estado === 'ACTIVA') === (estado === 'ACTIVA'))
  const selector = useRef<HTMLSelectElement>(null)
  const elegida = visibles.find(c => c.id_caja === Number(params.get('caja'))) ?? visibles[0]
  const [ocupado, setOcupado] = useState(false), [error, setError] = useState('')
  function elegir(filtro: string, id?: number) {
    const p = new URLSearchParams(params); p.set('estado_caja', filtro)
    if (id) p.set('caja', String(id)); else p.delete('caja')
    setParams(p); setError('')
  }
  async function cambiar(c: Caja) {
    setOcupado(true); setError('')
    try { await onToggle(c.id_caja, c.estado) } catch (e) { setError(mensajeError(e)) } finally { setOcupado(false) }
  }
  return <div className="mt-6 min-w-0">
    <div className="mb-4 flex flex-wrap gap-2">{['ACTIVA','INACTIVA'].map(e => <Button aria-description={e === 'ACTIVA' ? 'Muestra las cajas disponibles para operar.' : 'Muestra las cajas que están fuera de operación.'} key={e} variant={e === estado ? 'primary' : 'outline'} aria-pressed={e === estado} onClick={() => elegir(e)}>
      {e === 'ACTIVA' ? 'Cajas activas' : 'Cajas inactivas'} ({cajas.filter(c => (c.estado === 'ACTIVA') === (e === 'ACTIVA')).length})</Button>)}</div>
    {error && <p role="alert">{error}</p>}
    <DataTable title="Gestión de Cajas" data={visibles} keyExtractor={c => c.id_caja} emptyMessage={`No hay cajas ${estado === 'ACTIVA' ? 'activas' : 'inactivas'}.`}
      actionButton={<Button aria-description="Abre el formulario para registrar una caja." onClick={onCreate}>+ Nueva Caja</Button>} columns={[
        { header: 'Nombre', render: c => <strong>{c.nombre}</strong> },
        { header: 'Estado', render: c => <Badge status={c.estado === 'ACTIVA' ? 'active' : 'inactive'} label={c.estado} /> },
        { header: 'Operación', render: c => c.turno_activo ? `Turno abierto #${c.turno_activo}` : 'Sin turno abierto' },
        { header: 'Acciones', render: c => <div className="flex flex-wrap gap-2">
          <Button aria-description={`Consulta los movimientos y arqueos de ${c.nombre}.`} size="small" variant="outline" onClick={() => { elegir(estado, c.id_caja); selector.current?.focus() }}>Ver movimientos</Button>
          <Button aria-description={`Abre la ficha de ${c.nombre} para modificarla.`} size="small" variant="outline" onClick={() => onEdit(c)}>Editar</Button>
          <Button aria-description={c.estado === 'ACTIVA' ? 'Impide abrir nuevos turnos en esta caja.' : 'Permite volver a abrir turnos en esta caja.'} size="small" variant="ghost" disabled={ocupado} onClick={() => cambiar(c)}>{c.estado === 'ACTIVA' ? 'Desactivar' : 'Reactivar'}</Button>
        </div> },
      ]} />
    {elegida && <>
      <label className="mt-6 grid max-w-sm gap-1 font-semibold">Consultar caja
        <select aria-description="Elige la caja cuyo libro y arqueos quieres consultar." ref={selector} className="rounded-lg border border-[var(--borde)] bg-[var(--bg-card)] p-2" value={elegida.id_caja} onChange={e => elegir(estado, Number(e.target.value))}>
          {visibles.map(c => <option key={c.id_caja} value={c.id_caja}>{c.nombre}</option>)}
        </select>
      </label>
      <LibroCaja key={elegida.id_caja} caja={elegida} />
    </>}
  </div>
}
