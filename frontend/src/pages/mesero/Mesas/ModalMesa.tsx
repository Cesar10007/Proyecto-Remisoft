import type { ReactNode } from 'react'
import { Dialogo } from '../Dialogo'
import { formatCOP } from '../utils'
import { estadoMesa, etiquetas, mesaN, type Consumo, type MesaLectura, type Plato } from './lectura'
import './ModalMesa.css'

export function ConsumoPedido({
  pedido: p,
  cliente,
  accionPlato,
}: {
  pedido: Consumo
  cliente?: string
  accionPlato?: (i: Plato) => ReactNode
}) {
  return (
    <div className="mm-consumo">
      <header>
        <h4>Pedido #{p.id_pedido}</h4>
        <span className="mm-pastilla">{etiquetas[p.estado] ?? p.estado}</span>
      </header>
      <p className="mm-secundario">
        {p.nombre_mesero ?? 'Sin mesero'}
        {p.comensales != null && ` · ${p.comensales} comensales`}
        {cliente && ` · ${cliente}`}
        {p.fecha_hora && (
          <>
            {' '}
            ·{' '}
            <time dateTime={p.fecha_hora}>
              {new Date(p.fecha_hora).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}
            </time>
          </>
        )}
      </p>
      {p.notas && <p>Nota de cocina: {p.notas}</p>}
      {!p.items.length ? (
        <p className="mm-vacio">Este pedido aún no tiene artículos.</p>
      ) : (
        <ul aria-label={`Artículos del pedido ${p.id_pedido}`}>
          {p.items.map((i) => (
            <li key={i.id_detalle}>
              <div className="mm-renglon">
                <strong>
                  {i.cantidad} × {i.nombre}
                </strong>
                <b>{formatCOP(i.subtotal)}</b>
              </div>
              <div className="mm-renglon mm-secundario">
                <span>{formatCOP(i.precio_unitario)} por unidad</span>
                <span>{etiquetas[i.estado] ?? i.estado}</span>
              </div>
              {i.nota && <p className="mm-nota">{i.nota}</p>}
              {accionPlato?.(i)}
            </li>
          ))}
        </ul>
      )}
      <dl className="mm-totales">
        <div>
          <dt>Subtotal</dt>
          <dd>{formatCOP(p.subtotal)}</dd>
        </div>
        <div>
          <dt>IVA</dt>
          <dd>{formatCOP(p.iva)}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{formatCOP(p.total)}</dd>
        </div>
      </dl>
    </div>
  )
}

type Props = {
  mesa: MesaLectura
  cerrar: () => void
  sede?: string
  aviso?: ReactNode
  accionesSinPedido?: ReactNode
  // Las acciones son opcionales. Ver la mesa nunca crea ni modifica una cuenta.
  renderPedido?: (p: Consumo) => ReactNode
}
export default function ModalMesa({ mesa, cerrar, sede, aviso, accionesSinPedido, renderPedido }: Props) {
  const meseros = [...new Set(mesa.cuentas.map((p) => p.nombre_mesero).filter(Boolean))].join(', ')
  return (
    <Dialogo
      titulo={`Mesa ${mesaN(mesa.numero)}`}
      kicker={sede ? `Sala de comedor / ${sede}` : 'Sala de comedor'}
      onClose={cerrar}
      clase="mesa-modal"
    >
      <div className="mm-cuerpo">
        <dl className="mm-info" aria-label="Información de la mesa">
          <div>
            <dt>Estado de la mesa</dt>
            <dd>
              <span className={`mm-estado ${mesa.ocupada ? 'ocupada' : ''}`}>
                <i />
                {estadoMesa(mesa)}
              </span>
            </dd>
          </div>
          <div>
            <dt>Capacidad</dt>
            <dd>{mesa.capacidad == null ? 'No indicada' : `${mesa.capacidad} puestos`}</dd>
          </div>
          <div>
            <dt>Atiende</dt>
            <dd>{meseros || mesa.mesero || (mesa.ocupada ? 'Sin mesero' : 'Sin asignar')}</dd>
          </div>
          <div>
            <dt>Comensales</dt>
            <dd>
              {mesa.cuentas.length > 1
                ? 'Ver en cada pedido'
                : (mesa.comensales ?? (mesa.ocupada ? 'No indicado' : '0'))}
            </dd>
          </div>
        </dl>
        {aviso}
        <h3>
          Pedidos de la mesa <span>{mesa.cuentas.length}</span>
        </h3>
        {!mesa.cuentas.length ? (
          <p className="mm-vacio">Sin pedidos abiertos.</p>
        ) : (
          mesa.cuentas.map((p) => (
            <article key={p.id_pedido} aria-label={`Pedido ${p.id_pedido}`} className="mm-pedido">
              {renderPedido?.(p) ?? <ConsumoPedido pedido={p} />}
            </article>
          ))
        )}
        {mesa.cuentas.length > 1 && (
          <div className="mm-total-mesa">
            <strong>Total de la mesa con IVA</strong>
            <b>{formatCOP(mesa.cuentas.reduce((s, p) => s + p.total, 0))}</b>
          </div>
        )}
      </div>
      {!mesa.cuentas.length && accionesSinPedido}
    </Dialogo>
  )
}
