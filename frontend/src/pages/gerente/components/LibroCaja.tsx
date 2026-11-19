import { useState } from 'react'
import { DataTable } from '../../../components/common/DataTable'
import Button from '../../../components/common/Button'
import { useConsulta } from '../../../hook/useConsulta'
import { etiquetaMetodo, formatoCOP } from '../useDatosGerente'

type Movimiento = { id_flujo: number; id_turno: number; id_pago: number | null; fecha: string | null; concepto: string | null; caja: string | null; metodo: string | null; ingresos: string | null; egresos: string | null; saldo: string | null }
type Arqueo = { id_turno: number; caja: { nombre: string } | null; estado: string; efectivo_inicial: number; ingresos: number; egresos: number; esperado: number | null }
const cop = (n: number | string | null) => n == null ? '—' : formatoCOP.format(Number(n))

export default function LibroCaja() {
  const [paginas, setPaginas] = useState<number[]>([]), antes = paginas[paginas.length - 1]
  const libro = useConsulta<{ data: Movimiento[]; siguiente: number | null }>(`/turnos/movimientos${antes ? `?antes=${antes}` : ''}`, antes ? undefined : 15000)
  const arqueos = useConsulta<{ data: Arqueo[] }>('/turnos/arqueos', 15000)
  return <section className="my-6 grid gap-4">
    {arqueos.error ? <p role="alert">{arqueos.error} <button onClick={arqueos.cargar}>Reintentar</button></p> : !arqueos.data ? <p>Cargando arqueos…</p> :
      <DataTable title="Resumen por turno" data={arqueos.data.data} keyExtractor={t => t.id_turno} emptyMessage="No hay turnos registrados." columns={[
        { header: 'Turno', render: t => `#${t.id_turno} · ${t.caja?.nombre ?? 'Sin caja'} · ${t.estado}` },
        { header: 'Fondo inicial', render: t => cop(t.efectivo_inicial) }, { header: 'Ingresos', render: t => cop(t.ingresos) },
        { header: 'Egresos', render: t => cop(t.egresos) }, { header: 'Efectivo esperado', render: t => cop(t.esperado) },
      ]} />}
    <p className="text-sm text-[var(--texto-muted)]">Los ingresos incluyen todos los medios de pago. El fondo inicial no es una venta; el efectivo esperado excluye cobros electrónicos.</p>
    {libro.error ? <p role="alert">{libro.error} <button onClick={libro.cargar}>Reintentar</button></p> : !libro.data ? <p>Cargando movimientos…</p> : <>
      <DataTable title="Movimientos de caja" data={libro.data.data} keyExtractor={m => m.id_flujo} emptyMessage="No hay movimientos de caja." columns={[
        { header: 'Fecha (Bogotá)', render: m => m.fecha ? new Date(m.fecha).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : '—' },
        { header: 'Turno / caja', render: m => `#${m.id_turno} · ${m.caja ?? '—'}` }, { header: 'Concepto', render: m => m.concepto ?? '—' },
        { header: 'Medio', render: m => etiquetaMetodo(m.metodo) }, { header: 'Ingreso', render: m => cop(m.ingresos) },
        { header: 'Egreso', render: m => cop(m.egresos) }, { header: 'Saldo registrado', render: m => cop(m.saldo) },
      ]} />
      <div className="flex gap-2">{antes && <Button variant="outline" onClick={() => setPaginas(p => p.slice(0,-1))}>Más recientes</Button>}
        {libro.data.siguiente && <Button variant="outline" onClick={() => setPaginas([...paginas, libro.data!.siguiente!])}>Más antiguos</Button>}</div>
    </>}
  </section>
}
