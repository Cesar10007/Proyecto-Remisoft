import { useState } from 'react'
import { Banknote, CheckCheck, Pencil, Plus, Printer, ReceiptText, Send, Trash2 } from 'lucide-react'
import api from '../../../api/axios'
import { ErrorCarga } from '../Elementos'
import { editable, entregado, mensajeError, type Editor, type Pedido } from '../modelo'
import { formatCOP } from '../utils'
import { ConsumoPedido } from '../Mesas/ModalMesa'

export default function CuentaMesa({
  pedido: p,
  editar,
  facturar,
  ocupado,
  setOcupado,
  actualizar,
  avisar,
}: {
  pedido: Pedido
  editar: (e: Editor) => void
  facturar: (p: Pedido) => void
  ocupado: boolean
  setOcupado: (v: boolean) => void
  actualizar: () => Promise<void>
  avisar: (s: string) => void
}) {
  const [confirmar, setConfirmar] = useState<{ accion: 'cuenta' | 'cancelar'; version: number } | null>(null)
  const [error, setError] = useState('')
  const enCaja = p.estado === 'POR_COBRAR'
  const cambioDuranteConfirmacion =
    confirmar &&
    (confirmar.version !== p.version ||
      p.pago_registrado ||
      (confirmar.accion === 'cancelar' ? !editable(p) : !entregado(p) || enCaja))
  async function operar(accion: 'cuenta' | 'cancelar' | 'servir', id?: number) {
    if (ocupado) return
    setError('')
    setOcupado(true)
    try {
      const url = `/salon/pedidos/${p.id_pedido}`
      if (accion === 'servir')
        await api.patch(`/cocina/items/${id}/avanzar`, { estado_item: 'ENTREGADO' }, { timeout: 20000 })
      else if (accion === 'cuenta')
        await api.post(`${url}/cuenta`, { version: confirmar?.version }, { timeout: 20000 })
      else await api.delete(url, { data: { version: confirmar?.version }, timeout: 20000 })
      avisar(
        accion === 'cuenta'
          ? 'Cuenta enviada a caja. La mesa se libera al cerrar su última cuenta.'
          : accion === 'servir'
            ? 'Entrega registrada.'
            : `Pedido #${p.id_pedido} cancelado.`,
      )
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setConfirmar(null)
      await actualizar()
      setOcupado(false)
    }
  }
  return (
    <>
      <ConsumoPedido
        pedido={p}
        cliente={p.cliente || 'Consumidor final'}
        accionPlato={(i) =>
          i.estado === 'LISTO' &&
          !enCaja &&
          !p.pago_registrado && (
            <button
              className="sl-btn tiny green no-print"
              disabled={ocupado}
              onClick={() => operar('servir', i.id_detalle)}
            >
              <CheckCheck size={15} /> Marcar servido
            </button>
          )
        }
      />
      {p.pago_registrado && (
        <p className="sl-note">
          Esta cuenta ya registra un pago. Solicita a caja que revise su cierre; no vuelvas a cobrarla.
        </p>
      )}
      {enCaja && !p.pago_registrado && (
        <div className="sl-note">
          <Banknote size={16} /> Cuenta en caja. La mesa sigue ocupada hasta cerrar su última cuenta.{' '}
          {p.total_factura_pendiente != null &&
            `Total de la factura: ${formatCOP(p.total_factura_pendiente)}.`}
        </div>
      )}
      {error && <ErrorCarga texto={error} />}
      {confirmar ? (
        <div className="sl-confirm no-print">
          <strong>
            {confirmar.accion === 'cuenta'
              ? `¿Enviar ${formatCOP(p.total)} a caja?`
              : `¿Cancelar el pedido #${p.id_pedido}?`}
          </strong>
          <p>
            {confirmar.accion === 'cuenta'
              ? 'No se podrán añadir más platos.'
              : 'Se devolverán al inventario los ingredientes descontados.'}
          </p>
          {cambioDuranteConfirmacion && (
            <ErrorCarga texto="La comanda cambió. Vuelve a revisar la precuenta antes de confirmar." />
          )}
          <button className="sl-btn" disabled={ocupado} onClick={() => setConfirmar(null)}>
            Volver
          </button>
          <button
            className={`sl-btn ${confirmar.accion === 'cuenta' ? 'primary' : 'danger'}`}
            disabled={ocupado || !!cambioDuranteConfirmacion}
            onClick={() => operar(confirmar.accion)}
          >
            {ocupado ? 'Procesando…' : 'Confirmar'}
          </button>
        </div>
      ) : (
        <div className="sl-dialog-actions no-print">
          <button className="sl-btn" disabled={ocupado} onClick={() => window.print()}>
            <Printer size={15} /> Precuenta
          </button>
          {enCaja && !p.pago_registrado && (
            <button className="sl-btn primary" disabled={ocupado} onClick={() => facturar(p)}>
              <ReceiptText size={16} /> {p.id_factura == null ? 'Generar factura' : 'Ver factura'}
            </button>
          )}
          {editable(p) && (
            <button
              className="sl-btn danger"
              disabled={ocupado}
              onClick={() => setConfirmar({ accion: 'cancelar', version: p.version })}
            >
              <Trash2 size={15} /> Cancelar pedido
            </button>
          )}
          {!enCaja && !p.pago_registrado && (
            <button
              className="sl-btn"
              disabled={ocupado}
              onClick={() => editar({ modo: editable(p) ? 'editar' : 'ronda', mesa: p.mesa, pedido: p })}
            >
              {editable(p) ? <Pencil size={15} /> : <Plus size={15} />}
              {editable(p) ? 'Editar comanda' : 'Añadir ronda'}
            </button>
          )}
          {!enCaja && !p.pago_registrado && entregado(p) && (
            <button
              className="sl-btn primary"
              disabled={ocupado}
              onClick={() => setConfirmar({ accion: 'cuenta', version: p.version })}
            >
              <Send size={15} /> Enviar a caja
            </button>
          )}
        </div>
      )}
    </>
  )
}
