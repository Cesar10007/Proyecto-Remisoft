import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import type { RootState } from '../../store/store'
import { tiempoTranscurrido } from '../../utils/tiempo'
import './Cajero.css'
import ThemeToggle from '../../components/common/ThemeToggle'

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'

interface ItemCuenta {
  id_detalle: number
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface Cuenta {
  id_pedido: number
  estado: string
  mesa: number | null
  tipo_pedido: string
  fecha_hora: string
  nombre_mesero: string | null
  items: ItemCuenta[]
  subtotal: number
  iva: number
  total: number
}

interface FacturaEmitida {
  id_factura: number
  consecutivo: string
  mesa: number | null
  subtotal: number
  iva: number
  total: number
  metodo: MetodoPago
  monto_recibido: number
  cambio: number
  items: { nombre: string; cantidad: number; precio_unitario: number }[]
  fecha_emision: string
}

const METODOS: { id: MetodoPago; label: string; icon: string }[] = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: 'payments' },
  { id: 'TARJETA', label: 'Tarjeta', icon: 'credit_card' },
  { id: 'TRANSFERENCIA', label: 'Transferencia', icon: 'account_balance' },
]

const formatoCOP = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor)

function mensajeError(err: unknown, fallback: string) {
  const respuesta = (err as { response?: { data?: { message?: string } } })?.response?.data
  return respuesta?.message ?? fallback
}

export default function Cajero() {
  const usuario = useSelector((state: RootState) => state.auth.user)
  const rol = useSelector((state: RootState) => state.auth.rol)

  const [cuentas, setCuentas] = useState<Cuenta[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seleccionada, setSeleccionada] = useState<number | null>(null)
  const [metodo, setMetodo] = useState<MetodoPago | null>(null)
  const [montoRecibido, setMontoRecibido] = useState('')
  const [referencia, setReferencia] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorCobro, setErrorCobro] = useState<string | null>(null)
  const [factura, setFactura] = useState<FacturaEmitida | null>(null)

  const cuenta = useMemo(
    () => cuentas.find((c) => c.id_pedido === seleccionada) ?? null,
    [cuentas, seleccionada],
  )

  const cargarCuentas = useCallback(async () => {
    try {
      const { data } = await api.get<Cuenta[]>('/cobro/pendientes')
      setCuentas(data)
      setError(null)
      setSeleccionada((actual) =>
        actual && data.some((c) => c.id_pedido === actual) ? actual : (data[0]?.id_pedido ?? null),
      )
    } catch (err) {
      setError(mensajeError(err, 'No fue posible cargar las cuentas abiertas.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarCuentas()
    const intervalo = setInterval(cargarCuentas, 15000)
    return () => clearInterval(intervalo)
  }, [cargarCuentas])

  // Al cambiar de cuenta se limpia el formulario de cobro.
  useEffect(() => {
    setMetodo(null)
    setMontoRecibido('')
    setReferencia('')
    setErrorCobro(null)
  }, [seleccionada])

  const cambio = useMemo(() => {
    if (!cuenta || metodo !== 'EFECTIVO') return null
    const recibido = Number(montoRecibido)
    if (!montoRecibido || Number.isNaN(recibido)) return null
    return recibido - cuenta.total
  }, [cuenta, metodo, montoRecibido])

  const puedeCobrar = useMemo(() => {
    if (!cuenta || !metodo || enviando) return false
    if (metodo === 'EFECTIVO') return cambio !== null && cambio >= 0
    return true
  }, [cuenta, metodo, enviando, cambio])

  async function cerrarCuenta() {
    if (!cuenta || !metodo) return
    setEnviando(true)
    setErrorCobro(null)
    try {
      const body: Record<string, unknown> = { id_pedido: cuenta.id_pedido, metodo }
      if (metodo === 'EFECTIVO') body.monto_recibido = Number(montoRecibido)
      if (metodo !== 'EFECTIVO' && referencia.trim()) body.referencia = referencia.trim()

      const { data } = await api.post<{ factura: FacturaEmitida }>('/cobro/cerrar-cuenta', body)
      setFactura(data.factura)
      await cargarCuentas()
    } catch (err) {
      setErrorCobro(mensajeError(err, 'No fue posible cerrar la cuenta.'))
    } finally {
      setEnviando(false)
    }
  }

  function nuevaCuenta() {
    setFactura(null)
  }

  return (
    <div className="cajero">
      <ThemeToggle flotante />
      <header className="cajero__header">
        <div>
          <h1>Tablero Cajero</h1>
          <p>
            {usuario ? `${usuario.nombre} · ` : ''}
            {rol ?? ''} · {cuentas.length} cuenta{cuentas.length === 1 ? '' : 's'} abierta{cuentas.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="cajero__header-acciones">
          <button type="button" className="cajero__btn cajero__btn--ghost" onClick={cargarCuentas}>
            <span className="material-symbols-outlined">refresh</span> Actualizar
          </button>
          {(rol === 'GERENTE' || rol === 'SUPERADMIN') && (
            <Link className="cajero__btn cajero__btn--ghost" to="/gerente">Volver al panel</Link>
          )}
        </div>
      </header>

      {error && <div className="cajero__alerta cajero__alerta--error">{error}</div>}

      <div className="cajero__layout">
        <aside className="cajero__lista" aria-label="Cuentas abiertas">
          {cargando && <p className="cajero__vacio">Cargando cuentas…</p>}

          {!cargando && cuentas.length === 0 && (
            <div className="cajero__vacio">
              <span className="material-symbols-outlined">task_alt</span>
              <p>No hay cuentas pendientes de cobro.</p>
            </div>
          )}

          {cuentas.map((c) => (
            <button
              key={c.id_pedido}
              type="button"
              className={`cajero__cuenta ${c.id_pedido === seleccionada ? 'cajero__cuenta--activa' : ''}`}
              onClick={() => {
                setFactura(null)
                setSeleccionada(c.id_pedido)
              }}
            >
              <div className="cajero__cuenta-top">
                <strong>{c.mesa ? `Mesa ${c.mesa}` : c.tipo_pedido || 'Pedido'}</strong>
                <span className="cajero__tiempo">{tiempoTranscurrido(c.fecha_hora)}</span>
              </div>
              <div className="cajero__cuenta-sub">
                Pedido #{c.id_pedido} · {c.items.length} ítem{c.items.length === 1 ? '' : 's'}
              </div>
              <div className="cajero__cuenta-total">{formatoCOP(c.total)}</div>
            </button>
          ))}
        </aside>

        <section className="cajero__detalle">
          {factura ? (
            <div className="cajero__factura" id="comprobante">
              <div className="cajero__alerta cajero__alerta--ok no-print">
                Cuenta cerrada. La mesa quedó libre.
              </div>
              <h2>Factura {factura.consecutivo}</h2>
              <p className="cajero__muted">
                {new Date(factura.fecha_emision).toLocaleString('es-CO')}
                {factura.mesa ? ` · Mesa ${factura.mesa}` : ''}
              </p>
              <table className="cajero__tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {factura.items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.nombre}</td>
                      <td>{it.cantidad}</td>
                      <td>{formatoCOP(it.precio_unitario)}</td>
                      <td>{formatoCOP(it.cantidad * it.precio_unitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className="cajero__totales">
                <div><dt>Subtotal</dt><dd>{formatoCOP(factura.subtotal)}</dd></div>
                <div><dt>IVA</dt><dd>{formatoCOP(factura.iva)}</dd></div>
                <div className="cajero__total-final"><dt>Total</dt><dd>{formatoCOP(factura.total)}</dd></div>
                <div><dt>Método</dt><dd>{factura.metodo}</dd></div>
                {factura.metodo === 'EFECTIVO' && (
                  <>
                    <div><dt>Recibido</dt><dd>{formatoCOP(factura.monto_recibido)}</dd></div>
                    <div><dt>Cambio</dt><dd>{formatoCOP(factura.cambio)}</dd></div>
                  </>
                )}
              </dl>
              <div className="cajero__acciones no-print">
                <button type="button" className="cajero__btn cajero__btn--ghost" onClick={() => window.print()}>
                  <span className="material-symbols-outlined">print</span> Imprimir
                </button>
                <button type="button" className="cajero__btn cajero__btn--primario" onClick={nuevaCuenta}>
                  Siguiente cuenta
                </button>
              </div>
            </div>
          ) : !cuenta ? (
            <div className="cajero__vacio cajero__vacio--grande">
              <span className="material-symbols-outlined">point_of_sale</span>
              <p>Selecciona una cuenta para cobrarla.</p>
            </div>
          ) : (
            <>
              <h2>
                {cuenta.mesa ? `Mesa ${cuenta.mesa}` : 'Pedido'} · Pedido #{cuenta.id_pedido}
              </h2>
              <p className="cajero__muted">
                {cuenta.nombre_mesero ? `Atendió: ${cuenta.nombre_mesero}` : 'Sin mesero asignado'}
              </p>

              <table className="cajero__tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cuenta.items.map((it) => (
                    <tr key={it.id_detalle}>
                      <td>{it.nombre}</td>
                      <td>{it.cantidad}</td>
                      <td>{formatoCOP(it.precio_unitario)}</td>
                      <td>{formatoCOP(it.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <dl className="cajero__totales">
                <div><dt>Subtotal</dt><dd>{formatoCOP(cuenta.subtotal)}</dd></div>
                <div><dt>IVA</dt><dd>{formatoCOP(cuenta.iva)}</dd></div>
                <div className="cajero__total-final"><dt>Total</dt><dd>{formatoCOP(cuenta.total)}</dd></div>
              </dl>

              <fieldset className="cajero__pago">
                <legend>Método de pago</legend>
                <div className="cajero__metodos">
                  {METODOS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={metodo === m.id}
                      className={`cajero__metodo ${metodo === m.id ? 'cajero__metodo--activo' : ''}`}
                      onClick={() => setMetodo(m.id)}
                    >
                      <span className="material-symbols-outlined">{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>

                {metodo === 'EFECTIVO' && (
                  <div className="cajero__campo">
                    <label htmlFor="monto-recibido">Monto recibido</label>
                    <input
                      id="monto-recibido"
                      type="number"
                      min={cuenta.total}
                      inputMode="numeric"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(e.target.value)}
                      placeholder={String(cuenta.total)}
                    />
                    {cambio !== null && (
                      <p className={cambio < 0 ? 'cajero__error-campo' : 'cajero__cambio'}>
                        {cambio < 0
                          ? `Faltan ${formatoCOP(Math.abs(cambio))}`
                          : `Cambio: ${formatoCOP(cambio)}`}
                      </p>
                    )}
                  </div>
                )}

                {metodo && metodo !== 'EFECTIVO' && (
                  <div className="cajero__campo">
                    <label htmlFor="referencia">Referencia (opcional)</label>
                    <input
                      id="referencia"
                      type="text"
                      maxLength={80}
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      placeholder="Número de aprobación o transacción"
                    />
                  </div>
                )}
              </fieldset>

              {errorCobro && <div className="cajero__alerta cajero__alerta--error">{errorCobro}</div>}

              <button
                type="button"
                className="cajero__btn cajero__btn--primario cajero__btn--grande"
                disabled={!puedeCobrar}
                onClick={cerrarCuenta}
              >
                {enviando ? 'Procesando…' : `Cerrar cuenta y facturar ${formatoCOP(cuenta.total)}`}
              </button>
              {!metodo && <p className="cajero__muted">Selecciona un método de pago para continuar.</p>}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
