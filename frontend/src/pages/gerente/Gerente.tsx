/* eslint-disable react-hooks/exhaustive-deps */
import './Gerente.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import api from '../../api/axios'
import PersonalSection from './sections/PersonalSection'
import IngredientesSection from './sections/IngredientesSection'
import FinanzasSection from './sections/FinanzasSection'
import ProveedoresSection from './sections/ProveedoresSection'
import CajasSection from './sections/CajasSection'
import Header from '../../components/layout/Header'
import Sidebar from '../../components/layout/Sidebar'
import { DataTable } from '../../components/common/DataTable'
import { InputField } from '../../components/common/InputField'
import Modal from '../../components/common/Modal'
import { MetricCard } from '../../components/common/MetricCard'
import GerenteModals from './components/GerenteModals'
import DashboardOperativo from './components/DashboardOperativo'
import type { Caja, Ingrediente, Personal, Producto, Proveedor } from './types'
import { finanzasStats, iaInsights, menuItems } from './data'
const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

// Formas de respuesta de GET /api/facturas y GET /api/inventario (solo los campos que usamos).
interface PagoApi { id_factura?: number; id_turno?: number | null; metodo: string | null; monto: string | number | null; estado: string | null; fecha_pago: string | null }
interface FacturaApi { pedido?: { Mesa_num: number | null } | null; pago?: PagoApi[] }
interface TurnoApi {
  id_turno: number
  id_caja: number
  id_usuario_cajero: number
  fecha_apertura: string | null
  fecha_cierre: string | null
  efectivo_inicial: string | number | null
  efectivo_esperado: string | number | null
  efectivo_real: string | number | null
  diferencia: string | number | null
  estado: string | null
  caja?: { nombre: string | null } | null
  usuario?: { nombre: string | null; apellido: string | null } | null
}
interface PedidoApi {
  id_pedido: number
  Mesa_num: number | null
  Tipo_pedido: string | null
  Fecha_hora: string | null
  nombre_mesero: string | null
}
interface EventoHistorial { fecha: string | null; usuario: string; accion: string }
interface InventarioApi { nombre: string; unidad_medida: string | null; stock_minimo: string | number | null; stock_actual: number | string | null; stock_bajo: boolean }

const etiquetaMetodo = (metodo: string | null) => {
  const etiquetas: Record<string, string> = { EFECTIVO: 'Efectivo', TARJETA_CREDITO: 'Tarjeta crédito', TARJETA_DEBITO: 'Tarjeta débito', PSE: 'PSE' }
  return metodo ? (etiquetas[metodo] ?? metodo) : 'Sin método'
}

const haceTiempo = (fecha: string | null) => {
  if (!fecha) return '—'
  const minutos = Math.max(0, Math.round((Date.now() - new Date(fecha).getTime()) / 60000))
  if (minutos < 60) return `Hace ${minutos} min`
  if (minutos < 1440) return `Hace ${Math.round(minutos / 60)} h`
  return `Hace ${Math.round(minutos / 1440)} d`
}

// Fecha YYYY-MM-DD del día de Bogotá, desplazada N días.
function fechaBogota(desplazamientoDias = 0): string {
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
  const fecha = new Date(`${hoy}T00:00:00Z`)
  fecha.setUTCDate(fecha.getUTCDate() + desplazamientoDias)
  return fecha.toISOString().slice(0, 10)
}

interface ResumenDashboard {
  ingresosHoy: number
  pedidosActivos: number
  tendencia: { dia: string; alto: number }[]
}

interface PedidoEnCurso {
  id_pedido: number
  Mesa_num: number | null
  Tipo_pedido: string
  estado: string
  Fecha_hora: string
  nombre_mesero: string | null
}

const etiquetaEstadoPedido: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_PREPARACION: 'Preparando',
  EN_PROCESO: 'Preparando',
  LISTO: 'Listo',
}

function tiempoDesde(fecha: string): string {
  const minutos = Math.max(0, Math.round((Date.now() - new Date(fecha).getTime()) / 60000))
  return minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)} h ${minutos % 60} min`
}

const productoVacio: Omit<Producto, 'id_producto'> = {
  Nombre: '', Descripcion: '', precio_venta: '', Categoria: '', Tiempo_preparacion: '00:00:00', Estado: 1,
}
const ingredienteVacio = {
  nombre: '', descripcion: '', unidad_medida: '', costo_unitario_ref: '', stock_minimo: '0',
}
const proveedorVacio = {
  nombre: '', nombre_contacto: '', telefono: '', email: '',
  direccion: '', nit: '', tipo_proveedor: '', estado: 'ACTIVO',
}
const cajaVacia = { nombre: '', estado: 'ACTIVA' }
const personalVacio = { nombre: '', apellido: '', email: '', id_rol: '' as number | '' , contrasena: '' }
function Gerente() {
  const [seccionActiva, setSeccionActiva] = useState('Menú')
  const [ingresosDelMes, setIngresosDelMes] = useState<number | null>(null)
  const [gastosMes, setGastosMes] = useState<number | null>(null)
  // Gastos del mes: compras a proveedores de la base (orden_compra).
  useEffect(() => {
    if (seccionActiva !== 'Finanzas') return
    api.get('/reportes/gastos-del-mes')
      .then(({ data }: { data: { data: { gastos_mes: number } } }) => setGastosMes(Number(data.data.gastos_mes)))
      .catch(console.error)
  }, [seccionActiva])
  const [pagosAprobados, setPagosAprobados] = useState<PagoApi[]>([])
  const [turnos, setTurnos] = useState<TurnoApi[]>([])
  const [historial, setHistorial] = useState<EventoHistorial[]>([])
  const [cajeros, setCajeros] = useState<Personal[]>([])
  const [mostrarAbrirTurno, setMostrarAbrirTurno] = useState(false)
  const [formAbrir, setFormAbrir] = useState({ id_caja: '', id_usuario_cajero: '', efectivo_inicial: '' })
  const [turnoCerrando, setTurnoCerrando] = useState<number | null>(null)
  const [efectivoContado, setEfectivoContado] = useState('')
  const [notasCierre, setNotasCierre] = useState('')
  const [errorTurno, setErrorTurno] = useState('')
  const vistaActual = seccionActiva.toLowerCase()
  const setVistaActual = (vista: string) => {
    const itemSeleccionado = menuItems.find(item => item.label.toLowerCase() === vista)
    if (itemSeleccionado) setSeccionActiva(itemSeleccionado.label)
  }
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [fuenteProductos, setFuenteProductos] = useState<'vista' | 'sp'>('vista')
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [modalProducto, setModalProducto] = useState(false)
  const [modoEdicionProducto, setModoEdicionProducto] = useState(false)
  const [productoActual, setProductoActual] = useState<Omit<Producto, 'id_producto'>>(productoVacio)
  const [idEditandoProducto, setIdEditandoProducto] = useState<number | null>(null)
  const [guardandoProducto, setGuardandoProducto] = useState(false)
  const [errorProducto, setErrorProducto] = useState<string | null>(null)
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [modalIngrediente, setModalIngrediente] = useState(false)
  const [modoEdicionIngrediente, setModoEdicionIngrediente] = useState(false)
  const [ingredienteActual, setIngredienteActual] = useState(ingredienteVacio)
  const [idEditandoIngrediente, setIdEditandoIngrediente] = useState<number | null>(null)
  const [guardandoIngrediente, setGuardandoIngrediente] = useState(false)
  const [errorIngrediente, setErrorIngrediente] = useState<string | null>(null)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [modalProveedor, setModalProveedor] = useState(false)
  const [modoEdicionProveedor, setModoEdicionProveedor] = useState(false)
  const [proveedorActual, setProveedorActual] = useState(proveedorVacio)
  const [idEditandoProveedor, setIdEditandoProveedor] = useState<number | null>(null)
  const [guardandoProveedor, setGuardandoProveedor] = useState(false)
  const [errorProveedor, setErrorProveedor] = useState<string | null>(null)
  const [cajas, setCajas] = useState<Caja[]>([])
  const [modalCaja, setModalCaja] = useState(false)
  const [modoEdicionCaja, setModoEdicionCaja] = useState(false)
  const [cajaActual, setCajaActual] = useState(cajaVacia)
  const [idEditandoCaja, setIdEditandoCaja] = useState<number | null>(null)
  const [guardandoCaja, setGuardandoCaja] = useState(false)
  const [errorCaja, setErrorCaja] = useState<string | null>(null)
  const [personal, setPersonal] = useState<Personal[]>([])
  const [formData, setFormData] = useState(personalVacio)
  const [usuarioEditando, setUsuarioEditando] = useState<Personal | null>(null)
  const [errorPersonal, setErrorPersonal] = useState<string | null>(null)
  const [guardandoPersonal, setGuardandoPersonal] = useState(false)
  const [cargandoPersonal, setCargandoPersonal] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [resumenDashboard, setResumenDashboard] = useState<ResumenDashboard | null>(null)

  useEffect(() => {
    if (seccionActiva !== 'Menú') return
    const hasta = fechaBogota(0)
    const desde = fechaBogota(-6)
    Promise.all([
      api.get('/reportes/ventas-diarias', { params: { desde, hasta } }),
      api.get('/reportes/pedidos-activos'),
    ])
      .then(([ventas, pedidos]) => {
        const dias: { fecha: string; ingresos_brutos: number }[] = ventas.data.data.dias
        const ingresosPorDia = new Map<string, number>(
          dias.map(d => [d.fecha, Number(d.ingresos_brutos)] as [string, number]),
        )
        const serie = Array.from({ length: 7 }, (_, i) => {
          const fecha = fechaBogota(i - 6)
          return { fecha, valor: ingresosPorDia.get(fecha) ?? 0 }
        })
        const maximo = Math.max(...serie.map(s => s.valor), 1)
        setResumenDashboard({
          ingresosHoy: ingresosPorDia.get(hasta) ?? 0,
          pedidosActivos: Number(pedidos.data.data.pedidos_activos),
          tendencia: serie.map(s => ({
            dia: new Date(`${s.fecha}T12:00:00Z`)
              .toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' })
              .replace('.', '')
              .slice(0, 3)
              .toUpperCase(),
            alto: Math.max(Math.round((s.valor / maximo) * 100), 2),
          })),
        })
      })
      .catch(console.error)
  }, [seccionActiva])

  const metricasDashboard = [
    {
      icon: 'monetization_on',
      label: 'Ingresos del día',
      valor: resumenDashboard ? formatoCOP.format(resumenDashboard.ingresosHoy) : '...',
      badge: 'Hoy',
      badgeColor: 'muted',
    },
    {
      icon: 'account_balance_wallet',
      label: 'Ventas del mes',
      valor: ingresosDelMes === null ? '...' : formatoCOP.format(ingresosDelMes),
      badge: 'Pagos aprobados',
      badgeColor: 'muted',
    },
    {
      icon: 'shopping_bag',
      label: 'Pedidos activos',
      valor: resumenDashboard ? String(resumenDashboard.pedidosActivos) : '...',
      badge: resumenDashboard && resumenDashboard.pedidosActivos > 0 ? 'En curso' : 'Sin pedidos',
      badgeColor: resumenDashboard && resumenDashboard.pedidosActivos > 0 ? 'rojo' : 'muted',
    },
  ]

  const tendenciaSemanal = resumenDashboard?.tendencia ?? []

  const [pedidosEnCurso, setPedidosEnCurso] = useState<PedidoEnCurso[]>([])

  useEffect(() => {
    if (seccionActiva !== 'Pedidos') return
    api.get('/pedidos')
      .then(({ data }: { data: PedidoEnCurso[] }) =>
        setPedidosEnCurso(data.filter(p => p.estado !== 'CERRADO' && p.estado !== 'CANCELADO')))
      .catch(console.error)
  }, [seccionActiva])

  // Estado de mesas: mesas reales de la base (GET /api/mesas), actualizadas cada 15 s.
  const [mesas, setMesas] = useState<{ id: string; ocupada: boolean }[]>([])

  useEffect(() => {
    if (seccionActiva !== 'Menú' && seccionActiva !== 'Mesas') return
    const cargarMesas = () =>
      api.get('/mesas')
        .then(({ data }: { data: { data: { numero: number; estado: string }[] } }) =>
          setMesas(data.data.map(m => ({
            id: `T-${String(m.numero).padStart(2, '0')}`,
            ocupada: m.estado === 'occupied',
          }))))
        .catch(console.error)
    cargarMesas()
    const intervalo = setInterval(cargarMesas, 15000)
    return () => clearInterval(intervalo)
  }, [seccionActiva])

  // Movimientos recientes (pagos aprobados) y Estado inventario (stock actual): datos de la base.
  const [movimientosRecientes, setMovimientosRecientes] = useState<{ icon: string; titulo: string; sub: string; monto: string; positivo: boolean }[]>([])
  const [estadoInventario, setEstadoInventario] = useState<{ nombre: string; porcentaje: number; color: string; etiqueta: string }[]>([])

  useEffect(() => {
    if (seccionActiva !== 'Menú' && seccionActiva !== 'Finanzas') return
    api.get('/facturas')
      .then(({ data }: { data: { data: FacturaApi[] } }) => {
        const aprobados = data.data
          .flatMap(f => (f.pago ?? []).map(p => ({ ...p, mesa: f.pedido?.Mesa_num ?? null })))
          .filter(p => p.estado === 'APROBADO')
        const ahora = new Date()
        setIngresosDelMes(aprobados
          .filter(p => {
            const fecha = new Date(p.fecha_pago ?? '')
            return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
          })
          .reduce((acc, p) => acc + Number(p.monto ?? 0), 0))
        setPagosAprobados(aprobados)
        const pagos = [...aprobados]
          .sort((a, b) => new Date(b.fecha_pago ?? 0).getTime() - new Date(a.fecha_pago ?? 0).getTime())
          .slice(0, 4)
        setMovimientosRecientes(pagos.map(p => ({
          icon: 'shopping_cart',
          titulo: p.mesa ? `Mesa ${String(p.mesa).padStart(2, '0')} - Pago recibido` : 'Pago recibido (domicilio)',
          sub: `${haceTiempo(p.fecha_pago)} • ${etiquetaMetodo(p.metodo)}`,
          monto: `+${formatoCOP.format(Number(p.monto ?? 0))}`,
          positivo: true,
        })))
      })
      .catch(console.error)

    if (seccionActiva !== 'Menú') return
    api.get('/inventario')
      .then(({ data }: { data: { data: InventarioApi[] } }) => setEstadoInventario(data.data.map(i => {
        const minimo = Number(i.stock_minimo ?? 0)
        const actual = Number(i.stock_actual ?? 0)
        return {
          nombre: i.nombre,
          porcentaje: minimo > 0 ? Math.min(100, Math.round((actual / minimo) * 100)) : 100,
          color: i.stock_bajo ? 'rojo' : 'verde',
          etiqueta: `${actual} ${i.unidad_medida ?? ''}`.trim(),
        }
      })))
      .catch(console.error)
  }, [seccionActiva])

  // Historial: pedidos, pagos y turnos registrados en la base (no hay tabla de auditoria).
  useEffect(() => {
    if (seccionActiva !== 'Historial') return
    Promise.all([api.get('/pedidos'), api.get('/turnos'), api.get('/facturas')])
      .then(([pedidosRes, turnosRes, facturasRes]) => {
        const pedidos: PedidoApi[] = pedidosRes.data
        const turnosLista: TurnoApi[] = turnosRes.data.data
        const facturasLista: FacturaApi[] = facturasRes.data.data
        const cajeroDeTurno = new Map<number, string>(turnosLista.map(t => [
          t.id_turno,
          `${t.usuario?.nombre ?? ''} ${t.usuario?.apellido ?? ''}`.trim() || '—',
        ]))
        const eventos: EventoHistorial[] = [
          ...pedidos.map(p => ({
            fecha: p.Fecha_hora,
            usuario: p.nombre_mesero ?? '—',
            accion: `Creó el pedido #${p.id_pedido} · ${p.Mesa_num ? `Mesa ${p.Mesa_num}` : (p.Tipo_pedido ?? 'Sin mesa')}`,
          })),
          ...turnosLista.flatMap(t => {
            const caja = t.caja?.nombre ?? `caja ${t.id_caja}`
            const cajero = cajeroDeTurno.get(t.id_turno) ?? '—'
            const movimientos: EventoHistorial[] = [{ fecha: t.fecha_apertura, usuario: cajero, accion: `Abrió turno en ${caja}` }]
            if (t.fecha_cierre) movimientos.push({ fecha: t.fecha_cierre, usuario: cajero, accion: `Cerró turno en ${caja}` })
            return movimientos
          }),
          ...facturasLista.flatMap(f => (f.pago ?? []).map(p => ({
            fecha: p.fecha_pago,
            usuario: p.id_turno != null ? (cajeroDeTurno.get(p.id_turno) ?? '—') : '—',
            accion: `Registró pago de ${formatoCOP.format(Number(p.monto ?? 0))} (${etiquetaMetodo(p.metodo)}) · factura #${p.id_factura ?? '—'}`,
          }))),
        ]
        setHistorial(eventos
          .sort((a, b) => new Date(b.fecha ?? 0).getTime() - new Date(a.fecha ?? 0).getTime())
          .slice(0, 50))
      })
      .catch(console.error)
  }, [seccionActiva])

  const recargarTurnos = () => {
    api.get('/turnos')
      .then(({ data }: { data: { data: TurnoApi[] } }) => setTurnos(data.data))
      .catch(console.error)
  }

  useEffect(() => {
    if (seccionActiva !== 'Turnos') return
    api.get('/turnos')
      .then(({ data }: { data: { data: TurnoApi[] } }) => setTurnos(data.data))
      .catch(console.error)
    api.get('/cajas').then(r => setCajas(r.data)).catch(console.error)
    api.get('/usuarios')
      .then(({ data }: { data: Personal[] }) => setCajeros(data.filter(u => u.rol === 'CAJERO' && u.activo === 1)))
      .catch(console.error)
  }, [seccionActiva])

  const abrirTurno = async () => {
    const efectivo = Number(formAbrir.efectivo_inicial)
    if (!formAbrir.id_caja || !formAbrir.id_usuario_cajero || formAbrir.efectivo_inicial === '' || Number.isNaN(efectivo) || efectivo < 0) {
      setErrorTurno('Completa caja, cajero y efectivo inicial (0 o más)')
      return
    }
    const idCaja = Number(formAbrir.id_caja)
    const idCajero = Number(formAbrir.id_usuario_cajero)
    if (turnos.some(t => t.estado === 'ABIERTA' && (t.id_caja === idCaja || t.id_usuario_cajero === idCajero))) {
      setErrorTurno('La caja o el cajero ya tiene un turno abierto')
      return
    }
    try {
      await api.post('/turnos', { id_caja: idCaja, id_usuario_cajero: idCajero, efectivo_inicial: efectivo, estado: 'ABIERTA' })
      setMostrarAbrirTurno(false)
      setFormAbrir({ id_caja: '', id_usuario_cajero: '', efectivo_inicial: '' })
      setErrorTurno('')
      recargarTurnos()
    } catch {
      setErrorTurno('No se pudo abrir el turno')
    }
  }

  const nombreEmpleado = (t: TurnoApi) => `${t.usuario?.nombre ?? ''} ${t.usuario?.apellido ?? ''}`.trim() || '—'
  const horaTurno = (fecha: string | null) =>
    fecha ? new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '—'
  const turnoParaCerrar = turnos.find(t => t.id_turno === turnoCerrando) ?? null

  const cerrarTurno = async (t: TurnoApi) => {
    const contado = Number(efectivoContado)
    if (efectivoContado === '' || Number.isNaN(contado) || contado < 0) {
      setErrorTurno('Ingresa el efectivo contado (0 o más)')
      return
    }
    try {
      await api.post(`/turnos/${t.id_turno}/cerrar`, { efectivo_real: contado, notas: notasCierre || null })
      setTurnoCerrando(null)
      setEfectivoContado('')
      setNotasCierre('')
      setErrorTurno('')
      recargarTurnos()
    } catch (error) {
      const mensaje = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      setErrorTurno(mensaje ?? 'No se pudo cerrar el turno')
      recargarTurnos()
    }
  }

  const monedaTurno = (valor: string | number | null) =>
    valor === null || valor === undefined ? '—' : formatoCOP.format(Number(valor))

  const etiquetaDemo = (
    <span className="rounded-full bg-[var(--t-bg-f0ebe5,#f0ebe5)] px-2 py-0.5 text-[0.65rem] text-[var(--texto-muted)]">Demo</span>
  )

  const cargarProductos = () => {
    const endpoint = fuenteProductos === 'vista' ? '/productos/vista' : '/productos/sp'
    setCargandoProductos(true)
    api.get(endpoint).then(res => setProductos(res.data)).catch(console.error).finally(() => setCargandoProductos(false))
  }
  useEffect(() => { cargarProductos() }, [fuenteProductos])
  useEffect(() => { if (seccionActiva === 'Inventario') api.get('/ingredientes').then(r => setIngredientes(r.data)).catch(console.error) }, [seccionActiva])
  useEffect(() => { if (seccionActiva === 'Proveedores') api.get('/proveedores').then(r => setProveedores(r.data)).catch(console.error) }, [seccionActiva])
  useEffect(() => { if (seccionActiva === 'Flujo de Caja') api.get('/cajas').then(r => setCajas(r.data)).catch(console.error) }, [seccionActiva])
  useEffect(() => { if (seccionActiva === 'Personal') cargarPersonal() }, [seccionActiva])
  const cargarPersonal = async () => {
    try {
      setCargandoPersonal(true)
      const { data } = await api.get('/usuarios')
      setPersonal(data.filter((usuario: Personal) => usuario.id_rol !== 1 && usuario.id_rol !== 2))
    } catch {
      setErrorPersonal('Error al cargar personal')
    } finally {
      setCargandoPersonal(false)
    }
  }
  const editarUsuario = (usuario: Personal) => {
    setUsuarioEditando(usuario)
    setFormData({ nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, id_rol: usuario.id_rol, contrasena: '' })
    setErrorPersonal(null)
  }
  const eliminarUsuario = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    try { await api.delete(`/usuarios/${id}`); await cargarPersonal() } catch { setErrorPersonal('No se pudo eliminar el usuario') }
  }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.id_rol) { setErrorPersonal('Selecciona un rol'); return }
    setGuardandoPersonal(true)
    setErrorPersonal(null)
    try {
      const datos = { ...formData, id_rol: Number(formData.id_rol), ...(formData.contrasena ? { contrasena: formData.contrasena } : {}) }
      if (usuarioEditando) await api.put(`/usuarios/${usuarioEditando.id_usuario}`, datos)
      else await api.post('/usuarios', { ...datos, id_restaurante: user?.id_restaurante })
      setFormData(personalVacio)
      setUsuarioEditando(null)
      setMostrarContrasena(false)
      await cargarPersonal()
    } catch (err: any) {
      setErrorPersonal(err.response?.data?.message ?? 'No se pudo guardar el usuario')
    } finally { setGuardandoPersonal(false) }
  }
  const abrirCrearProducto = () => { setModoEdicionProducto(false); setProductoActual(productoVacio); setIdEditandoProducto(null); setErrorProducto(null); setModalProducto(true) }
  const abrirEditarProducto = (p: Producto) => { setModoEdicionProducto(true); setProductoActual({ Nombre: p.Nombre, Descripcion: p.Descripcion, precio_venta: p.precio_venta, Categoria: p.Categoria, Tiempo_preparacion: p.Tiempo_preparacion, Estado: p.Estado }); setIdEditandoProducto(p.id_producto); setErrorProducto(null); setModalProducto(true) }
  const guardarProducto = async () => {
    if (!productoActual.Nombre.trim()) { setErrorProducto('El nombre es obligatorio'); return }
    if (!productoActual.precio_venta) { setErrorProducto('El precio es obligatorio'); return }
    setGuardandoProducto(true); setErrorProducto(null)
    try {
      modoEdicionProducto && idEditandoProducto ? await api.put(`/productos/${idEditandoProducto}`, productoActual) : await api.post('/productos', productoActual)
      setModalProducto(false); cargarProductos()
    } catch (err: any) { setErrorProducto(err.response?.data?.message ?? 'Error al guardar') }
    finally { setGuardandoProducto(false) }
  }
  const toggleProducto = async (id: number, estado: number) => {
    if (!confirm(`¿Deseas ${estado ? 'desactivar' : 'activar'} este producto?`)) return
    try { await api.delete(`/productos/${id}`); cargarProductos() } catch { alert('Error') }
  }
  const abrirCrearIngrediente = () => { setModoEdicionIngrediente(false); setIngredienteActual(ingredienteVacio); setIdEditandoIngrediente(null); setErrorIngrediente(null); setModalIngrediente(true) }
  const abrirEditarIngrediente = (i: Ingrediente) => { setModoEdicionIngrediente(true); setIngredienteActual({ nombre: i.nombre, descripcion: i.descripcion, unidad_medida: i.unidad_medida, costo_unitario_ref: i.costo_unitario_ref, stock_minimo: i.stock_minimo }); setIdEditandoIngrediente(i.id_ingrediente); setErrorIngrediente(null); setModalIngrediente(true) }
  const guardarIngrediente = async () => {
    if (!ingredienteActual.nombre.trim()) { setErrorIngrediente('El nombre es obligatorio'); return }
    setGuardandoIngrediente(true); setErrorIngrediente(null)
    try {
      modoEdicionIngrediente && idEditandoIngrediente ? await api.put(`/ingredientes/${idEditandoIngrediente}`, ingredienteActual) : await api.post('/ingredientes', ingredienteActual)
      setModalIngrediente(false); api.get('/ingredientes').then(r => setIngredientes(r.data))
    } catch (err: any) { setErrorIngrediente(err.response?.data?.message ?? 'Error al guardar') }
    finally { setGuardandoIngrediente(false) }
  }
  const eliminarIngrediente = async (id: number) => {
    if (!confirm('¿Eliminar este ingrediente?')) return
    try { await api.delete(`/ingredientes/${id}`); api.get('/ingredientes').then(r => setIngredientes(r.data)) } catch { alert('Error al eliminar') }
  }
  const abrirCrearProveedor = () => { setModoEdicionProveedor(false); setProveedorActual(proveedorVacio); setIdEditandoProveedor(null); setErrorProveedor(null); setModalProveedor(true) }
  const abrirEditarProveedor = (p: Proveedor) => { setModoEdicionProveedor(true); setProveedorActual({ nombre: p.nombre, nombre_contacto: p.nombre_contacto, telefono: p.telefono, email: p.email, direccion: p.direccion, nit: p.nit, tipo_proveedor: p.tipo_proveedor, estado: p.estado }); setIdEditandoProveedor(p.id_proveedor); setErrorProveedor(null); setModalProveedor(true) }
  const guardarProveedor = async () => {
    if (!proveedorActual.nombre.trim()) { setErrorProveedor('El nombre es obligatorio'); return }
    setGuardandoProveedor(true); setErrorProveedor(null)
    try {
      modoEdicionProveedor && idEditandoProveedor ? await api.put(`/proveedores/${idEditandoProveedor}`, proveedorActual) : await api.post('/proveedores', proveedorActual)
      setModalProveedor(false); api.get('/proveedores').then(r => setProveedores(r.data))
    } catch (err: any) { setErrorProveedor(err.response?.data?.message ?? 'Error al guardar') }
    finally { setGuardandoProveedor(false) }
  }
  const toggleProveedor = async (id: number, estado: string) => {
    const nuevo = estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    if (!confirm(`¿Deseas ${nuevo === 'INACTIVO' ? 'desactivar' : 'activar'} este proveedor?`)) return
    try { await api.delete(`/proveedores/${id}`); api.get('/proveedores').then(r => setProveedores(r.data)) } catch { alert('Error') }
  }
  const abrirCrearCaja = () => { setModoEdicionCaja(false); setCajaActual(cajaVacia); setIdEditandoCaja(null); setErrorCaja(null); setModalCaja(true) }
  const abrirEditarCaja = (c: Caja) => { setModoEdicionCaja(true); setCajaActual({ nombre: c.nombre, estado: c.estado }); setIdEditandoCaja(c.id_caja); setErrorCaja(null); setModalCaja(true) }
  const guardarCaja = async () => {
    if (!cajaActual.nombre.trim()) { setErrorCaja('El nombre es obligatorio'); return }
    setGuardandoCaja(true); setErrorCaja(null)
    try {
      modoEdicionCaja && idEditandoCaja ? await api.put(`/cajas/${idEditandoCaja}`, cajaActual) : await api.post('/cajas', cajaActual)
      setModalCaja(false); api.get('/cajas').then(r => setCajas(r.data))
    } catch (err: any) { setErrorCaja(err.response?.data?.message ?? 'Error al guardar') }
    finally { setGuardandoCaja(false) }
  }
  const toggleCaja = async (id: number, estado: string) => {
    if (!confirm(`¿Deseas ${estado === 'ACTIVA' ? 'desactivar' : 'activar'} esta caja?`)) return
    try { await api.delete(`/cajas/${id}`); api.get('/cajas').then(r => setCajas(r.data)) } catch { alert('Error') }
  }
  return (
    <div className="flex min-h-screen bg-[var(--bg)] font-['DM_Sans']">
      <Sidebar
        subtitulo="Gerente"
        menuItems={menuItems}
        vistaActual={vistaActual}
        onNavigate={setVistaActual}
        onLogout={() => { logout(); navigate('/') }}
        footer={<button type="button" onClick={() => setVistaActual('turnos')} className="mb-2 rounded-[10px] bg-[var(--rojo)] px-2.5 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white">Cerrar Caja</button>}
      />
      <main className="flex min-w-0 flex-1 flex-col gap-8 p-4 pt-20 md:p-8">
        <Header seccionActiva={seccionActiva} nombreUsuario={[user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Gerente'} />
        {/* MENÚ — Dashboard principal */}
        {seccionActiva === 'Menú' && (
          <>
            <DashboardOperativo />
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {metricasDashboard.map(m => (
                <MetricCard
                  key={m.label}
                  label={m.label}
                  value={m.valor}
                  detail={m.badge}
                  icon={m.icon}
                  color={m.badgeColor === 'verde' ? 'green' : m.badgeColor === 'rojo' ? 'red' : 'default'}
                />
              ))}
            </section>
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-7 shadow-[var(--sombra)]">
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <h3 className="font-['Syne'] text-[1.1rem] font-bold text-[var(--texto)]">Tendencia semanal</h3>
                    <p className="mt-0.5 text-[0.8rem] text-[var(--texto-muted)]">Ingresos de los últimos 7 días</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-[var(--amarillo)]">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-current"></span>Real
                    </span>
                  </div>
                </div>
                <div className="flex h-40 items-end justify-between gap-2">
                  {tendenciaSemanal.map(b => (
                    <div key={b.dia} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                      <div
                        className="w-full rounded-t-[6px] bg-[var(--rojo)] opacity-85 transition-[height] duration-300 ease-in-out"
                        style={{ height: `${b.alto}%` }}
                      ></div>
                      <span className="text-[0.65rem] font-semibold text-[var(--texto-muted)]">{b.dia}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-5 shadow-[var(--sombra)]">
                  <h4 className="mb-3 font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">Acciones rápidas</h4>
                  <div className="flex flex-col gap-2">
                    <button className="flex items-center justify-between rounded-[10px] bg-[var(--rojo)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-white">
                      Nuevo Pedido
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                    <button className="flex items-center justify-between rounded-[10px] border border-[var(--borde)] bg-[var(--t-bg-f9f5f0,#f9f5f0)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-[var(--texto-muted)]">
                      Control de Menú
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-5 shadow-[var(--sombra)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">Estado inventario</h4>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    {estadoInventario.map(i => (
                      <div key={i.nombre}>
                        <div className="mb-1 flex justify-between">
                          <span className="text-[0.75rem] font-medium text-[var(--texto-muted)]">{i.nombre}</span>
                          <span className={`text-[0.75rem] font-bold ${
                            i.color === 'verde' ? 'text-[var(--verde)]' :
                            i.color === 'rojo' ? 'text-[var(--rojo)]' : 'text-[var(--t-txt-ba7517,#BA7517)]'
                          }`}>{i.etiqueta}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--t-bg-f0ebe5,#f0ebe5)]">
                          <div
                            className={`h-full rounded-full ${
                              i.color === 'verde' ? 'bg-[var(--verde)]' :
                              i.color === 'rojo' ? 'bg-[var(--rojo)]' : 'bg-[var(--amarillo)]'
                            }`}
                            style={{ width: `${i.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Listado de Productos</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className={`rounded-[10px] border border-[var(--borde)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold ${
                      fuenteProductos === 'vista' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' : 'bg-[var(--t-bg-f9f5f0,#f9f5f0)] text-[var(--texto-muted)]'
                    }`}
                    onClick={() => setFuenteProductos('vista')}
                  >
                    Vista SQL
                  </button>
                  <button
                    className={`rounded-[10px] border border-[var(--borde)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold ${
                      fuenteProductos === 'sp' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' : 'bg-[var(--t-bg-f9f5f0,#f9f5f0)] text-[var(--texto-muted)]'
                    }`}
                    onClick={() => setFuenteProductos('sp')}
                  >
                    Procedimiento
                  </button>
                  <button
                    className="rounded-[10px] bg-[var(--rojo)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
                    onClick={abrirCrearProducto}
                  >
                    + Nuevo Producto
                  </button>
                </div>
              </div>
              {cargandoProductos ? (
                <p className="text-[0.85rem] text-[var(--texto-muted)]">Cargando...</p>
              ) : (
                <DataTable
                  columns={[
                    { header: 'Nombre', render: (p) => <strong>{p.Nombre}</strong> },
                    { header: 'Descripción', render: (p) => p.Descripcion },
                    { header: 'Precio', render: (p) => `$${Number(p.precio_venta).toLocaleString('es-CO')}` },
                    { header: 'Categoría', render: (p) => p.Categoria },
                    { header: 'Tiempo prep.', render: (p) => p.Tiempo_preparacion },
                    {
                      header: 'Estado',
                      render: (p) => (
                        <span className={p.Estado ? 'text-[var(--verde)]' : 'text-[var(--rojo)]'}>{p.Estado ? 'Activo' : 'Inactivo'}</span>
                      ),
                    },
                    {
                      header: 'Acciones',
                      render: (p) => (
                        <div className="flex gap-2">
                          <button className="rounded-[10px] border border-[var(--borde)] bg-[var(--t-bg-f9f5f0,#f9f5f0)] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]" onClick={() => abrirEditarProducto(p)}>Editar</button>
                          <button
                            className={`rounded-[10px] px-3 py-1.5 text-[0.8rem] font-semibold ${
                              p.Estado ? 'bg-transparent text-[var(--texto-muted)]' : 'bg-[var(--rojo)] text-white'
                            }`}
                            onClick={() => toggleProducto(p.id_producto, p.Estado)}
                          >
                            {p.Estado ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      ),
                    },
                  ]}
                  data={productos}
                  emptyMessage="Sin productos"
                  keyExtractor={(p) => p.id_producto}
                />
              )}
            </section>
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-7 shadow-[var(--sombra)]">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Estado de mesas</h3>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-[var(--texto-muted)]">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-current"></span>Disponible
                    </span>
                    <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-[var(--amarillo)]">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-current"></span>Ocupada
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2.5">
                  {mesas.map(m => (
                    <div
                      key={m.id}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 ${
                        m.ocupada
                          ? 'border-[rgba(239,159,39,0.3)] bg-[var(--amarillo-light)]'
                          : 'border-[rgba(29,158,117,0.3)] bg-[var(--verde-light)]'
                      }`}
                    >
                      <span className="text-[0.65rem] font-bold text-[var(--texto-muted)]">{m.id}</span>
                      <span className={`material-symbols-outlined text-[16px] ${m.ocupada ? 'text-[var(--amarillo)]' : 'text-[var(--verde)]'}`}>
                        {m.ocupada ? 'person' : 'check_circle'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-7 shadow-[var(--sombra)]">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Movimientos recientes</h3>
                  <button className="border-none bg-transparent text-[0.75rem] font-semibold text-[var(--rojo)]">Ver todo</button>
                </div>
                <div className="flex flex-col gap-4">
                  {movimientosRecientes.map((mov, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full ${
                          mov.positivo ? 'bg-[var(--verde-light)] text-[var(--verde)]' : 'bg-[var(--rojo-light)] text-[var(--rojo)]'
                        }`}>
                          <span className="material-symbols-outlined text-[18px]">{mov.icon}</span>
                        </div>
                        <div>
                          <p className="text-[0.82rem] font-semibold text-[var(--texto)]">{mov.titulo}</p>
                          <p className="text-[0.72rem] text-[var(--texto-muted)]">{mov.sub}</p>
                        </div>
                      </div>
                      <span className={`whitespace-nowrap text-[0.85rem] font-bold ${mov.positivo ? 'text-[var(--verde)]' : 'text-[var(--rojo)]'}`}>{mov.monto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
        {/* INVENTARIO — CRUD Ingredientes */}
        {seccionActiva === 'Inventario' && (
          <IngredientesSection
            ingredientes={ingredientes}
            onCreate={abrirCrearIngrediente}
            onEdit={abrirEditarIngrediente}
            onDelete={eliminarIngrediente}
          />
        )}
        {/* PROVEEDORES — CRUD */}
        {seccionActiva === 'Proveedores' && <ProveedoresSection proveedores={proveedores} onCreate={abrirCrearProveedor} onEdit={abrirEditarProveedor} onToggle={toggleProveedor} />}
        {/* FLUJO DE CAJA — CRUD Cajas */}
        {seccionActiva === 'Flujo de Caja' && <CajasSection cajas={cajas} onCreate={abrirCrearCaja} onEdit={abrirEditarCaja} onToggle={toggleCaja} />}
        {/* FINANZAS — pagos aprobados y compras de la base */}
        {seccionActiva === 'Finanzas' && (
          <FinanzasSection
            stats={[
              {
                icon: 'trending_up',
                label: 'Ventas del mes',
                valor: ingresosDelMes === null ? '...' : formatoCOP.format(ingresosDelMes),
                badge: 'Pagos aprobados',
                badgeColor: 'verde',
              },
              {
                ...finanzasStats[1],
                valor: gastosMes === null ? '...' : formatoCOP.format(gastosMes),
                badge: 'Compras del mes',
                badgeColor: 'rojo',
              },
              {
                ...finanzasStats[2],
                valor: ingresosDelMes === null || gastosMes === null ? '...' : formatoCOP.format(ingresosDelMes - gastosMes),
                badge: 'Ingresos − gastos',
                badgeColor: 'muted',
              },
            ]}
            transacciones={[...pagosAprobados]
              .sort((a, b) => new Date(b.fecha_pago ?? 0).getTime() - new Date(a.fecha_pago ?? 0).getTime())
              .slice(0, 10)
              .map(p => ({
                fecha: p.fecha_pago
                  ? new Date(p.fecha_pago).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
                  : '—',
                concepto: `Pago ${etiquetaMetodo(p.metodo)} · factura ${p.id_factura ?? '—'}`,
                categoria: 'Ingreso',
                monto: `+${formatoCOP.format(Number(p.monto ?? 0))}`,
                positivo: true,
              }))}
          />
        )}
        {/* PEDIDOS — pedidos en curso desde la base */}
        {seccionActiva === 'Pedidos' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <h3 className="mb-5 font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Pedidos activos</h3>
            <div className="flex flex-col gap-3">
              {pedidosEnCurso.length === 0 && (
                <p className="text-[0.85rem] text-[var(--texto-muted)]">No hay pedidos en curso.</p>
              )}
              {pedidosEnCurso.map(p => {
                const estado = etiquetaEstadoPedido[p.estado] ?? p.estado
                return (
                  <div key={p.id_pedido} className="flex items-center justify-between rounded-xl border border-[var(--borde)] bg-[var(--t-bg-f9f5f0,#f9f5f0)] px-4 py-3">
                    <div className="flex items-center gap-4">
                      <span className="font-['Syne'] text-[0.9rem] font-bold text-[var(--texto-muted)]">#{p.id_pedido}</span>
                      <div>
                        <p className="text-[0.85rem] font-semibold text-[var(--texto)]">
                          {p.Mesa_num ? `Mesa ${p.Mesa_num}` : (p.Tipo_pedido || 'Pedido')}
                        </p>
                        <p className="text-[0.78rem] text-[var(--texto-muted)]">
                          {p.nombre_mesero ? `Atendió: ${p.nombre_mesero}` : 'Sin mesero asignado'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[0.75rem] text-[var(--texto-muted)]">{tiempoDesde(p.Fecha_hora)}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                        estado === 'Preparando' ? 'bg-[var(--amarillo-light)] text-[var(--t-txt-854f0b,#854F0B)]' :
                        estado === 'Listo' ? 'bg-[var(--verde-light)] text-[var(--t-txt-0f6e56,#0F6E56)]' :
                        'bg-[var(--t-bg-f0ebe5,#f0ebe5)] text-[var(--texto-muted)]'
                      }`}>{estado}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
        {/* MESAS — estado de mesas desde la base */}
        {seccionActiva === 'Mesas' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Estado de mesas</h3>
              <div className="flex gap-3">
                <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-[var(--texto-muted)]">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-current"></span>Disponible
                </span>
                <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-[var(--amarillo)]">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-current"></span>Ocupada
                </span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2.5">
              {mesas.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 ${
                    m.ocupada
                      ? 'border-[rgba(239,159,39,0.3)] bg-[var(--amarillo-light)]'
                      : 'border-[rgba(29,158,117,0.3)] bg-[var(--verde-light)]'
                  }`}
                >
                  <span className="text-[0.65rem] font-bold text-[var(--texto-muted)]">{m.id}</span>
                  <span className={`material-symbols-outlined text-[16px] ${m.ocupada ? 'text-[var(--amarillo)]' : 'text-[var(--verde)]'}`}>
                    {m.ocupada ? 'person' : 'check_circle'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* IA INSIGHTS — vista con datos de ejemplo */}
        {seccionActiva === 'IA Insights' && (
          <section className="mt-6 grid grid-cols-2 gap-4">
            <div className="col-span-2 flex justify-end">{etiquetaDemo}</div>
            {iaInsights.map((insight, i) => (
              <div key={i} className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-[var(--sombra)]">
                <div className="mb-3 flex items-center gap-3">
                  <span className={`material-symbols-outlined rounded-[10px] p-2 text-[22px] ${
                    insight.tono === 'verde' ? 'bg-[var(--verde-light)] text-[var(--verde)]' :
                    insight.tono === 'rojo' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' :
                    insight.tono === 'amarillo' ? 'bg-[var(--amarillo-light)] text-[var(--t-txt-854f0b,#854F0B)]' :
                    'bg-[var(--t-bg-f0ebe5,#f0ebe5)] text-[var(--texto-muted)]'
                  }`}>{insight.icon}</span>
                  <h4 className="font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">{insight.titulo}</h4>
                </div>
                <p className="text-[0.85rem] leading-[1.6] text-[var(--texto-muted)]">{insight.detalle}</p>
              </div>
            ))}
          </section>
        )}
        {/* HISTORIAL — pedidos, pagos y turnos de la base */}
        {seccionActiva === 'Historial' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <h3 className="mb-2 font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Historial de actividad</h3>
            <p className="mb-5 text-[0.78rem] text-[var(--texto-muted)]">Pedidos, pagos y turnos registrados en la base. No incluye ediciones ni borrados.</p>
            <div className="flex flex-col gap-4">
              {historial.length === 0 && (
                <p className="text-[0.85rem] text-[var(--texto-muted)]">No hay actividad registrada.</p>
              )}
              {historial.map((h, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-[var(--borde)] pb-4 last:border-b-0 last:pb-0">
                  <span className="material-symbols-outlined mt-0.5 text-[18px] text-[var(--texto-muted)]">history</span>
                  <div>
                    <p className="text-[0.85rem] text-[var(--texto)]">{h.accion}</p>
                    <p className="mt-0.5 text-[0.75rem] text-[var(--texto-muted)]">
                      {h.usuario} · {h.fecha ? new Date(h.fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {seccionActiva === 'Personal' && (
          <PersonalSection
            personal={personal}
            formData={formData}
            usuarioEditando={usuarioEditando}
            errorPersonal={errorPersonal}
            guardandoPersonal={guardandoPersonal}
            cargandoPersonal={cargandoPersonal}
            mostrarContrasena={mostrarContrasena}
            onFormSubmit={handleSubmit}
            onFormChange={(field, value) => setFormData(current => ({ ...current, [field]: value }))}
            onEdit={editarUsuario}
            onDelete={eliminarUsuario}
            onCancelEdit={() => { setUsuarioEditando(null); setFormData(personalVacio); setErrorPersonal(null) }}
            onTogglePassword={() => setMostrarContrasena(current => !current)}
          />
        )}
        {/* TURNOS — apertura y cierre de caja con datos de la base */}
        {seccionActiva === 'Turnos' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Turnos de caja</h3>
              <button
                type="button"
                onClick={() => { setMostrarAbrirTurno(v => !v); setErrorTurno('') }}
                className="rounded-xl bg-[var(--texto)] px-4 py-2 text-[0.85rem] font-semibold text-white"
              >
                {mostrarAbrirTurno ? 'Cancelar' : 'Abrir turno'}
              </button>
            </div>
            {mostrarAbrirTurno && (
              <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-[var(--borde)] p-4 md:grid-cols-4">
                <select
                  value={formAbrir.id_caja}
                  onChange={e => setFormAbrir({ ...formAbrir, id_caja: e.target.value })}
                  className="rounded-lg border border-[var(--borde)] bg-white px-3 py-2 text-[0.85rem] text-[var(--texto)]"
                >
                  <option value="">Caja</option>
                  {cajas.filter(c => c.estado === 'ACTIVA').map(c => (
                    <option key={c.id_caja} value={c.id_caja}>{c.nombre}</option>
                  ))}
                </select>
                <select
                  value={formAbrir.id_usuario_cajero}
                  onChange={e => setFormAbrir({ ...formAbrir, id_usuario_cajero: e.target.value })}
                  className="rounded-lg border border-[var(--borde)] bg-white px-3 py-2 text-[0.85rem] text-[var(--texto)]"
                >
                  <option value="">Cajero</option>
                  {cajeros.map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} {u.apellido}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  placeholder="Efectivo inicial"
                  value={formAbrir.efectivo_inicial}
                  onChange={e => setFormAbrir({ ...formAbrir, efectivo_inicial: e.target.value })}
                  className="rounded-lg border border-[var(--borde)] bg-white px-3 py-2 text-[0.85rem] text-[var(--texto)]"
                />
                <button type="button" onClick={abrirTurno} className="rounded-lg bg-[var(--verde)] px-4 py-2 text-[0.85rem] font-semibold text-white">
                  Confirmar apertura
                </button>
              </div>
            )}
            {errorTurno && turnoCerrando === null && <p className="mb-4 text-[0.85rem] text-[var(--rojo-dark)]">{errorTurno}</p>}
              <DataTable
                columns={[
                  { header: 'Empleado', render: (t) => <strong>{nombreEmpleado(t)}</strong> },
                  {
                    header: 'Rol',
                    render: (t) => <span className="text-[var(--texto-muted)]">Cajero{t.caja?.nombre ? ` · ${t.caja.nombre}` : ''}</span>,
                  },
                  {
                    header: 'Turno',
                    render: (t) => (
                      <span className="text-[var(--texto-muted)]">
                        {horaTurno(t.fecha_apertura)} - {t.fecha_cierre ? horaTurno(t.fecha_cierre) : 'En curso'}
                      </span>
                    ),
                  },
                  {
                    header: 'Estado',
                    render: (t) => (
                      <span className={`font-semibold ${t.estado === 'ABIERTA' ? 'text-[var(--verde)]' : 'text-[var(--t-txt-854f0b,#854F0B)]'}`}>
                        {t.estado === 'ABIERTA' ? 'Activo' : 'Cerrado'}
                        {t.estado !== 'ABIERTA' && (
                          <span className="block text-[0.75rem] font-normal text-[var(--texto-muted)]">
                            Esperado {monedaTurno(t.efectivo_esperado)} · Diferencia {monedaTurno(t.diferencia)}
                          </span>
                        )}
                      </span>
                    ),
                  },
                  {
                    header: 'Acciones',
                    render: (t) =>
                      t.estado === 'ABIERTA' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTurnoCerrando(t.id_turno)
                            setEfectivoContado('')
                            setNotasCierre('')
                            setErrorTurno('')
                          }}
                          className="rounded-lg border border-[var(--borde)] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto)]"
                        >
                          Cerrar turno
                        </button>
                      ) : (
                        '—'
                      ),
                  },
                ]}
                data={turnos}
                emptyMessage="No hay turnos registrados."
                keyExtractor={(t) => t.id_turno}
              />

              <Modal isOpen={turnoParaCerrar !== null} onClose={() => setTurnoCerrando(null)}>
                {turnoParaCerrar && (
                  <div className="px-6 pb-6">
                    <h3 className="mb-1 font-bold">Cerrar turno</h3>
                    <p className="mb-5 text-[0.85rem] text-[var(--texto-muted)]">
                      {nombreEmpleado(turnoParaCerrar)}
                      {turnoParaCerrar.caja?.nombre ? ` · ${turnoParaCerrar.caja.nombre}` : ''}
                    </p>
                    {errorTurno && <p className="mb-4 text-[0.85rem] text-[var(--rojo-dark)]">{errorTurno}</p>}
                    <div className="flex flex-col gap-3">
                      <InputField
                        label="Efectivo contado"
                        type="number"
                        min="0"
                        value={efectivoContado}
                        onChange={e => setEfectivoContado(e.target.value)}
                      />
                      <InputField
                        label="Notas"
                        maxLength={500}
                        value={notasCierre}
                        onChange={e => setNotasCierre(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => cerrarTurno(turnoParaCerrar)}
                        className="mt-2 rounded-lg bg-[var(--rojo-dark)] px-4 py-2 text-[0.85rem] font-semibold text-white"
                      >
                        Confirmar cierre
                      </button>
                    </div>
                  </div>
                )}
              </Modal>
          </section>
        )}
      </main>
      <GerenteModals
        producto={productoActual}
        ingrediente={ingredienteActual}
        proveedor={proveedorActual}
        caja={cajaActual}
        productoOpen={modalProducto}
        ingredienteOpen={modalIngrediente}
        proveedorOpen={modalProveedor}
        cajaOpen={modalCaja}
        editProducto={modoEdicionProducto}
        editIngrediente={modoEdicionIngrediente}
        editProveedor={modoEdicionProveedor}
        editCaja={modoEdicionCaja}
        savingProducto={guardandoProducto}
        savingIngrediente={guardandoIngrediente}
        savingProveedor={guardandoProveedor}
        savingCaja={guardandoCaja}
        errorProducto={errorProducto}
        errorIngrediente={errorIngrediente}
        errorProveedor={errorProveedor}
        errorCaja={errorCaja}
        setProducto={setProductoActual}
        setIngrediente={setIngredienteActual}
        setProveedor={setProveedorActual}
        setCaja={setCajaActual}
        closeProducto={() => setModalProducto(false)}
        closeIngrediente={() => setModalIngrediente(false)}
        closeProveedor={() => setModalProveedor(false)}
        closeCaja={() => setModalCaja(false)}
        submitProducto={guardarProducto}
        submitIngrediente={guardarIngrediente}
        submitProveedor={guardarProveedor}
        submitCaja={guardarCaja}
      />
    </div>
  )
}
export default Gerente