import { formatCOP } from '../utils'
import type { ItemFactura } from './factura'

export function LineasFactura({ items }: { items: ItemFactura[] }) {
  return items.length ? (
    <ul aria-label="Artículos facturados">
      {items.map((i) => (
        <li className="sl-consumo" key={i.id_detalle}>
          <div className="sl-line-head">
            <strong>
              {i.cantidad} × {i.nombre}
            </strong>
            <b>{formatCOP(i.cantidad * i.precio_unitario)}</b>
          </div>
          <small>{formatCOP(i.precio_unitario)} por unidad</small>
        </li>
      ))}
    </ul>
  ) : (
    <p className="sl-note">Esta factura no tiene renglones asociados.</p>
  )
}
export function ImportesFactura({
  subtotal,
  iva,
  propina,
  descuento,
  total,
}: {
  subtotal: number | null
  iva: number | null
  propina: number
  descuento: number
  total: number | null
}) {
  return (
    <dl className="sl-totals">
      <div>
        <dt>Subtotal</dt>
        <dd>{subtotal == null ? '—' : formatCOP(subtotal)}</dd>
      </div>
      {descuento > 0 && (
        <div>
          <dt>Descuento</dt>
          <dd>− {formatCOP(descuento)}</dd>
        </div>
      )}
      <div>
        <dt>IVA</dt>
        <dd>{iva == null ? '—' : formatCOP(iva)}</dd>
      </div>
      {propina > 0 && (
        <div>
          <dt>Propina</dt>
          <dd>{formatCOP(propina)}</dd>
        </div>
      )}
      <div>
        <dt>Total</dt>
        <dd>{total == null ? '—' : formatCOP(total)}</dd>
      </div>
    </dl>
  )
}
