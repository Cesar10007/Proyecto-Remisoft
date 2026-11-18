import { useRef, useState, type FormEvent } from 'react'
import { Check, ChefHat, Minus, Plus, Send, ShoppingBasket, Trash2, Utensils } from 'lucide-react'
import api from '../../../api/axios'
import { Buscador, Dialogo, ErrorCarga, Totales, Vacio } from '../Elementos'
import {
  editable,
  admitePedido,
  mensajeError,
  mesaN,
  normalizar,
  type Carta,
  type Editor,
  type Producto,
  type Salon,
} from '../modelo'
import { useConsulta } from '../useConsulta'
import { formatCOP, ivaEnCentavos } from '../utils'

type Linea = {
  clave: number
  id_detalle?: number
  id_producto: number
  nombre: string
  precio: number
  cantidad: number
  nota: string
}
export default function EditorComanda({
  editor,
  salon,
  cerrar,
  guardado,
  actualizar,
}: {
  editor: Editor
  salon: Salon
  cerrar: () => void
  guardado: (id: number, mesa: number, mensaje: string) => void
  actualizar: () => Promise<void>
}) {
  const { modo, pedido } = editor
  const { data: carta, cargando, error: errorCarta, cargar } = useConsulta<Carta>('/salon/carta')
  const [mesa, setMesa] = useState(editor.mesa ?? salon.mesas.find(admitePedido)?.numero ?? 0)
  const mesaActual = salon.mesas.find((m) => m.numero === mesa)
  const [idAtencion, setIdAtencion] = useState(mesaActual?.atencion?.id_atencion ?? null)
  const [personas, setPersonas] = useState(
    pedido?.comensales ?? editor.comensales ?? mesaActual?.atencion?.comensales ?? 1,
  )
  const [cliente, setCliente] = useState(pedido?.id_cliente ?? '')
  const [notas, setNotas] = useState(pedido?.notas ?? '')
  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState('')
  const [lineas, setLineas] = useState<Linea[]>(() =>
    modo === 'editar' && pedido
      ? pedido.items.map((i) => ({
          clave: i.id_detalle,
          id_detalle: i.id_detalle,
          id_producto: i.id_producto,
          nombre: i.nombre,
          precio: i.precio_unitario,
          cantidad: i.cantidad,
          nota: i.nota,
        }))
      : [],
  )
  const clave = useRef(0)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  const [sucio, setSucio] = useState(false)
  const [descartar, setDescartar] = useState(false)
  const actual = salon.pedidos.find((p) => p.id_pedido === pedido?.id_pedido)
  const conflicto =
    modo === 'nuevo'
      ? !mesaActual || !admitePedido(mesaActual) || (mesaActual.atencion?.id_atencion ?? null) !== idAtencion
      : !actual ||
        actual.pago_registrado ||
        actual.version !== pedido?.version ||
        actual.estado === 'POR_COBRAR' ||
        (modo === 'editar' && !editable(actual))
  const centavos = lineas.reduce((s, l) => s + Math.round(l.precio * 100) * l.cantidad, 0)
  const subtotal = centavos / 100
  const iva = ivaEnCentavos(centavos, salon.tasa_iva) / 100
  const categorias = [...new Set(carta?.productos.map((p) => p.categoria))].sort()
  const productos =
    carta?.productos.filter(
      (p) =>
        (!categoria || p.categoria === categoria) &&
        normalizar(`${p.nombre} ${p.descripcion ?? ''}`).includes(normalizar(buscar)),
    ) ?? []
  const titulo = modo === 'nuevo' ? 'Nuevo pedido' : modo === 'ronda' ? 'Añadir ronda' : 'Editar comanda'
  function agregar(p: Producto) {
    // Un mismo producto con indicaciones diferentes conserva renglones distintos.
    const previa = lineas.find((l) => l.id_producto === p.id && !l.nota && l.cantidad < 99)
    if (previa) cambiar(previa.clave, { cantidad: previa.cantidad + 1 })
    else {
      const nueva = {
        clave: --clave.current,
        id_producto: p.id,
        nombre: p.nombre,
        precio: p.precio,
        cantidad: 1,
        nota: '',
      }
      setLineas((ls) => [...ls, nueva])
    }
    setSucio(true)
  }
  function cambiar(k: number, datos: Partial<Pick<Linea, 'nota' | 'cantidad'>>) {
    setSucio(true)
    setLineas((ls) => ls.map((l) => (l.clave === k ? { ...l, ...datos } : l)))
  }
  function salir() {
    if (!ocupado) {
      if (sucio) setDescartar(true)
      else cerrar()
    }
  }
  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (ocupado || conflicto || !lineas.length) return
    setOcupado(true)
    setError('')
    const opciones = { timeout: 20000 }
    const items = lineas.map((l) => ({
      id_detalle: l.id_detalle,
      id_producto: l.id_producto,
      cantidad: l.cantidad,
      nota: l.nota,
    }))
    const datos = {
      items,
      mesa,
      id_atencion: modo === 'nuevo' ? idAtencion : undefined,
      id_cliente: cliente ? Number(cliente) : null,
      notas,
      comensales: personas,
      version: pedido?.version,
    }
    try {
      const { data } =
        modo === 'nuevo'
          ? await api.post('/salon/pedidos', datos, opciones)
          : modo === 'editar'
            ? await api.put(`/salon/pedidos/${pedido!.id_pedido}`, datos, opciones)
            : await api.post(
                `/salon/pedidos/${pedido!.id_pedido}/rondas`,
                {
                  items,
                  version: pedido!.version,
                },
                opciones,
              )
      await actualizar()
      guardado(
        data.id_pedido,
        mesa,
        modo === 'editar'
          ? 'Comanda actualizada en cocina.'
          : `Comanda enviada a cocina · Mesa ${mesaN(mesa)}.`,
      )
    } catch (err) {
      setError(mensajeError(err))
      await actualizar()
      setOcupado(false)
    }
  }
  return (
    <Dialogo
      titulo={titulo}
      kicker={
        pedido ? `Mesa ${mesaN(mesa)} / Pedido #${pedido.id_pedido}` : 'Servicio de salón / Apertura de mesa'
      }
      onClose={salir}
      amplio
    >
      <form onSubmit={enviar} className="sl-order-form">
        <fieldset disabled={ocupado || descartar}>
          {modo !== 'ronda' && (
            <div className="sl-order-fields">
              <label>
                Mesa
                <select
                  aria-label="Mesa"
                  value={mesa}
                  disabled={editor.mesa !== null}
                  onChange={(e) => {
                    setMesa(+e.target.value)
                    const atencion = salon.mesas.find((m) => m.numero === +e.target.value)?.atencion
                    setPersonas(atencion?.comensales ?? 1)
                    setIdAtencion(atencion?.id_atencion ?? null)
                    setSucio(true)
                  }}
                >
                  {salon.mesas
                    .filter((m) => admitePedido(m) || m.numero === mesa)
                    .map((m) => (
                      <option key={m.numero} value={m.numero}>
                        Mesa {mesaN(m.numero)}
                        {m.capacidad ? ` · ${m.capacidad} puestos` : ''}
                        {m.atencion ? ' · En atención' : ''}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Comensales
                <input
                  type="number"
                  min="1"
                  max={mesaActual?.capacidad ?? 99}
                  required
                  value={personas || ''}
                  onChange={(e) => {
                    setPersonas(+e.target.value)
                    setSucio(true)
                  }}
                />
              </label>
              <label>
                Cliente
                <select
                  aria-label="Cliente"
                  value={cliente}
                  onChange={(e) => {
                    setCliente(e.target.value)
                    setSucio(true)
                  }}
                >
                  <option value="">Consumidor final</option>
                  {carta?.clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {modo === 'ronda' && (
            <p className="sl-note">
              Los platos de esta ronda se sumarán a la misma cuenta. Los anteriores no se modifican.
            </p>
          )}
          <div className="sl-editor-grid">
            <section className="sl-catalog">
              <div className="sl-title-icon">
                <Utensils size={18} />
                <h3>Carta del restaurante</h3>
              </div>
              <Buscador valor={buscar} cambiar={setBuscar} titulo="Buscar un plato…" />
              <select
                aria-label="Categoría de la carta"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {errorCarta ? (
                <ErrorCarga texto={errorCarta} reintentar={cargar} />
              ) : cargando && !carta ? (
                <p role="status">Cargando carta…</p>
              ) : !productos.length ? (
                <Vacio titulo="Sin platos disponibles">Prueba con otra categoría o búsqueda.</Vacio>
              ) : (
                <div className="sl-menu-items">
                  {productos.map((p) => (
                    <button
                      type="button"
                      className="sl-menu-item"
                      key={p.id}
                      onClick={() => agregar(p)}
                      aria-label={`Agregar ${p.nombre}`}
                    >
                      <span>
                        <small>{p.categoria}</small>
                        <strong>{p.nombre}</strong>
                        <span>{p.descripcion}</span>
                        <b>{formatCOP(p.precio)}</b>
                      </span>
                      <i>
                        <Plus size={17} />
                      </i>
                    </button>
                  ))}
                </div>
              )}
            </section>
            <section className="sl-basket">
              <div className="sl-title-icon">
                <ShoppingBasket size={18} />
                <h3>{modo === 'ronda' ? 'Nueva ronda' : 'Comanda'}</h3>
                <span className="sl-counter">{lineas.reduce((s, l) => s + l.cantidad, 0)}</span>
              </div>
              {!lineas.length && (
                <Vacio titulo="La comanda está vacía">Agrega al menos un plato de la carta.</Vacio>
              )}
              <div className="sl-basket-lines">
                {lineas.map((l) => (
                  <div className="sl-basket-line" key={l.clave}>
                    <div className="sl-line-head">
                      <strong>{l.nombre}</strong>
                      <button
                        type="button"
                        className="sl-iconbtn"
                        aria-label={`Quitar ${l.nombre}`}
                        onClick={() => {
                          setLineas((ls) => ls.filter((x) => x.clave !== l.clave))
                          setSucio(true)
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="sl-line-head">
                      <div className="sl-stepper">
                        <button
                          type="button"
                          aria-label={`Restar ${l.nombre}`}
                          disabled={l.cantidad <= 1}
                          onClick={() => cambiar(l.clave, { cantidad: l.cantidad - 1 })}
                        >
                          <Minus size={13} />
                        </button>
                        <span>{l.cantidad}</span>
                        <button
                          type="button"
                          aria-label={`Sumar ${l.nombre}`}
                          disabled={l.cantidad >= 99}
                          onClick={() => cambiar(l.clave, { cantidad: l.cantidad + 1 })}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <b>{formatCOP(l.precio * l.cantidad)}</b>
                    </div>
                    <input
                      className="sl-item-note"
                      aria-label={`Indicaciones para ${l.nombre}`}
                      placeholder="Indicación para este plato (opcional)"
                      maxLength={200}
                      value={l.nota}
                      onChange={(e) => cambiar(l.clave, { nota: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              {modo !== 'ronda' && (
                <label className="sl-field">
                  <span>
                    <ChefHat size={14} /> Nota general para cocina
                  </span>
                  <textarea
                    maxLength={500}
                    rows={2}
                    placeholder="Ej.: servir las entradas primero"
                    value={notas}
                    onChange={(e) => {
                      setNotas(e.target.value)
                      setSucio(true)
                    }}
                  />
                </label>
              )}
              <Totales subtotal={subtotal} iva={iva} total={subtotal + iva} />
            </section>
          </div>
        </fieldset>
        {conflicto && (
          <ErrorCarga
            texto={
              modo === 'nuevo'
                ? 'La ocupación de la mesa cambió. Vuelve a su ficha antes de confirmar.'
                : 'La cuenta cambió. Cierra este editor y vuelve a abrir el pedido.'
            }
          />
        )}
        {error && <ErrorCarga texto={error} />}
        {descartar ? (
          <div className="sl-confirm">
            <strong>¿Descartar los cambios sin enviar?</strong>
            <button type="button" className="sl-btn" onClick={() => setDescartar(false)}>
              Seguir editando
            </button>
            <button type="button" className="sl-btn danger" onClick={cerrar}>
              Descartar
            </button>
          </div>
        ) : (
          <div className="sl-dialog-actions">
            <button type="button" className="sl-btn" onClick={salir} disabled={ocupado}>
              Volver
            </button>
            <button
              className="sl-btn primary"
              type="submit"
              disabled={ocupado || !lineas.length || conflicto || !carta}
            >
              {modo === 'editar' ? <Check size={16} /> : <Send size={16} />}
              {ocupado
                ? 'Guardando…'
                : modo === 'editar'
                  ? 'Guardar cambios'
                  : modo === 'ronda'
                    ? 'Enviar ronda'
                    : 'Enviar a cocina'}
            </button>
          </div>
        )}
      </form>
    </Dialogo>
  )
}
