import { formatCOP } from '../utils'
import { tiempoTranscurrido } from '../../../utils/tiempo'
import { estadoMesa, mesaN, type MesaLectura } from './lectura'

export default function TarjetaMesa({ mesa, abrir }: { mesa: MesaLectura; abrir: (numero: number) => void }) {
  const numero = mesaN(mesa.numero)
  const [primero] = mesa.cuentas
  const articulos = mesa.cuentas.reduce((s, p) => s + p.items.reduce((n, i) => n + i.cantidad, 0), 0)
  const enCaja = primero && mesa.cuentas.every((p) => p.estado === 'POR_COBRAR')
  return (
    <button
      aria-description={`Consulta el estado y los pedidos de la mesa ${numero}.`}
      type="button"
      className={`wa-table-card wa-table-card--${mesa.ocupada ? 'occupied' : 'available'}`}
      aria-haspopup="dialog"
      aria-label={`Mesa ${numero}, ${estadoMesa(mesa)}. Ver mesa`}
      onClick={() => abrir(mesa.numero)}
    >
      {!mesa.ocupada ? (
        <>
          <span className="wa-table-card__number wa-table-card__number--available">{numero}</span>
          <span className="wa-table-card__empty-label">Disponible</span>
        </>
      ) : (
        <>
          <span className="wa-table-card__top">
            <span className="wa-table-card__number">{numero}</span>
            <span className="wa-table-card__badge">
              {enCaja ? 'En caja' : tiempoTranscurrido(mesa.fecha_hora)}
            </span>
          </span>
          <strong>
            {mesa.cuentas.length > 1
              ? `${mesa.cuentas.length} pedidos`
              : primero
                ? `Pedido #${primero.id_pedido}`
                : 'Sin pedido'}
          </strong>
          <small>
            {articulos} artículos · {mesa.mesero || 'Sin mesero'}
          </small>
          <span className="wa-table-card__footer">
            <b className="wa-table-card__price">
              {formatCOP(mesa.cuentas.reduce((s, p) => s + p.subtotal, 0))}
            </b>
            <span className="wa-table-card__more" aria-hidden="true">
              •••
            </span>
          </span>
        </>
      )}
    </button>
  )
}
