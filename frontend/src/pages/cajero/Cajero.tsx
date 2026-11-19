import TablaConsumo from './TablaConsumo'
import { useVistaURL } from '../../hook/useVistaURL'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Button from '../../components/common/Button'
import type { RootState } from '../../store/store'
import { useAuth } from '../../store/hooks'
import { tiempoTranscurrido } from '../../utils/tiempo'
import './Cajero.css'
import { Calculator, Utensils } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { DataTable } from '../../components/common/DataTable'
import { InputField } from '../../components/common/InputField'

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'

interface ItemCuenta {
  id_detalle: number
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface AjustesFactura {
  descuento: number
  propina: number
  receptor?: string | null
}
interface Cuenta extends AjustesFactura {
  version_factura: number | null
  consecutivo?: string | null
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

interface FacturaEmitida extends AjustesFactura {
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

interface ProductoCarta {
  id_producto: number
  Nombre: string
  Descripcion: string
  precio_venta: string
  Categoria: string
  categoria: { id_categoria: number; nombre: string; descripcion: string | null } | null
}

const formatoCOP = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(valor)

function mensajeError(err: unknown, fallback: string) {
  const respuesta = (err as { response?: { data?: { message?: string } } })?.response?.data
  return respuesta?.message ?? fallback
}

export default function Cajero() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const rol = useSelector((state: RootState) => state.auth.rol)
  const nombreCompleto = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Cajero'

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
  // Vista del menú lateral: cobro o carta de platos (productos de la base).
  const [vista, setVista] = useVistaURL('vista', 'cobro', ['cobro', 'menu'])
  const [productos, setProductos] = useState<ProductoCarta[]>([])
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [errorProductos, setErrorProductos] = useState<string | null>(null)

  useEffect(() => {
    if (vista !== 'menu') return
    setCargandoProductos(true)
    setErrorProductos(null)
    api
      .get<ProductoCarta[]>('/productos')
      .then(({ data }) => setProductos(Array.isArray(data) ? data : []))
      .catch(err => setErrorProductos(mensajeError(err, 'No se pudo cargar el menú.')))
      .finally(() => setCargandoProductos(false))
  }, [vista])

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
  }, [seleccionada, cuenta?.version_factura])

  const cambio = useMemo(() => {
    if (!cuenta || metodo !== 'EFECTIVO') return null
    const recibido = Number(montoRecibido)
    if (!montoRecibido || Number.isNaN(recibido)) return null
    return recibido - cuenta.total
  }, [cuenta, metodo, montoRecibido])

  const puedeCobrar = useMemo(() => {
    if (!cuenta || !metodo || enviando || error) return false
    if (metodo === 'EFECTIVO') return cambio !== null && cambio >= 0
    return true
  }, [cuenta, metodo, enviando, cambio, error])

  async function cerrarCuenta() {
    if (!cuenta || !metodo) return
    setEnviando(true)
    setErrorCobro(null)
    try {
      const body: Record<string, unknown> = { id_pedido: cuenta.id_pedido, metodo, version_factura: cuenta.version_factura }
      if (metodo === 'EFECTIVO') body.monto_recibido = Number(montoRecibido)
      if (metodo !== 'EFECTIVO' && referencia.trim()) body.referencia = referencia.trim()

      const { data } = await api.post<{ factura: FacturaEmitida }>('/cobro/cerrar-cuenta', body)
      setFactura(data.factura)
      await cargarCuentas()
    } catch (err) {
      await cargarCuentas()
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
      <Sidebar
        subtitulo="Cajero"
        menuItems={[
          { icon: <Calculator />, label: 'Cobro' },
          { icon: <Utensils />, label: 'Menú' },
        ]}
        vistaActual={vista === 'menu' ? 'menú' : 'cobro'}
        onNavigate={(v) => setVista(v === 'menú' ? 'menu' : 'cobro')}
        onLogout={() => {
          logout()
          navigate('/')
        }}
        footer={
          rol === 'GERENTE' || rol === 'SUPERADMIN' ? (
            <Link className="cajero__btn cajero__btn--ghost mb-2 w-full justify-center" to={rol === 'SUPERADMIN' ? '/superadmin' : '/gerente'}>
              Volver al panel
            </Link>
          ) : undefined
        }
      />

      <main className="cajero__main">
        <div className="no-print">
          <Header
            seccionActiva={vista === 'menu' ? 'Menú' : 'Tablero Cajero'}
            nombreUsuario={nombreCompleto}
            subtitulo={`${rol ?? ''} · ${cuentas.length} cuenta${cuentas.length === 1 ? '' : 's'} abierta${cuentas.length === 1 ? '' : 's'}`}
            acciones={
              vista === 'cobro' ? (
                <button type="button" className="cajero__btn cajero__btn--ghost" onClick={cargarCuentas}>
                  <span className="material-symbols-outlined">refresh</span> Actualizar
                </button>
              ) : undefined
            }
          />
        </div>

      {vista === 'cobro' && error && <div className="cajero__alerta cajero__alerta--error">{error}</div>}

      {vista === 'cobro' && (
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
                Pedido #{c.id_pedido} · {c.items.length} ítem{c.items.length === 1 ? '' : 's'}{c.estado === 'POR_COBRAR' ? ' · Cuenta solicitada' : ''}
              </div>
              <div className="cajero__cuenta-total">{formatoCOP(c.total)}</div>
            </button>
          ))}
        </aside>

        <section className="cajero__detalle">
          {factura ? (
            <div className="cajero__factura" id="comprobante">
              <div className="cajero__alerta cajero__alerta--ok no-print">
                Pago registrado. La factura quedó en el historial.
              </div>
              <h2>Factura {factura.consecutivo}</h2>
              <p className="cajero__muted">
                {new Date(factura.fecha_emision).toLocaleString('es-CO')}
                {factura.mesa ? ` · Mesa ${factura.mesa}` : ''}
                {factura.receptor && ` · ${factura.receptor}`}
              </p>
              <TablaConsumo key={factura.id_factura} items={factura.items} moneda={formatoCOP} comprobante />
              <dl className="cajero__totales">
                <div><dt>Subtotal</dt><dd>{formatoCOP(factura.subtotal)}</dd></div>
                {factura.descuento > 0 && <div><dt>Descuento</dt><dd>− {formatoCOP(factura.descuento)}</dd></div>}
                <div><dt>IVA</dt><dd>{formatoCOP(factura.iva)}</dd></div>
                {factura.propina > 0 && <div><dt>Propina</dt><dd>{formatoCOP(factura.propina)}</dd></div>}
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
                <Button onClick={nuevaCuenta}>Siguiente cuenta</Button>
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
                {cuenta.consecutivo && ` · ${cuenta.consecutivo}`}
                {cuenta.receptor && ` · ${cuenta.receptor}`}
              </p>

              <TablaConsumo key={cuenta.id_pedido} items={cuenta.items} moneda={formatoCOP} />

              <dl className="cajero__totales">
                <div><dt>Subtotal</dt><dd>{formatoCOP(cuenta.subtotal)}</dd></div>
                {cuenta.descuento > 0 && <div><dt>Descuento</dt><dd>− {formatoCOP(cuenta.descuento)}</dd></div>}
                <div><dt>IVA</dt><dd>{formatoCOP(cuenta.iva)}</dd></div>
                {cuenta.propina > 0 && <div><dt>Propina</dt><dd>{formatoCOP(cuenta.propina)}</dd></div>}
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
                  <>
                  <InputField
                    id="monto-recibido"
                    label="Monto recibido"
                    type="number"
                    min={cuenta.total}
                    step="0.01"
                    inputMode="decimal"
                    value={montoRecibido}
                    onChange={(e) => setMontoRecibido(e.target.value)}
                    placeholder={String(cuenta.total)}
                    error={cambio !== null && cambio < 0 ? `Faltan ${formatoCOP(Math.abs(cambio))}` : undefined}
                  />
                  {cambio !== null && cambio >= 0 && <p className="cajero__cambio">Cambio: {formatoCOP(cambio)}</p>}
                  </>
                )}

                {metodo && metodo !== 'EFECTIVO' && (
                  <InputField
                    id="referencia"
                    label="Referencia (opcional)"
                    type="text"
                    maxLength={80}
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Número de aprobación o transacción"
                  />
                )}
              </fieldset>

              {errorCobro && <div className="cajero__alerta cajero__alerta--error">{errorCobro}</div>}

              <Button
                className="cajero__btn--grande"
                disabled={!puedeCobrar}
                onClick={cerrarCuenta}
              >
                {enviando ? 'Procesando…' : `Cerrar cuenta y facturar ${formatoCOP(cuenta.total)}`}
              </Button>
              {!metodo && <p className="cajero__muted">Selecciona un método de pago para continuar.</p>}
            </>
          )}
        </section>
      </div>
      )}

      {vista === 'menu' && (
        <section className="cajero__detalle" aria-label="Menú de platos">
          {cargandoProductos && <p className="cajero__vacio">Cargando menú…</p>}
          {errorProductos && <div className="cajero__alerta cajero__alerta--error">{errorProductos}</div>}
          {!cargandoProductos && !errorProductos && productos.length === 0 && (
            <div className="cajero__vacio">
              <p>No hay platos registrados.</p>
            </div>
          )}
          {productos.length > 0 && (
            <DataTable
              columns={[
                { header: 'Plato', render: (p) => p.Nombre },
                { header: 'Descripción', render: (p) => p.Descripcion },
                { header: 'Categoría', render: (p) => p.categoria?.nombre ?? (p.Categoria || '—') },
                { header: 'Precio', render: (p) => formatoCOP(Number(p.precio_venta)) },
              ]}
              data={productos}
              keyExtractor={(p) => p.id_producto}
            />
          )}
        </section>
      )}
      </main>
    </div>
  )
}
