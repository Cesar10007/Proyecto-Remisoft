import { useState } from 'react'
import { ArrowUpRight, ClipboardList, Clock3 } from 'lucide-react'
import { Buscador, Estado, Vacio } from '../Elementos'
import { etiquetas, mesaN, normalizar, unidades, type Pedido } from '../modelo'
import { formatCOP } from '../utils'
import { tiempoTranscurrido } from '../../../utils/tiempo'

export default function Pedidos({
  pedidos,
  abrir,
  enCaja = false,
}: {
  pedidos: Pedido[]
  abrir: (id: number) => void
  enCaja?: boolean
}) {
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const base = pedidos.filter((p) => !enCaja || p.estado === 'POR_COBRAR')
  const visibles = base.filter(
    (p) =>
      (!estado || etiquetas[p.estado] === estado) &&
      normalizar(
        `Mesa ${mesaN(p.mesa)} Mesa ${p.mesa} #${p.id_pedido} ${p.cliente} ${p.items.map((i) => i.nombre).join(' ')}`,
      ).includes(normalizar(buscar)),
  )
  return (
    <section className="sl-panel">
      <div className="sl-panel-head">
        <div className="sl-title-icon">
          <ClipboardList size={20} />
          <h2>{enCaja ? 'Cuentas enviadas a caja' : 'Pedidos activos'}</h2>
        </div>
        <span className="sl-counter">{base.length}</span>
      </div>
      <div className="sl-tools">
        <Buscador valor={buscar} cambiar={setBuscar} titulo="Buscar mesa, pedido o plato" />
        {!enCaja && (
          <select aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {['Pendiente', 'En preparación', 'Listo', 'Entregado', 'En caja'].map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        )}
      </div>
      {!visibles.length ? (
        <Vacio
          titulo={
            base.length
              ? 'Sin coincidencias'
              : enCaja
                ? 'Sin cuentas pendientes de pago'
                : 'No tienes pedidos activos'
          }
        >
          {base.length
            ? 'Prueba con otro filtro.'
            : enCaja
              ? 'Después de servir, envía la precuenta desde el detalle de la mesa.'
              : 'Selecciona una mesa libre para empezar.'}
        </Vacio>
      ) : (
        <div className="sl-list">
          {visibles.map((p) => (
            <button key={p.id_pedido} className="sl-order-row" onClick={() => abrir(p.id_pedido)}>
              <span className="sl-tile-num">{mesaN(p.mesa)}</span>
              <span className="sl-row-body">
                <strong>
                  Mesa {mesaN(p.mesa)} <small>· Pedido #{p.id_pedido}</small>
                </strong>
                <small>
                  <Clock3 size={12} /> {tiempoTranscurrido(p.fecha_hora)} · {unidades(p)} artículos
                  {p.cliente ? ` · ${p.cliente}` : ''}
                </small>
              </span>
              <Estado valor={p.estado} />
              <b>{formatCOP(p.total_factura_pendiente ?? p.total)}</b>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
