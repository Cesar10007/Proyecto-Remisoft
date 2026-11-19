import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Button from '../../../components/common/Button'
import { useConsulta } from '../../../hook/useConsulta'
import { cantidadConUnidad } from '../../../utils/unidadesInventario'

type Asiento = { ingrediente: string | null; tipo: string; cantidad: number; unidad: string | null; fecha: string | null; origen: string | null; origen_id: number | null; motivo: string | null }
type Evento = { grupo: string; movimiento: Asiento | null; campos: string | null; id_evento: number; fecha: string; id_actor: number | null; actor: string; accion: string; entidad: string; registro: number; antes: string | null; despues: string | null }
const grupos: Record<string, string> = { CAJA: 'Caja', MESEROS: 'Meseros', INVENTARIO: 'Inventario', COCINA: 'Cocina', SISTEMA: 'Sistema', OTROS: 'Otras operaciones' }
const fechaLocal = (fecha: string) => new Date(fecha).toLocaleString('es-CO', { timeZone: 'America/Bogota' })

function Actividad({ grupo, ingrediente }: { grupo: string; ingrediente: string }) {
  const [paginas, setPaginas] = useState<number[]>([]), antes = paginas[paginas.length - 1]
  const filtros = new URLSearchParams()
  if (antes) filtros.set('antes', String(antes))
  if (grupo) filtros.set('grupo', grupo)
  if (ingrediente) filtros.set('id_ingrediente', ingrediente)
  const consulta = useConsulta<{ data: Evento[]; siguiente: number | null }>(`/historial?${filtros}`, antes ? undefined : 15000)
  const pagina = consulta.data
  if (consulta.error) return <p role="alert">{consulta.error} <Button variant="outline" onClick={consulta.cargar}>Reintentar</Button></p>
  if (!pagina) return <p>Cargando historial…</p>
  return <>
    {!pagina.data.length && <p>No hay actividad registrada.</p>}
    <ol className="divide-y divide-[var(--borde)]">{pagina.data.map(h => <li key={h.id_evento} className="break-words py-3">
      <strong>{h.entidad} #{h.registro} · {h.accion}</strong>
      {h.movimiento ? <div className="my-1 text-sm">
        <p>{h.movimiento.ingrediente} · <b>{h.movimiento.tipo === 'ENTRADA' ? 'Entrada' : h.movimiento.tipo === 'SALIDA' ? 'Salida' : h.movimiento.tipo}: {cantidadConUnidad(Number(h.movimiento.cantidad), h.movimiento.unidad)}</b></p>
        <p>{h.movimiento.origen ?? 'Sin origen registrado'}{h.movimiento.origen_id != null && ` #${h.movimiento.origen_id}`} · {h.movimiento.motivo ?? 'Sin nota'}</p>
      </div> : <p className="text-sm">{h.antes && h.despues && h.antes !== h.despues ? `${h.antes} → ${h.despues}` : h.despues ?? h.antes}</p>}
      {h.campos && <p className="text-sm text-[var(--texto-muted)]">Campos modificados: {h.campos}.</p>}
      <small>{grupos[h.grupo]} · {h.actor}{h.id_actor && ` (#${h.id_actor})`} · <time dateTime={h.movimiento?.fecha ?? h.fecha}>{fechaLocal(h.movimiento?.fecha ?? h.fecha)}</time></small>
    </li>)}</ol>
    <div className="mt-4 flex flex-wrap gap-2">
      {antes && <Button variant="outline" onClick={() => setPaginas(p => p.slice(0, -1))}>Más recientes</Button>}
      {pagina.siguiente && <Button variant="outline" onClick={() => setPaginas(p => [...p, pagina.siguiente!])}>Más antiguos</Button>}
    </div>
  </>
}

export default function HistorialSection() {
  const [params, setParams] = useSearchParams()
  const grupo = params.get('area') || '', ingrediente = grupo === 'INVENTARIO' ? params.get('insumo') || '' : ''
  const catalogo = useConsulta<{ id_ingrediente: number; nombre: string }[]>(grupo === 'INVENTARIO' ? '/ingredientes' : null)
  const filtrar = (clave: string, valor: string) => {
    const p = new URLSearchParams(params); if (valor) p.set(clave, valor); else p.delete(clave)
    if (clave === 'area') p.delete('insumo'); setParams(p)
  }
  return <section className="mt-6 min-w-0 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-4 sm:p-6">
    <h3 className="text-lg font-bold">Historial de actividad</h3>
    <p className="mb-4 text-sm text-[var(--texto-muted)]">Operaciones de este establecimiento. Horario de Bogotá.</p>
    <div className="mb-4 flex flex-wrap gap-4">
      <label className="grid gap-1 text-sm font-semibold">Área del movimiento<select className="rounded-lg border bg-[var(--bg-card)] p-2" value={grupo} onChange={e => filtrar('area', e.target.value)}>
        <option value="">Todas las áreas</option>{Object.entries(grupos).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
      </select></label>
      {grupo === 'INVENTARIO' && <label className="grid min-w-0 gap-1 text-sm font-semibold">Ingrediente<select className="min-w-0 rounded-lg border bg-[var(--bg-card)] p-2" value={ingrediente} onChange={e => filtrar('insumo', e.target.value)}>
        <option value="">Todo el inventario</option>{catalogo.data?.map(i => <option key={i.id_ingrediente} value={i.id_ingrediente}>{i.nombre}</option>)}
      </select></label>}
    </div>
    {catalogo.error && grupo === 'INVENTARIO' && <p role="alert">{catalogo.error} <button onClick={catalogo.cargar}>Reintentar</button></p>}
    <Actividad key={`${grupo}:${ingrediente}`} grupo={grupo} ingrediente={ingrediente} />
  </section>
}
