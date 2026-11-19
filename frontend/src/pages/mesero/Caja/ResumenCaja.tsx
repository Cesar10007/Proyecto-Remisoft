import { useState } from 'react'
import { ArrowRight, ChartNoAxesCombined, Coins, DoorClosed, DoorOpen, Landmark, Scale } from 'lucide-react'
import { ErrorCarga, Vacio } from '../Elementos'
import { useConsulta } from '../useConsulta'
import { formatCOP } from '../utils'

type Turno = {
  id_turno: number
  estado: string
  esperado: number | null
  ingresos: number
  egresos: number
  caja: { nombre: string } | null
  usuario: { nombre: string; apellido: string } | null
}
const consultas = [
  { id: 'aperturas', titulo: 'Aperturas de caja', icon: DoorOpen },
  { id: 'cierres', titulo: 'Cierres de turno', icon: DoorClosed },
  { id: 'arqueos', titulo: 'Arqueos de caja', icon: Scale },
  { id: 'gastos', titulo: 'Gastos menores', icon: Coins },
  { id: 'reportes', titulo: 'Ventas del día', icon: ChartNoAxesCombined },
]
export default function ResumenCaja({ onNavigate }: { onNavigate: (v: string) => void }) {
  const { data, error, cargar } = useConsulta<{ data: Turno[] }>('/turnos/arqueos', 15000)
  const [id, setId] = useState(0)
  const abiertos = data?.data.filter((t) => t.estado === 'ABIERTA') ?? []
  const turno = abiertos.find((t) => t.id_turno === id) ?? abiertos[0]
  return (
    <section className="sl-panel">
      <div className="sl-panel-head">
        <div className="sl-title-icon">
          <Landmark size={19} />
          <h2>Consultas de caja</h2>
        </div>
        <span className="sl-subtag">Solo lectura</span>
      </div>
      {error && <ErrorCarga texto={error} reintentar={cargar} />}
      <div className="sl-cash-summary">
        {turno ? (
          <>
            <label className="sl-field">
              Turno abierto
              <select aria-description="Elige un turno para consultar sus ingresos y su efectivo esperado." value={turno.id_turno} onChange={(e) => setId(+e.target.value)}>
                {abiertos.map((t) => (
                  <option key={t.id_turno} value={t.id_turno}>
                    {t.caja?.nombre ?? 'Caja'} · {t.usuario?.nombre} {t.usuario?.apellido} · #{t.id_turno}
                  </option>
                ))}
              </select>
            </label>
            <dl>
              {(
                [
                  ['Efectivo esperado', turno.esperado],
                  ['Ingresos', turno.ingresos],
                  ['Egresos', turno.egresos],
                ] as const
              ).map(([label, n]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{n == null ? '—' : formatCOP(Number(n))}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : data ? (
          <Vacio titulo="No hay turnos abiertos">
            El cajero necesita un turno abierto para registrar el pago.
          </Vacio>
        ) : (
          !error && <p role="status">Cargando turnos…</p>
        )}
      </div>
      <div className="sl-cash-links">
        {consultas.map((c) => (
          <button aria-description={`Abre la consulta «${c.titulo}».`} key={c.id} onClick={() => onNavigate(c.id)}>
            <c.icon size={17} />
            {c.titulo}
            <ArrowRight size={14} />
          </button>
        ))}
      </div>
    </section>
  )
}
