import { useState } from 'react'
import Button from '../../../components/common/Button'
import { useConsulta } from '../../../hook/useConsulta'

type Evento = { campos: string | null; id_evento: number; fecha: string; id_actor: number | null; actor: string; accion: string; entidad: string; registro: number; antes: string | null; despues: string | null }

export default function HistorialSection() {
  const [paginas, setPaginas] = useState<number[]>([])
  const antes = paginas[paginas.length - 1]
  const consulta = useConsulta<{ data: Evento[]; siguiente: number | null }>(`/historial${antes ? `?antes=${antes}` : ''}`, antes ? undefined : 15000)
  const pagina = consulta.data
  return <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6">
    <h3 className="text-lg font-bold">Historial de actividad</h3>
    <p className="mb-4 text-sm text-[var(--texto-muted)]">Operaciones de este establecimiento. Horario de Bogotá.</p>
    {consulta.error ? <p role="alert">{consulta.error} <button onClick={consulta.cargar}>Reintentar</button></p> : !pagina ? <p>Cargando historial…</p> : <>
      {!pagina.data.length && <p>No hay actividad registrada.</p>}
      <ol className="divide-y divide-[var(--borde)]">{pagina.data.map(h => <li key={h.id_evento} className="py-3">
        <strong>{h.entidad} #{h.registro} · {h.accion}</strong>
        <p className="text-sm">{h.antes && h.despues && h.antes !== h.despues ? `${h.antes} → ${h.despues}` : h.despues ?? h.antes}</p>
        {h.campos && <p className="text-sm text-[var(--texto-muted)]">Campos modificados: {h.campos}.</p>}
        <small>{h.actor}{h.id_actor && ` (#${h.id_actor})`} · {new Date(h.fecha).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</small>
      </li>)}</ol>
      <div className="mt-4 flex gap-2">
        {antes && <Button variant="outline" onClick={() => setPaginas(p => p.slice(0, -1))}>Más recientes</Button>}
        {pagina.siguiente && <Button variant="outline" onClick={() => setPaginas(p => [...p, pagina.siguiente!])}>Más antiguos</Button>}
      </div>
    </>}
  </section>
}
