import { useState } from 'react'
import { DataTable } from '../../../components/common/DataTable'
import Button from '../../../components/common/Button'
import { useConsulta } from '../../../hook/useConsulta'
import { etiquetaMetodo, formatoCOP } from '../useDatosGerente'

import type { Caja } from '../types'

type Movimiento = { id_flujo: number; id_turno: number; id_pago: number | null; fecha: string | null; concepto: string | null; caja: string | null; metodo: string | null; ingresos: string | null; egresos: string | null; saldo: string | null }
type Arqueo = { id_turno: number; caja: { nombre: string } | null; estado: string; efectivo_inicial: number; ingresos: number; egresos: number; esperado: number | null }
const cop = (n: number | string | null) => n == null ? '—' : formatoCOP.format(Number(n))

export default function LibroCaja({ caja }: { caja: Caja }) {
  const [paginas, setPaginas] = useState<number[]>([]), antes = paginas[paginas.length - 1]
  const libro = useConsulta<{ data: Movimiento[]; siguiente: number | null }>(`/turnos/movimientos?id_caja=${caja.id_caja}${antes ? `&antes=${antes}` : ''}`, antes ? undefined : 15000)
  const arqueos = useConsulta<{ data: Arqueo[] }>(`/turnos/arqueos?id_caja=${caja.id_caja}`, 15000)
  const [estado, setEstado] = useState('ABIERTA')
  return <section className="my-6 grid min-w-0 gap-4">
    <h2 className="text-lg font-bold">Libro de caja · {caja.nombre}</h2>
    {arqueos.error ? <p role="alert">{arqueos.error} <button aria-description="Vuelve a consultar los arqueos de esta caja." onClick={arqueos.cargar}>Reintentar</button></p> : !arqueos.data ? <p>Cargando arqueos…</p> :
      <div>
      <label className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold">Resumen por turno<select aria-description="Elige entre los turnos activos y los ya cerrados." className="rounded-lg border bg-[var(--bg-card)] p-2" value={estado} onChange={e => setEstado(e.target.value)}>
        <option value="ABIERTA">Turnos activos</option><option value="CERRADA">Historial de turnos cerrados</option>
      </select></label>
      <DataTable key={estado} title={estado === 'ABIERTA' ? 'Turnos activos' : 'Historial de turnos cerrados'} data={arqueos.data.data.filter(t => t.estado === estado)} keyExtractor={t => t.id_turno} emptyMessage={estado === 'ABIERTA' ? 'No hay turnos activos en esta caja.' : 'No hay turnos cerrados en esta caja.'} columns={[
        { header: 'Turno', render: t => `#${t.id_turno} · ${t.caja?.nombre ?? 'Sin caja'} · ${t.estado}` },
        { header: 'Fondo inicial', render: t => cop(t.efectivo_inicial) }, { header: 'Ingresos', render: t => cop(t.ingresos) },
        { header: 'Egresos', render: t => cop(t.egresos) }, { header: 'Efectivo esperado', render: t => cop(t.esperado) },
      ]} /></div>}
    <p className="text-sm text-[var(--texto-muted)]">Los ingresos incluyen todos los medios de pago. El fondo inicial no es una venta; el efectivo esperado excluye cobros electrónicos.</p>
    {libro.error ? <p role="alert">{libro.error} <button aria-description="Vuelve a cargar los movimientos de esta caja." onClick={libro.cargar}>Reintentar</button></p> : !libro.data ? <p>Cargando movimientos…</p> : <>
      <DataTable title="Movimientos de caja" data={libro.data.data} keyExtractor={m => m.id_flujo} emptyMessage="No hay movimientos de caja." columns={[
        { header: 'Fecha (Bogotá)', render: m => m.fecha ? new Date(m.fecha).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : '—' },
        { header: 'Turno / caja', render: m => `#${m.id_turno} · ${m.caja ?? '—'}` }, { header: 'Concepto', render: m => m.concepto ?? '—' },
        { header: 'Medio', render: m => etiquetaMetodo(m.metodo) }, { header: 'Ingreso', render: m => cop(m.ingresos) },
        { header: 'Egreso', render: m => cop(m.egresos) }, { header: 'Saldo registrado', render: m => cop(m.saldo) },
      ]} />
      <div className="flex gap-2">{antes && <Button aria-description="Muestra los movimientos de caja más recientes." variant="outline" onClick={() => setPaginas(p => p.slice(0,-1))}>Más recientes</Button>}
        {libro.data.siguiente && <Button aria-description="Muestra los movimientos de caja anteriores." variant="outline" onClick={() => setPaginas([...paginas, libro.data!.siguiente!])}>Más antiguos</Button>}</div>
    </>}
  </section>
}
