import { useState, type FormEvent } from 'react'
import { Armchair, CheckCheck, Plus, UsersRound } from 'lucide-react'
import api from '../../../api/axios'
import { Dialogo, ErrorCarga } from '../Elementos'
import ModalMesa, { ConsumoPedido } from './ModalMesa'
import { mensajeError, mesaN, type Editor, type Mesa, type Pedido } from '../modelo'
import CuentaMesa from '../Pedidos/CuentaMesa'

type Props = {
  mesa: Mesa
  sede: string
  pedidos: Pedido[]
  pedidoId?: number
  seleccionar: (id?: number) => void
  editar: (e: Editor) => void
  cerrar: () => void
  aviso: string
  avisar: (s: string) => void
  errorLectura: string
  actualizar: () => Promise<void>
}

export default function FichaMesa({
  mesa,
  sede,
  pedidos,
  pedidoId,
  seleccionar,
  editar,
  cerrar,
  aviso,
  avisar,
  errorLectura,
  actualizar,
}: Props) {
  const [personas, setPersonas] = useState(1)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const ajena = mesa.ocupada && !mesa.atencion && !mesa.cuentas.length
  const seleccion = pedidos.find((p) => p.id_pedido === pedidoId)
  const bloqueado = procesando || !!errorLectura

  async function cambiarEstado(e: FormEvent) {
    e.preventDefault()
    if (bloqueado || mesa.cuentas.length || ajena) return
    const liberar = Boolean(mesa.atencion)
    setProcesando(true)
    setError('')
    avisar('')
    try {
      await api.patch(
        `/salon/mesas/${mesa.numero}/estado`,
        liberar
          ? { estado: 'DISPONIBLE', id_atencion: mesa.atencion!.id_atencion }
          : { estado: 'OCUPADA', comensales: personas },
        { timeout: 20000 },
      )
      avisar(liberar ? 'Mesa liberada.' : 'Mesa ocupada. Ya puedes tomar el pedido.')
      if (liberar) setPersonas(1)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      await actualizar()
      setProcesando(false)
    }
  }

  const cerrarFicha = () => {
    if (!procesando) cerrar()
  }
  const cuenta = (p: Pedido) => (
    <CuentaMesa
      key={p.id_pedido}
      pedido={p}
      editar={editar}
      avisar={avisar}
      actualizar={actualizar}
      ocupado={bloqueado}
      setOcupado={setProcesando}
    />
  )
  const mensajes = (
    <>
      {aviso && (
        <p className="sl-success no-print" role="status">
          <CheckCheck size={16} />
          {aviso}
        </p>
      )}
      {errorLectura && <ErrorCarga texto={errorLectura} reintentar={actualizar} />}
      {error && <ErrorCarga texto={error} />}
    </>
  )
  // Desde una tarjeta siempre se muestran TODOS los pedidos juntos. Gestionar una
  // cuenta concreta es una acción posterior y solo está disponible para el titular.
  if (mesa.cuentas.length > 1 && seleccion)
    return (
      <Dialogo
        titulo={`Pedido #${seleccion.id_pedido}`}
        kicker={`Mesa ${mesaN(mesa.numero)} / ${sede}`}
        onClose={cerrarFicha}
      >
        <div className="sl-detail no-print">
          <button className="sl-btn" disabled={procesando} onClick={() => seleccionar()}>
            Volver a todos los pedidos de la mesa
          </button>
          {mensajes}
        </div>
        {cuenta(seleccion)}
      </Dialogo>
    )
  return (
    <ModalMesa
      mesa={mesa}
      sede={sede}
      cerrar={cerrarFicha}
      aviso={mensajes}
      renderPedido={(orden) => {
        const propio = pedidos.find((p) => p.id_pedido === orden.id_pedido)
        if (!propio) return undefined
        return mesa.cuentas.length === 1 ? (
          cuenta(propio)
        ) : (
          <>
            <ConsumoPedido pedido={orden} />
            <button
              className="sl-btn mm-gestionar"
              disabled={bloqueado}
              onClick={() => seleccionar(propio.id_pedido)}
            >
              Gestionar pedido #{propio.id_pedido}
            </button>
          </>
        )
      }}
      accionesSinPedido={
        ajena ? (
          <p className="sl-detail">Esta mesa la atiende {mesa.mesero || 'otro mesero'}.</p>
        ) : (
          <form className="mesa-ficha-acciones" onSubmit={cambiarEstado}>
            {!mesa.ocupada && (
              <label className="sl-field">
                Comensales a sentar
                <input
                  type="number"
                  min={1}
                  max={mesa.capacidad ?? 99}
                  required
                  value={personas || ''}
                  disabled={bloqueado}
                  onChange={(e) => setPersonas(+e.target.value)}
                />
              </label>
            )}
            <button type="submit" disabled={bloqueado} className={`sl-btn ${mesa.ocupada ? '' : 'primary'}`}>
              {mesa.ocupada ? <Armchair size={16} /> : <UsersRound size={16} />}
              {procesando ? 'Guardando…' : mesa.ocupada ? 'Liberar mesa' : 'Ocupar mesa'}
            </button>
            <button
              type="button"
              className={`sl-btn ${mesa.ocupada ? 'primary' : ''}`}
              disabled={bloqueado}
              onClick={(e) => {
                if (e.currentTarget.form?.reportValidity())
                  editar({
                    modo: 'nuevo',
                    mesa: mesa.numero,
                    comensales: mesa.atencion?.comensales ?? personas,
                  })
              }}
            >
              <Plus size={16} />
              Tomar pedido
            </button>
          </form>
        )
      }
    />
  )
}
