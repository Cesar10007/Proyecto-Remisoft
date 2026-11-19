import type { ReactNode } from 'react'
export { Dialogo } from './Dialogo'
import { AlertCircle, ArrowLeft, CircleDashed, RefreshCw, Search } from 'lucide-react'
import { etiquetas } from './modelo'
import { formatCOP } from './utils'

export function Estado({ valor }: { valor: string | null }) {
  const estado = valor || 'Sin estado'
  return (
    <span className={`sl-pill sl-state-${valor?.toLowerCase() ?? 'desconocido'}`}>
      <i />
      {etiquetas[estado] ?? estado}
    </span>
  )
}
export function Buscador({
  valor,
  cambiar,
  titulo,
}: {
  valor: string
  cambiar: (v: string) => void
  titulo: string
}) {
  return (
    <label className="sl-search">
      <Search size={16} aria-hidden="true" />
      <input
        aria-description="Escribe para filtrar los resultados de esta lista."
        type="search"
        aria-label={titulo}
        placeholder={titulo}
        value={valor}
        onChange={(e) => cambiar(e.target.value)}
      />
    </label>
  )
}
export function ErrorCarga({ texto, reintentar }: { texto: string; reintentar?: () => void }) {
  return (
    <div className="sl-error" role="alert">
      <AlertCircle size={18} />
      <span>{texto}</span>
      {reintentar && (
        <button aria-description="Vuelve a intentar la consulta que falló." type="button" onClick={reintentar}>
          <RefreshCw size={14} /> Reintentar
        </button>
      )}
    </div>
  )
}
export function Vacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="sl-empty">
      <CircleDashed size={26} />
      <strong>{titulo}</strong>
      {children && <p>{children}</p>}
    </div>
  )
}
export function Totales({ subtotal, iva, total }: { subtotal: number; iva: number; total: number }) {
  return (
    <dl className="sl-totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{formatCOP(subtotal)}</dd>
      </div>
      <div>
        <dt>IVA</dt>
        <dd>{formatCOP(iva)}</dd>
      </div>
      <div>
        <dt>Total</dt>
        <dd>{formatCOP(total)}</dd>
      </div>
    </dl>
  )
}

export function CargaCaja({
  error,
  cargar,
  volver,
}: {
  error: string
  cargar: () => void
  volver: () => void
}) {
  return (
    <section className="sl-panel sl-detail">
      <div>
        <button aria-description="Regresa al resumen de caja." className="sl-btn" onClick={volver}>
          <ArrowLeft size={15} /> Volver
        </button>
      </div>
      {error ? (
        <ErrorCarga texto={error} reintentar={cargar} />
      ) : (
        <p role="status">Cargando consulta de caja…</p>
      )}
    </section>
  )
}
