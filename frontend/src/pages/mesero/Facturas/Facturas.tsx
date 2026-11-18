import { useState } from 'react'
import { ArrowUpRight, FileText, Printer, RefreshCw } from 'lucide-react'
import { Buscador, Dialogo, ErrorCarga, Estado, Vacio } from '../Elementos'
import { mesaN, normalizar } from '../modelo'
import { useConsulta } from '../useConsulta'
import { formatCOP } from '../utils'

type Importe = string | number | null
interface Factura {
  id_factura: number
  id_pedido: number
  consecutivo: string | null
  Fecha_emision: string | null
  total: Importe
  IVA: Importe
  Propina: Importe
  Descuento: Importe
  estado: string | null
  pedido: { Mesa_num: number }
  pago: { metodo: string | null; estado: string | null }[]
}
interface Detalle extends Factura {
  Factura_item: {
    id_detalle_pedido: number
    cantidad_facturada: number
    Detalle_pedido: { Precio_unitario: Importe; Producto: { Nombre: string | null } }
  }[]
}
const fecha = (v: string | null) =>
  v
    ? new Date(v).toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Sin fecha'
const numero = (f: Factura) => f.consecutivo || `Factura #${f.id_factura}`
function Comprobante({ id, cerrar }: { id: number; cerrar: () => void }) {
  const { data, error, cargar } = useConsulta<{ data: Detalle }>(`/facturas/${id}`)
  const f = data?.data
  return (
    <Dialogo
      titulo={f ? numero(f) : 'Factura'}
      kicker="Facturación / Comprobante de la mesa"
      onClose={cerrar}
    >
      <div className="sl-detail">
        {error ? (
          <ErrorCarga texto={error} reintentar={cargar} />
        ) : !f ? (
          <p role="status">Cargando factura…</p>
        ) : (
          <>
            <div className="sl-detail-meta">
              <Estado valor={f.estado} />
              <span>
                Mesa {mesaN(f.pedido.Mesa_num)} · Pedido #{f.id_pedido}
              </span>
            </div>
            <p className="sl-fineprint">{fecha(f.Fecha_emision)}</p>
            <h3>Consumo facturado</h3>
            {f.Factura_item.length === 0 && (
              <p className="sl-note">Esta factura no tiene renglones asociados.</p>
            )}
            {f.Factura_item.map((i) => (
              <div className="sl-consumo" key={i.id_detalle_pedido}>
                <div className="sl-line-head">
                  <strong>
                    {i.cantidad_facturada} × {i.Detalle_pedido.Producto.Nombre || 'Producto sin nombre'}
                  </strong>
                  <b>{formatCOP(i.cantidad_facturada * Number(i.Detalle_pedido.Precio_unitario))}</b>
                </div>
                <small>{formatCOP(Number(i.Detalle_pedido.Precio_unitario))} por unidad</small>
              </div>
            ))}
            <dl className="sl-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>
                  {f.total == null
                    ? '—'
                    : formatCOP(Number(f.total) - Number(f.IVA) - Number(f.Propina) + Number(f.Descuento))}
                </dd>
              </div>
              <div>
                <dt>IVA</dt>
                <dd>{f.IVA == null ? '—' : formatCOP(Number(f.IVA))}</dd>
              </div>
              {Number(f.Descuento) > 0 && (
                <div>
                  <dt>Descuento</dt>
                  <dd>− {formatCOP(Number(f.Descuento))}</dd>
                </div>
              )}
              {Number(f.Propina) > 0 && (
                <div>
                  <dt>Propina</dt>
                  <dd>{formatCOP(Number(f.Propina))}</dd>
                </div>
              )}
              <div>
                <dt>Total</dt>
                <dd>{f.total == null ? '—' : formatCOP(Number(f.total))}</dd>
              </div>
            </dl>
            <p className="sl-fineprint">
              Pago:{' '}
              {f.pago
                .filter((p) => p.estado === 'APROBADO')
                .map((p) => p.metodo?.replace(/_/g, ' ').toLowerCase() ?? 'Método no informado')
                .join(', ') || 'Sin pago aprobado'}
            </p>
          </>
        )}
      </div>
      <div className="sl-dialog-actions no-print">
        <button className="sl-btn" onClick={cerrar}>
          Cerrar
        </button>
        {f && (
          <button className="sl-btn primary" onClick={() => window.print()}>
            <Printer size={15} /> Imprimir factura
          </button>
        )}
      </div>
    </Dialogo>
  )
}
export default function Facturas() {
  const { data, error, cargar, cargando } = useConsulta<{ data: Factura[] }>('/facturas', 15000)
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [id, setId] = useState<number | null>(null)
  const visibles =
    data?.data.filter(
      (f) =>
        (!estado || f.estado === estado) &&
        normalizar(
          `${numero(f)} Mesa ${mesaN(f.pedido.Mesa_num)} Mesa ${f.pedido.Mesa_num} #${f.id_pedido}`,
        ).includes(normalizar(buscar)),
    ) ?? []
  return (
    <section className="sl-panel">
      <div className="sl-panel-head">
        <div className="sl-title-icon">
          <FileText size={20} />
          <h2>Facturas de mis mesas</h2>
        </div>
        <button className="sl-iconbtn" aria-label="Actualizar facturas" disabled={cargando} onClick={cargar}>
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="sl-tools">
        <Buscador valor={buscar} cambiar={setBuscar} titulo="Buscar factura, pedido o mesa" />
        <select aria-label="Estado de factura" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="PAGADA">Pagada</option>
          <option value="EMITIDA">Emitida</option>
          <option value="ANULADA">Anulada</option>
        </select>
      </div>
      {error && <ErrorCarga texto={error} reintentar={cargar} />}
      {!data ? (
        !error && (
          <div className="sl-empty" role="status">
            Cargando facturas…
          </div>
        )
      ) : !visibles.length ? (
        <Vacio titulo="Sin facturas para mostrar">
          Las facturas emitidas por caja aparecen aquí. Revisa también los filtros.
        </Vacio>
      ) : (
        <div className="sl-list">
          {visibles.map((f) => (
            <button key={f.id_factura} className="sl-order-row" onClick={() => setId(f.id_factura)}>
              <span className="sl-tile-num">
                <FileText size={19} />
              </span>
              <span className="sl-row-body">
                <strong>{numero(f)}</strong>
                <small>
                  Mesa {mesaN(f.pedido.Mesa_num)} · {fecha(f.Fecha_emision)}
                </small>
              </span>
              <Estado valor={f.estado} />
              <b>{f.total == null ? '—' : formatCOP(Number(f.total))}</b>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      )}
      {id !== null && <Comprobante key={id} id={id} cerrar={() => setId(null)} />}
    </section>
  )
}
