import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { formatCOP } from '../utils'

// Forma de GET /api/turnos/arqueos (solo los campos que usamos).
interface TurnoResumen {
  estado: string | null
  esperado: number | null
  ingresos: number
  egresos: number
}

interface ResumenCajaProps {
  onNavigate: (vista: string) => void
}
 
function ResumenCaja({ onNavigate }: ResumenCajaProps) {
  const [turnos, setTurnos] = useState<TurnoResumen[]>([])

  useEffect(() => {
    api
      .get<{ data: TurnoResumen[] }>('/turnos/arqueos')
      .then(({ data }) => setTurnos(data.data))
      .catch(() => setTurnos([]))
  }, [])

  const turnoAbierto = turnos.find((t) => t.estado === 'ABIERTA') ?? null

  return (
    <section className="m-6">
 
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Caja</h1>
        <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
          Gestión y control de movimientos de caja
        </p>
      </div>
 
      {/* Resumen del turno abierto */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Saldo esperado</span>
            <span className="material-symbols-outlined text-[1.4rem]">account_balance_wallet</span>
          </div>
          <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            {turnoAbierto ? formatCOP(turnoAbierto.esperado ?? 0) : '—'}
          </p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">
            {turnoAbierto ? 'Efectivo esperado del turno abierto' : 'Sin caja abierta'}
          </p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Ingresos del turno</span>
            <span className="material-symbols-outlined text-[1.4rem]">trending_up</span>
          </div>
          <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            {turnoAbierto ? formatCOP(turnoAbierto.ingresos) : '—'}
          </p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Ingresos registrados en el turno abierto</p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Egresos del turno</span>
            <span className="material-symbols-outlined text-[1.4rem]">trending_down</span>
          </div>
          <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            {turnoAbierto ? formatCOP(turnoAbierto.egresos) : '—'}
          </p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Egresos registrados en el turno abierto</p>
        </div>

        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Estado de caja</span>
            <span className="material-symbols-outlined text-[1.4rem]">point_of_sale</span>
          </div>
          <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">{turnoAbierto ? 'Abierta' : 'Cerrada'}</p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">{turnoAbierto ? 'Turno activo' : 'Sin turno activo'}</p>
        </div>

      </div>

      {/* Acciones de caja */}
      <div className="mt-6">
 
        <div className="mb-4">
          <h2 className="text-[1.1rem] font-bold text-[var(--wa-text)]">Acciones de caja</h2>
          <p className="mt-1 text-[0.85rem] text-[var(--wa-text-muted)]">
            Gestiona las operaciones principales de la caja
          </p>
        </div>
 
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
 
          {/* Aperturas de caja */}
          <button
            type="button"
            onClick={() => onNavigate('aperturas')}
            className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-tertiary-light)] text-[1.4rem]">
              🔓
            </div>
            <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">Aperturas de caja</h3>
            <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
              Consulta las aperturas de caja registradas.
            </p>
          </button>
 
          {/* Cierres de turno */}
          <button
            type="button"
            onClick={() => onNavigate('cierres')}
            className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-secondary-light)] text-[1.4rem]">
              🔒
            </div>
            <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">Cierres de turno</h3>
            <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
              Consulta los cierres realizados durante los turnos.
            </p>
          </button>
 
          {/* Reportes de ventas */}
          <button
            type="button"
            onClick={() => onNavigate('reportes')}
            className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-primary-light)] text-[1.4rem]">
              📊
            </div>
            <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">Reportes de ventas del día</h3>
            <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
              Visualiza un resumen de las ventas realizadas.
            </p>
          </button>
 
          {/* Arqueos de caja */}
          <button
            type="button"
            onClick={() => onNavigate('arqueos')}
            className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-tertiary-light)] text-[1.4rem]">
              🧮
            </div>
            <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">Arqueos de caja</h3>
            <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
              Revisa y controla los arqueos de caja.
            </p>
          </button>
 
          {/* Gastos menores */}
          <button
            type="button"
            onClick={() => onNavigate('gastos')}
            className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-primary-light)] text-[1.4rem]">
              💵
            </div>
            <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">Gastos menores</h3>
            <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
              Consulta los gastos menores de caja.
            </p>
          </button>
 
        </div>
 
      </div>
 
    </section>
  )
}
 
export default ResumenCaja