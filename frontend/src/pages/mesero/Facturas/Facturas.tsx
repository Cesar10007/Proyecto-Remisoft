import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowUpRight, FilePlus2, FileText, LockKeyhole, Pencil, Printer, RefreshCw } from 'lucide-react'
import { Buscador, Dialogo, ErrorCarga, Estado, Vacio } from '../Elementos'
import { mesaN, normalizar, type Pedido } from '../modelo'
import { useConsulta } from '../useConsulta'
import { formatCOP } from '../utils'
import { estadoFactura, fechaFactura, numeroFactura, type DetalleFactura, type Factura } from './factura'
import { ImportesFactura, LineasFactura } from './ResumenFactura'
import EditorFactura from './EditorFactura'
import './Facturas.css'

function Comprobante({
  id,
  cerrar,
  actualizar,
}: {
  id: number
  cerrar: () => void
  actualizar: () => Promise<void>
}) {
  const { data, error, cargar } = useConsulta<{ data: DetalleFactura }>(`/facturas/${id}`, 8000)
  const f = data?.data
  const [original, setOriginal] = useState<DetalleFactura | null>(null)
  const [aviso, setAviso] = useState('')
  const refrescar = async () => {
    await Promise.all([cargar(), actualizar()])
  }
  if (original && f?.editable)
    return (
      <EditorFactura
        modo="editar"
        factura={original}
        cerrar={() => setOriginal(null)}
        refrescar={refrescar}
        bloqueo={
          error ||
          (original.version_edicion !== f.version_edicion
            ? 'La factura cambió. Cierra el editor y revisa la última versión.'
            : '')
        }
        guardada={async () => {
          await refrescar()
          setOriginal(null)
          setAviso('Cambios guardados.')
        }}
      />
    )
  return (
    <Dialogo
      titulo={f ? numeroFactura(f) : 'Factura'}
      kicker="Facturación / Comprobante de la mesa"
      onClose={cerrar}
    >
      <div className="sl-detail">
        {error && <ErrorCarga texto={error} reintentar={cargar} />}
        {!f ? (
          !error && <p role="status">Cargando factura…</p>
        ) : (
          <>
            <div className="sl-detail-meta">
              <Estado valor={estadoFactura(f)} />
              <span>
                Mesa {mesaN(f.pedido.Mesa_num)} · Pedido #{f.id_pedido}
              </span>
            </div>
            <p className="sl-fineprint">
              {fechaFactura(f.Fecha_emision)}
              {f.receptor && ` · A nombre de: ${f.receptor}`}
            </p>
            {aviso && (
              <p className="sl-success no-print" role="status">
                {aviso}
              </p>
            )}
            {f.pagada ? (
              <div className="sl-note no-print">
                <LockKeyhole size={16} /> Factura pagada. Se conserva en el historial y no se puede editar.
              </div>
            ) : (
              f.editable && (
                <p className="sl-note">
                  Pendiente de pago. Puedes editar los datos de facturación hasta que caja registre el pago.
                </p>
              )
            )}
            <h3>Consumo facturado</h3>
            <LineasFactura items={f.items} />
            <ImportesFactura
              subtotal={
                f.total == null
                  ? null
                  : Number(f.total) - Number(f.IVA) - Number(f.Propina) + Number(f.Descuento)
              }
              iva={f.IVA == null ? null : Number(f.IVA)}
              propina={Number(f.Propina)}
              descuento={Number(f.Descuento)}
              total={f.total == null ? null : Number(f.total)}
            />
            <p className="sl-fineprint">
              Pago:{' '}
              {f.pago
                .filter((p) => p.estado === 'APROBADO')
                .map((p) => p.metodo?.replace(/_/g, ' ').toLowerCase() || 'Método no informado')
                .join(', ') || 'Sin pago aprobado'}
            </p>
          </>
        )}
      </div>
      <div className="sl-dialog-actions no-print">
        <button className="sl-btn" onClick={cerrar}>
          Cerrar
        </button>
        {f && !error && (
          <>
            <button className="sl-btn" onClick={() => window.print()}>
              <Printer size={15} /> Imprimir factura
            </button>
            {f.editable && (
              <button
                className="sl-btn primary"
                onClick={() => {
                  setAviso('')
                  setOriginal(f)
                }}
              >
                <Pencil size={15} /> Editar factura
              </button>
            )}
          </>
        )}
      </div>
    </Dialogo>
  )
}

type Props = { pedidos: Pedido[] | null; tasa: number; errorSalon: string; cargarSalon: () => Promise<void> }
export default function Facturas({ pedidos, tasa, errorSalon, cargarSalon }: Props) {
  const { data, error, cargar, cargando } = useConsulta<{ data: Factura[] }>('/facturas', 15000)
  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState('')
  const [params, cambiar] = useSearchParams()
  const id = Number(params.get('factura')) || null
  const abrir = (otro: Record<string, string> = {}) =>
    cambiar({ vista: 'facturas', ...otro }, { replace: true })
  const refrescar = async () => {
    await Promise.all([cargar(), cargarSalon()])
  }
  const visibles =
    data?.data.filter(
      (f) =>
        (!estado || estadoFactura(f) === estado) &&
        normalizar(
          `${numeroFactura(f)} Mesa ${mesaN(f.pedido.Mesa_num)} Mesa ${f.pedido.Mesa_num} #${f.id_pedido} ${f.receptor ?? ''}`,
        ).includes(normalizar(buscar)),
    ) ?? []
  return (
    <section className="sl-panel">
      <div className="sl-panel-head fc-cabecera">
        <div>
          <div className="sl-title-icon">
            <FileText size={20} />
            <h2>Facturas de mis mesas</h2>
          </div>
          <p className="sl-fineprint">Genera facturas para caja y consulta el historial de pagos.</p>
        </div>
        <div className="fc-acciones">
          <button
            className="sl-iconbtn"
            aria-label="Actualizar facturas"
            disabled={cargando}
            onClick={refrescar}
          >
            <RefreshCw size={16} />
          </button>
          <button className="sl-btn primary" onClick={() => abrir({ generar: '1' })}>
            <FilePlus2 size={16} /> Generar factura
          </button>
        </div>
      </div>
      <div className="sl-tools">
        <Buscador valor={buscar} cambiar={setBuscar} titulo="Buscar factura, pedido o mesa" />
        <select aria-label="Estado de factura" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente de pago</option>
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
          Aquí verás las facturas de tus mesas. Revisa también los filtros.
        </Vacio>
      ) : (
        <div className="sl-list">
          {visibles.map((f) => (
            <button
              key={f.id_factura}
              className="sl-order-row"
              onClick={() => abrir({ factura: String(f.id_factura) })}
            >
              <span className="sl-tile-num">
                <FileText size={19} />
              </span>
              <span className="sl-row-body">
                <strong>{numeroFactura(f)}</strong>
                <small>
                  Mesa {mesaN(f.pedido.Mesa_num)} · {fechaFactura(f.Fecha_emision)}
                </small>
              </span>
              <Estado valor={estadoFactura(f)} />
              <b>{f.total == null ? '—' : formatCOP(Number(f.total))}</b>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      )}
      {id ? (
        <Comprobante key={id} id={id} cerrar={() => abrir()} actualizar={refrescar} />
      ) : (
        params.has('generar') && (
          <EditorFactura
            modo="nueva"
            pedidos={pedidos}
            inicial={Number(params.get('pedido')) || null}
            tasa={tasa}
            bloqueo={errorSalon}
            refrescar={refrescar}
            cerrar={() => abrir()}
            guardada={async (id) => {
              abrir({ factura: String(id) })
              await refrescar()
            }}
          />
        )
      )}
    </section>
  )
}
