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
type ModoDivision = 'IGUAL' | 'PRODUCTOS'

interface PagoFormulario {
  id: number
  metodo: MetodoPago
  monto: string
  monto_recibido: string
  referencia: string
}

interface PagoRegistrado {
  id_pago?: number
  metodo: MetodoPago
  monto: number
  monto_recibido: number | null
  cambio: number
  referencia: string | null
}

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
interface ParteCuenta {
  id_parte: number
  numero: number
  total: number
  pagado: number
  pagada: boolean
  items: { id_detalle: number; cantidad: number; nombre: string; precio_unitario: number }[]
  pagos: PagoRegistrado[]
}
interface Division {
  id_division: number
  modo: ModoDivision
  partes: ParteCuenta[]
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
  division: Division | null
}

interface FacturaEmitida extends AjustesFactura {
  id_factura: number
  consecutivo: string
  mesa: number | null
  subtotal: number
  iva: number
  total: number
  metodo: MetodoPago | 'MIXTO'
  monto_recibido: number
  cambio: number
  pagos: PagoRegistrado[]
  items: { nombre: string; cantidad: number; precio_unitario: number }[]
  fecha_emision: string
  parte?: { id_parte: number; numero: number; total: number; items: ParteCuenta['items'] }
  modo?: ModoDivision
  total_factura?: number
  factura_pagada?: boolean
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
  const [pagosFormulario, setPagosFormulario] = useState<PagoFormulario[]>([])
  const [parteSeleccionada, setParteSeleccionada] = useState<number | null>(null)
  const [modoDivision, setModoDivision] = useState<ModoDivision | null>(null)
  const [numeroPartes, setNumeroPartes] = useState('2')
  const [asignaciones, setAsignaciones] = useState<Record<number, { parte: number; cantidad: number }[]>>({})
  const [enviandoDivision, setEnviandoDivision] = useState(false)
  const [errorDivision, setErrorDivision] = useState<string | null>(null)
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
  const parte = cuenta?.division?.partes.find((p) => p.id_parte === parteSeleccionada) ?? null
  const totalObjetivo = parte?.total ?? cuenta?.total ?? 0

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

  // Al cambiar de cuenta o parte se reinicia la distribución de métodos.
  useEffect(() => {
    setPagosFormulario([{
      id: Date.now(),
      metodo: 'EFECTIVO',
      monto: totalObjetivo.toFixed(2),
      monto_recibido: totalObjetivo.toFixed(2),
      referencia: '',
    }])
    setErrorCobro(null)
  }, [seleccionada, parteSeleccionada, cuenta?.version_factura, totalObjetivo])

  const puedeCobrar = useMemo(() => {
    if (!cuenta || enviando || !!error || pagosFormulario.length === 0) return false
    const importes = pagosFormulario.map((p) => Math.round(Number(p.monto) * 100))
    if (importes.some((monto) => !Number.isSafeInteger(monto) || monto <= 0)) return false
    if (importes.reduce((suma, monto) => suma + monto, 0) !== Math.round(totalObjetivo * 100)) return false
    return pagosFormulario.every((p, index) =>
      p.metodo !== 'EFECTIVO' ||
      (Number.isFinite(Number(p.monto_recibido)) &&
        Math.round(Number(p.monto_recibido) * 100) >= importes[index]),
    )
  }, [cuenta, enviando, error, pagosFormulario, totalObjetivo])

  function actualizarPago(indice: number, cambio: Partial<PagoFormulario>) {
    setPagosFormulario((actuales) =>
      actuales.map((pago, i) => {
        if (i !== indice) return pago
        const siguiente = { ...pago, ...cambio }
        if (cambio.monto !== undefined && siguiente.metodo === 'EFECTIVO' &&
          Math.round(Number(pago.monto_recibido) * 100) === Math.round(Number(pago.monto) * 100)) {
          siguiente.monto_recibido = cambio.monto
        }
        if (cambio.metodo === 'EFECTIVO' && !siguiente.monto_recibido) {
          siguiente.monto_recibido = siguiente.monto
        }
        return siguiente
      }),
    )
  }

  function agregarMetodoPago() {
    const asignado = pagosFormulario.reduce((suma, p) => suma + (Number(p.monto) || 0), 0)
    const restante = Math.max(0, totalObjetivo - asignado)
    setPagosFormulario((actuales) => [...actuales, {
      id: Date.now() + actuales.length,
      metodo: 'TARJETA',
      monto: restante.toFixed(2),
      monto_recibido: '',
      referencia: '',
    }])
  }

  async function cerrarCuenta() {
    if (!cuenta || !puedeCobrar) return
    setEnviando(true)
    setErrorCobro(null)
    try {
      const body = {
        ...(parte ? {} : { id_pedido: cuenta.id_pedido }),
        version_factura: cuenta.version_factura,
        pagos: pagosFormulario.map((p) => ({
          metodo: p.metodo,
          monto: Number(p.monto),
          ...(p.metodo === 'EFECTIVO' ? { monto_recibido: Number(p.monto_recibido) } : {}),
          ...(p.referencia.trim() ? { referencia: p.referencia.trim() } : {}),
        })),
      }
      if (parte) {
        const { data } = await api.post<{ recibo: FacturaEmitida }>(`/cobro/partes/${parte.id_parte}/pagar`, body)
        setFactura(data.recibo)
      } else {
        const { data } = await api.post<{ factura: FacturaEmitida }>('/cobro/cerrar-cuenta', body)
        setFactura(data.factura)
      }
      setParteSeleccionada(null)
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
    setParteSeleccionada(null)
  }

  async function crearDivision() {
    if (!cuenta || !modoDivision) return
    setEnviandoDivision(true)
    setErrorDivision(null)
    try {
      const cantidad = Number(numeroPartes)
      const body = modoDivision === 'IGUAL'
        ? { id_pedido: cuenta.id_pedido, version_factura: cuenta.version_factura, modo: modoDivision, numero_partes: cantidad }
        : {
            id_pedido: cuenta.id_pedido,
            version_factura: cuenta.version_factura,
            modo: modoDivision,
            partes: Array.from({ length: cantidad }, (_, index) => ({
              items: cuenta.items.flatMap((item) =>
                (asignaciones[item.id_detalle] ?? [])
                  .filter((a) => a.parte === index + 1)
                  .map((a) => ({ id_detalle: item.id_detalle, cantidad: a.cantidad })),
              ),
            })),
          }
      await api.post('/cobro/dividir-cuenta', body)
      setModoDivision(null)
      await cargarCuentas()
    } catch (err) {
      setErrorDivision(mensajeError(err, 'No fue posible dividir la cuenta.'))
    } finally {
      setEnviandoDivision(false)
    }
  }

  async function cancelarDivision() {
    if (!cuenta) return
    setEnviandoDivision(true)
    setErrorDivision(null)
    try {
      await api.delete(`/cobro/dividir-cuenta/${cuenta.id_pedido}`)
      setParteSeleccionada(null)
      await cargarCuentas()
    } catch (err) {
      setErrorDivision(mensajeError(err, 'No fue posible cancelar la división.'))
    } finally {
      setEnviandoDivision(false)
    }
  }

  function abrirDivision(modo: ModoDivision) {
    setModoDivision(modo)
    setNumeroPartes('2')
    setErrorDivision(null)
    if (modo === 'PRODUCTOS' && cuenta) {
      setAsignaciones(Object.fromEntries(cuenta.items.map((item, index) => [
        item.id_detalle,
        [{ parte: index % 2 + 1, cantidad: item.cantidad }],
      ])))
    }
  }

  function agregarParteProducto(item: ItemCuenta) {
    setAsignaciones((actuales) => {
      const asignadas = actuales[item.id_detalle] ?? []
      const repartible = asignadas.find((a) => a.cantidad > 1)
      if (!repartible) return actuales
      const mitad = Math.floor(repartible.cantidad / 2)
      const parteNueva = Math.min(Number(numeroPartes), repartible.parte % Number(numeroPartes) + 1)
      const nuevas = asignadas.map((a) =>
        a === repartible ? { ...a, cantidad: a.cantidad - mitad } : a,
      )
      return {
        ...actuales,
        [item.id_detalle]: [...nuevas, { parte: parteNueva, cantidad: mitad }],
      }
    })
  }

  const cantidadPartes = Number(numeroPartes)
  const divisionProductosValida = !!cuenta && cantidadPartes >= 2 && cantidadPartes <= 12 &&
    cuenta.items.every((item) => {
      const asignadas = asignaciones[item.id_detalle] ?? []
      return asignadas.length > 0 &&
        asignadas.reduce((suma, a) => suma + a.cantidad, 0) === item.cantidad &&
        asignadas.every((a) => Number.isInteger(a.cantidad) && a.cantidad > 0 && a.parte >= 1 && a.parte <= cantidadPartes)
    }) &&
    Array.from({ length: cantidadPartes }, (_, index) =>
      cuenta.items.some((item) => (asignaciones[item.id_detalle] ?? []).some((a) => a.parte === index + 1)),
    ).every(Boolean)
  const centavosAsignados = pagosFormulario.reduce((suma, p) => {
    const monto = Number(p.monto)
    return suma + (Number.isFinite(monto) ? Math.round(monto * 100) : 0)
  }, 0)
  const centavosRestantes = Math.round(totalObjetivo * 100) - centavosAsignados

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
            <Link aria-description="Regresa a tu panel de administración." className="cajero__btn cajero__btn--ghost mb-2 w-full justify-center" to={rol === 'SUPERADMIN' ? '/superadmin' : '/gerente'}>
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
                <button aria-description="Vuelve a consultar las cuentas pendientes de cobro." type="button" className="cajero__btn cajero__btn--ghost" onClick={cargarCuentas}>
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
              aria-description={`Consulta el consumo del pedido #${c.id_pedido}.`}
              key={c.id_pedido}
              type="button"
              className={`cajero__cuenta ${c.id_pedido === seleccionada ? 'cajero__cuenta--activa' : ''}`}
              onClick={() => {
                setFactura(null)
                setParteSeleccionada(null)
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
                {factura.parte
                  ? factura.factura_pagada
                    ? 'Parte pagada. La factura final quedó cerrada.'
                    : 'Pago de la parte registrado. Las demás partes siguen pendientes.'
                  : 'Pago registrado. La factura quedó en el historial.'}
              </div>
              <h2>{factura.parte ? `Recibo · Parte ${factura.parte.numero}` : `Factura ${factura.consecutivo}`}</h2>
              <p className="cajero__muted">
                {new Date(factura.fecha_emision).toLocaleString('es-CO')}
                {factura.mesa ? ` · Mesa ${factura.mesa}` : ''}
                {factura.receptor && ` · ${factura.receptor}`}
              </p>
              <TablaConsumo
                key={`${factura.id_factura}-${factura.parte?.id_parte ?? 'factura'}`}
                items={factura.parte ? factura.parte.items : factura.items}
                moneda={formatoCOP}
                comprobante
              />
              <dl className="cajero__totales">
                {factura.parte ? (
                  <>
                    <div className="cajero__total-final"><dt>Total de la parte</dt><dd>{formatoCOP(factura.parte.total)}</dd></div>
                    <div><dt>Total de la factura</dt><dd>{formatoCOP(factura.total_factura ?? factura.total)}</dd></div>
                  </>
                ) : (
                  <>
                    <div><dt>Subtotal</dt><dd>{formatoCOP(factura.subtotal)}</dd></div>
                    {factura.descuento > 0 && <div><dt>Descuento</dt><dd>− {formatoCOP(factura.descuento)}</dd></div>}
                    <div><dt>IVA</dt><dd>{formatoCOP(factura.iva)}</dd></div>
                    {factura.propina > 0 && <div><dt>Propina</dt><dd>{formatoCOP(factura.propina)}</dd></div>}
                    <div className="cajero__total-final"><dt>Total</dt><dd>{formatoCOP(factura.total)}</dd></div>
                  </>
                )}
                <div><dt>Métodos</dt><dd>{factura.pagos?.map((p) => p.metodo).join(' + ') || factura.metodo}</dd></div>
                {factura.pagos?.map((p, index) => (
                  <div key={p.id_pago ?? index}>
                    <dt>{p.metodo}</dt>
                    <dd>
                      {formatoCOP(p.monto)}
                      {p.metodo === 'EFECTIVO' && ` · Recibido ${formatoCOP(p.monto_recibido ?? p.monto)} · Cambio ${formatoCOP(p.cambio)}`}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="cajero__acciones no-print">
                <button aria-description="Abre la vista de impresión del comprobante." type="button" className="cajero__btn cajero__btn--ghost" onClick={() => window.print()}>
                  <span className="material-symbols-outlined">print</span> Imprimir
                </button>
                <Button aria-description={factura.parte && !factura.factura_pagada ? 'Vuelve a las partes pendientes de la misma cuenta.' : 'Vuelve a las cuentas pendientes de cobro.'} onClick={nuevaCuenta}>
                  {factura.parte && !factura.factura_pagada ? 'Volver a las partes' : 'Siguiente cuenta'}
                </Button>
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

              {(!cuenta.division || parte) && (
                <>
                <fieldset className="cajero__pago">
                <legend>{parte ? `Pago de la parte ${parte.numero}` : 'Medios de pago'}</legend>
                {pagosFormulario.map((pago, index) => (
                  <div className="cajero__pago-linea" key={pago.id}>
                    <label className="cajero__campo">
                      <span>Método</span>
                      <select value={pago.metodo} onChange={(e) => actualizarPago(index, { metodo: e.target.value as MetodoPago })}>
                        {METODOS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                      </select>
                    </label>
                    <InputField
                      id={`pago-monto-${pago.id}`}
                      label="Importe aplicado"
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      value={pago.monto}
                      onChange={(e) => actualizarPago(index, { monto: e.target.value })}
                    />
                    {pago.metodo === 'EFECTIVO' ? (
                      <>
                        <InputField
                          id={`pago-recibido-${pago.id}`}
                          label="Efectivo recibido"
                          type="number"
                          min={pago.monto}
                          step="0.01"
                          inputMode="decimal"
                          value={pago.monto_recibido}
                          onChange={(e) => actualizarPago(index, { monto_recibido: e.target.value })}
                        />
                        {Number(pago.monto_recibido) >= Number(pago.monto) &&
                          <p className="cajero__cambio">Cambio: {formatoCOP(Number(pago.monto_recibido) - Number(pago.monto))}</p>}
                      </>
                    ) : (
                      <InputField
                        id={`pago-referencia-${pago.id}`}
                        label="Referencia (opcional)"
                        type="text"
                        maxLength={80}
                        value={pago.referencia}
                        onChange={(e) => actualizarPago(index, { referencia: e.target.value })}
                        placeholder="Número de aprobación o transacción"
                      />
                    )}
                    {pagosFormulario.length > 1 && (
                      <button type="button" className="cajero__btn cajero__btn--ghost" onClick={() => setPagosFormulario((actuales) => actuales.filter((_, i) => i !== index))}>
                        Quitar
                      </button>
                    )}
                  </div>
                ))}
                <p className="cajero__muted">
                  Total a cubrir: {formatoCOP(totalObjetivo)} · {centavosRestantes === 0
                    ? 'Importe completo'
                    : centavosRestantes > 0
                      ? `Faltan ${formatoCOP(centavosRestantes / 100)}`
                      : `Excede ${formatoCOP(Math.abs(centavosRestantes) / 100)}`}
                </p>
                <button type="button" className="cajero__btn cajero__btn--ghost" onClick={agregarMetodoPago}>
                  + Agregar otro medio de pago
                </button>
                </fieldset>

                {errorCobro && <div className="cajero__alerta cajero__alerta--error">{errorCobro}</div>}

                <Button
                  aria-description={parte ? 'Registra los pagos de esta parte y genera su recibo.' : 'Registra los pagos y cierra la cuenta con su factura.'}
                  className="cajero__btn--grande"
                  disabled={!puedeCobrar}
                  onClick={cerrarCuenta}
                >
                  {enviando ? 'Procesando…' : parte
                    ? `Pagar parte ${parte.numero} · ${formatoCOP(parte.total)}`
                    : `Cerrar cuenta y facturar ${formatoCOP(cuenta.total)}`}
                </Button>
                </>
              )}

              {!cuenta.division ? (
                <section className="cajero__division">
                  <h3>Dividir cuenta</h3>
                  {!modoDivision ? (
                    <div className="cajero__division-acciones">
                      <Button disabled={enviandoDivision} onClick={() => abrirDivision('IGUAL')}>En partes iguales</Button>
                      <Button disabled={enviandoDivision} onClick={() => abrirDivision('PRODUCTOS')}>Por productos</Button>
                    </div>
                  ) : (
                    <>
                      <div className="cajero__division-config">
                        <InputField
                          id="cantidad-partes"
                          label="Cantidad de partes (2 a 12)"
                          type="number"
                          min="2"
                          max="12"
                          step="1"
                          value={numeroPartes}
                          onChange={(e) => setNumeroPartes(e.target.value)}
                        />
                        {modoDivision === 'PRODUCTOS' && cuenta.items.map((item) => {
                          const asignadas = asignaciones[item.id_detalle] ?? []
                          const cantidadAsignada = asignadas.reduce((suma, a) => suma + a.cantidad, 0)
                          return (
                            <div className="cajero__asignacion" key={item.id_detalle}>
                              <strong>{item.nombre} · {item.cantidad} × {formatoCOP(item.precio_unitario)}</strong>
                              {asignadas.map((a, index) => (
                                <div className="cajero__asignacion-linea" key={`${item.id_detalle}-${index}`}>
                                  <label>
                                    <span>Parte</span>
                                    <select value={a.parte} onChange={(e) => setAsignaciones((actuales) => ({
                                      ...actuales,
                                      [item.id_detalle]: (actuales[item.id_detalle] ?? []).map((actual, i) => i === index ? { ...actual, parte: Number(e.target.value) } : actual),
                                    }))}>
                                      {Array.from({ length: cantidadPartes }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                    </select>
                                  </label>
                                  <InputField
                                    id={`cantidad-${item.id_detalle}-${index}`}
                                    label="Unidades"
                                    type="number"
                                    min="1"
                                    max={item.cantidad}
                                    step="1"
                                    value={a.cantidad}
                                    onChange={(e) => setAsignaciones((actuales) => ({
                                      ...actuales,
                                      [item.id_detalle]: (actuales[item.id_detalle] ?? []).map((actual, i) => i === index ? { ...actual, cantidad: Number(e.target.value) } : actual),
                                    }))}
                                  />
                                  {asignadas.length > 1 && (
                                    <button type="button" className="cajero__btn cajero__btn--ghost" onClick={() => setAsignaciones((actuales) => {
                                      const lineas = [...(actuales[item.id_detalle] ?? [])]
                                      const [quitada] = lineas.splice(index, 1)
                                      lineas[0] = { ...lineas[0], cantidad: lineas[0].cantidad + quitada.cantidad }
                                      return { ...actuales, [item.id_detalle]: lineas }
                                    })}>Quitar</button>
                                  )}
                                </div>
                              ))}
                              <p className="cajero__muted">Asignadas: {cantidadAsignada} / {item.cantidad}</p>
                              {cantidadAsignada === item.cantidad && item.cantidad > asignadas.length && (
                                <button type="button" className="cajero__btn cajero__btn--ghost" onClick={() => agregarParteProducto(item)}>Repartir unidades</button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {errorDivision && <div className="cajero__alerta cajero__alerta--error">{errorDivision}</div>}
                      <div className="cajero__division-acciones">
                        <Button disabled={enviandoDivision} onClick={() => setModoDivision(null)}>Cancelar</Button>
                        <Button
                          disabled={enviandoDivision || cantidadPartes < 2 || cantidadPartes > 12 || !Number.isInteger(cantidadPartes) || (modoDivision === 'PRODUCTOS' && !divisionProductosValida)}
                          onClick={crearDivision}
                        >
                          {enviandoDivision ? 'Creando partes…' : 'Crear partes'}
                        </Button>
                      </div>
                    </>
                  )}
                </section>
              ) : (
                <section className="cajero__division">
                  <div className="cajero__division-encabezado">
                    <div>
                      <h3>{cuenta.division.modo === 'IGUAL' ? 'Partes iguales' : 'Partes por productos'}</h3>
                      <p className="cajero__muted">Se emite una factura detallada al cerrar todas las partes y un recibo por cada pago.</p>
                    </div>
                    {!cuenta.division.partes.some((p) => p.pagada) && (
                      <Button disabled={enviandoDivision} onClick={cancelarDivision}>Cancelar división</Button>
                    )}
                  </div>
                  {errorDivision && <div className="cajero__alerta cajero__alerta--error">{errorDivision}</div>}
                  <div className="cajero__partes">
                    {cuenta.division.partes.map((p) => (
                      <article className="cajero__parte" key={p.id_parte}>
                        <div>
                          <strong>Parte {p.numero}</strong>
                          <span>{formatoCOP(p.total)}</span>
                        </div>
                        {p.items.length > 0 && (
                          <ul>{p.items.map((item) => <li key={item.id_detalle}>{item.cantidad}× {item.nombre}</li>)}</ul>
                        )}
                        {p.pagada ? (
                          <p className="cajero__cambio">Pagada · {p.pagos.map((pago) => pago.metodo).join(' + ')}</p>
                        ) : (
                          <Button disabled={enviando} onClick={() => setParteSeleccionada(p.id_parte)}>Cobrar esta parte</Button>
                        )}
                      </article>
                    ))}
                  </div>
                  {parteSeleccionada && !parte && <p className="cajero__muted">Actualizando partes…</p>}
                </section>
              )}
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
