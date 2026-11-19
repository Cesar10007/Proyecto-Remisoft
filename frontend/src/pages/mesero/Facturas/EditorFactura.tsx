import { useState, type FormEvent } from 'react'
import { ReceiptText, Save } from 'lucide-react'
import api from '../../../api/axios'
import { Dialogo, ErrorCarga } from '../Elementos'
import { mensajeError, mesaN, type Pedido } from '../modelo'
import { formatCOP, ivaEnCentavos } from '../utils'
import { numeroFactura, type DetalleFactura, type ItemFactura } from './factura'
import { ImportesFactura, LineasFactura } from './ResumenFactura'

type Props = {
  cerrar: () => void
  guardada: (id: number) => Promise<void>
  refrescar: () => Promise<void>
  bloqueo: string
} & (
  | { modo: 'nueva'; pedidos: Pedido[] | null; inicial: number | null; tasa: number }
  | { modo: 'editar'; factura: DetalleFactura }
)

// Al cambiar de pedido se crea un formulario nuevo; el sondeo del salón nunca pisa los campos escritos.
export default function EditorFactura(props: Props) {
  const [id, setId] = useState(props.modo === 'nueva' ? props.inicial : null)
  const [enviando, setEnviando] = useState(false)
  const opciones =
    props.modo === 'nueva'
      ? props.pedidos?.filter((p) => p.estado === 'POR_COBRAR' && p.id_factura == null && !p.pago_registrado)
      : null
  const p = opciones?.find((p) => p.id_pedido === id)
  const f = props.modo === 'editar' ? props.factura : null
  const items = f?.items ?? p?.items
  return (
    <Dialogo
      titulo={f ? 'Editar factura' : 'Generar factura'}
      kicker={f ? `${numeroFactura(f)} / Pendiente de pago` : 'Facturación / Mis mesas'}
      onClose={() => {
        if (!enviando) props.cerrar()
      }}
    >
      <div className="sl-detail">
        {props.modo === 'nueva' && (
          <>
            <p>Elige una cuenta enviada a caja. Generar la factura no registra un pago ni libera la mesa.</p>
            {props.bloqueo ? (
              <ErrorCarga texto={props.bloqueo} reintentar={props.refrescar} />
            ) : !opciones ? (
              <p role="status">Cargando pedidos…</p>
            ) : opciones.length ? (
              <label className="sl-field">
                Pedido a facturar
                <select
                  aria-description="Elige una cuenta enviada a caja que aún no tenga factura."
                  value={id ?? ''}
                  onChange={(e) => setId(Number(e.target.value) || null)}
                  disabled={enviando}
                >
                  <option value="">Selecciona un pedido</option>
                  {opciones.map((o) => (
                    <option key={o.id_pedido} value={o.id_pedido}>
                      Mesa {mesaN(o.mesa)} · Pedido #{o.id_pedido} · {formatCOP(o.total)}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="sl-note">
                No tienes cuentas por facturar. Desde la mesa, entrega los platos y pulsa «Enviar a caja». Si
                ya generaste la factura, ábrela en el historial.
              </div>
            )}
          </>
        )}
        {f && (
          <p>
            Mesa {mesaN(f.pedido.Mesa_num)} · Pedido #{f.id_pedido}. Los artículos y precios se conservan tal
            como se facturaron.
          </p>
        )}
        {items && (
          <Formulario
            key={f?.id_factura ?? p!.id_pedido}
            items={items}
            receptor={f?.receptor ?? p?.cliente ?? ''}
            descuento={Number(f?.Descuento ?? 0)}
            propina={Number(f?.Propina ?? 0)}
            tasa={props.modo === 'editar' ? Number(props.factura.tasa_iva) : props.tasa}
            enviando={enviando}
            bloqueo={props.bloqueo}
            edicion={!!f}
            cancelar={props.cerrar}
            guardar={async (campos) => {
              setEnviando(true)
              try {
                const respuesta = f
                  ? await api.put(
                      `/facturas/${f.id_factura}`,
                      { ...campos, version_edicion: f.version_edicion },
                      { timeout: 20000 },
                    )
                  : await api.post('/facturas', { ...campos, id_pedido: p!.id_pedido }, { timeout: 20000 })
                await props.guardada(respuesta.data.data.id_factura)
              } catch (err) {
                await props.refrescar()
                throw err
              } finally {
                setEnviando(false)
              }
            }}
          />
        )}
      </div>
      {!items && (
        <div className="sl-dialog-actions">
          <button aria-description="Regresa al historial de facturas." className="sl-btn" onClick={props.cerrar}>
            Volver al historial
          </button>
        </div>
      )}
    </Dialogo>
  )
}
type Campos = { receptor: string; descuento: number; propina: number }
function Formulario(
  props: Campos & {
    items: ItemFactura[]
    tasa: number
    enviando: boolean
    bloqueo: string
    edicion: boolean
    cancelar: () => void
    guardar: (datos: Campos) => Promise<void>
  },
) {
  const [nombre, setNombre] = useState(props.receptor)
  const [desc, setDesc] = useState(String(props.descuento))
  const [tip, setTip] = useState(String(props.propina))
  const [error, setError] = useState('')
  const subtotalCent = props.items.reduce((s, i) => s + Math.round(i.precio_unitario * 100) * i.cantidad, 0)
  const d = Math.round(Number(desc) * 100),
    p = Math.round(Number(tip) * 100)
  const valido = [desc, tip].every((v) => /^\d+(\.\d{1,2})?$/.test(v)) && d <= subtotalCent
  const iva = valido ? ivaEnCentavos(subtotalCent - d, props.tasa) : 0
  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (props.enviando || props.bloqueo || !valido) return
    setError('')
    try {
      await props.guardar({ receptor: nombre.trim(), descuento: d / 100, propina: p / 100 })
    } catch (err) {
      setError(mensajeError(err))
    }
  }
  return (
    <form aria-description="Revisa a nombre de quién se factura y los importes finales." className="fc-form" onSubmit={enviar}>
      <fieldset disabled={props.enviando || !!props.bloqueo}>
        <label className="sl-field">
          A nombre de
          <input
            aria-description="Indica el nombre que debe aparecer en la factura."
            maxLength={120}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Consumidor final"
          />
        </label>
        <div className="fc-ajustes">
          <label className="sl-field">
            Descuento antes de IVA (COP)
            <input
              aria-description="Indica en pesos el descuento que se aplica antes del impuesto."
              type="number"
              required
              min="0"
              max={subtotalCent / 100}
              step="0.01"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </label>
          <label className="sl-field">
            Propina voluntaria (COP)
            <input
              aria-description="Indica en pesos la propina que desea dejar el cliente."
              type="number"
              required
              min="0"
              max="99999999.99"
              step="0.01"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
            />
          </label>
        </div>
      </fieldset>
      <LineasFactura items={props.items} />
      <ImportesFactura
        subtotal={subtotalCent / 100}
        iva={valido ? iva / 100 : null}
        descuento={d / 100}
        propina={p / 100}
        total={valido ? (subtotalCent - d + iva + p) / 100 : null}
      />
      {d > subtotalCent && <ErrorCarga texto="El descuento no puede superar el subtotal." />}
      {props.bloqueo && <ErrorCarga texto={props.bloqueo} />}
      {error && <ErrorCarga texto={error} />}
      <div className="fc-acciones">
        <button aria-description="Cierra el formulario sin guardar la factura." className="sl-btn" type="button" disabled={props.enviando} onClick={props.cancelar}>
          Cancelar
        </button>
        <button
          aria-description={props.edicion ? 'Guarda los cambios de la factura pendiente.' : 'Genera la factura sin registrar un pago.'}
          className="sl-btn primary"
          type="submit"
          disabled={!valido || props.enviando || !!props.bloqueo}
        >
          {props.edicion ? <Save size={16} /> : <ReceiptText size={16} />}{' '}
          {props.enviando ? 'Guardando…' : props.edicion ? 'Guardar cambios' : 'Guardar factura'}
        </button>
      </div>
    </form>
  )
}
