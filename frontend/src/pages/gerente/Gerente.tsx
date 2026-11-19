import './Gerente.css'
import { mensajeError } from '../../utils/mensajeError'
import { useState } from 'react'
import { Banknote, Boxes, Clock3, History, Landmark, ShoppingCart, Sparkles, Table2, Truck, Users, Utensils } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import api from '../../api/axios'
import PersonalSection, { type ErrorPersonal } from './sections/PersonalSection'
import IngredientesSection from './sections/IngredientesSection'
import FinanzasSection from './sections/FinanzasSection'
import ProveedoresSection from './sections/ProveedoresSection'
import CajasSection from './sections/CajasSection'
import Header from '../../components/layout/Header'
import Sidebar from '../../components/layout/Sidebar'
import { DataTable } from '../../components/common/DataTable'
import { InputField } from '../../components/common/InputField'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { MetricCard } from '../../components/common/MetricCard'
import GerenteModals from './components/GerenteModals'
import DashboardOperativo from './components/DashboardOperativo'
import type { Caja, Personal, Producto, Proveedor } from './types'
import { etiquetaMesa } from './data'
import { useDatosGerente, formatoCOP, etiquetaMetodo, type TurnoApi, type Lectura } from './useDatosGerente'
import IASection from './sections/IASection'
import MesasSection from './sections/MesasSection'
import RecetaProducto from './components/RecetaProducto'

function EstadoLectura({ consulta, vacio }: { consulta: Lectura; vacio?: string }) {
  if (consulta.error) return <p role="alert" className="text-sm text-[var(--rojo-dark)]">{consulta.error} <button onClick={consulta.cargar}>Reintentar</button></p>
  const mensaje = consulta.data === null ? 'Cargando…' : vacio
  return mensaje ? <p className="col-span-full text-sm text-[var(--texto-muted)]">{mensaje}</p> : null
}

const menuItems = [
  { icon: <Utensils />, label: 'Menú' },
  { icon: <Boxes />, label: 'Inventario' },
  { icon: <Banknote />, label: 'Finanzas' },
  { icon: <ShoppingCart />, label: 'Pedidos' },
  { icon: <Table2 />, label: 'Mesas' },
  { icon: <Sparkles />, label: 'IA Insights' },
  { icon: <Truck />, label: 'Proveedores' },
  { icon: <History />, label: 'Historial' },
  { icon: <Landmark />, label: 'Flujo de Caja' },
  { icon: <Clock3 />, label: 'Turnos' },
  { icon: <Users />, label: 'Personal' },
]

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
const proveedorVacio = {
  nombre: '', nombre_contacto: '', telefono: '', email: '',
  direccion: '', nit: '', tipo_proveedor: '', estado: 'ACTIVO',
}
const cajaVacia = { nombre: '', estado: 'ACTIVA' }
const personalVacio = { nombre: '', apellido: '', email: '', id_rol: '' as number | '' , contrasena: '' }
function Gerente() {
  const [seccionActiva, setSeccionActiva] = useState('Menú')
  const [fuenteProductos, setFuenteProductos] = useState<'vista' | 'sp'>('vista')
  const datos = useDatosGerente(seccionActiva, fuenteProductos)
  const { ingresosDelMes, pagosAprobados, historial, mesas, movimientosRecientes, estadoInventario, tendenciaSemanal } = datos
  const gastosMes = datos.compras.data?.data.gastos_mes ?? null
  const productos = datos.catalogo.data ?? []
  const ingredientes = datos.inventario.data?.data ?? []
  const proveedores = datos.proveedores.data ?? []
  const cajas = datos.cajas.data ?? []
  const turnos = datos.jornadas.data?.data ?? []
  const personal = (datos.usuarios.data ?? []).filter(u => u.id_rol !== 1 && u.id_rol !== 2)
  const cajeros = personal.filter(u => u.rol === 'CAJERO' && u.activo === 1)
  const pedidosEnCurso = (datos.ordenes.data ?? []).filter(p => p.estado !== 'CERRADO' && p.estado !== 'CANCELADO')
  const pedidosActivos = datos.activos.error ? null : datos.activos.data?.data.pedidos_activos
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
  const [receta, setReceta] = useState<Producto | null>(null)
  const [modalProducto, setModalProducto] = useState(false)
  const [modoEdicionProducto, setModoEdicionProducto] = useState(false)
  const [productoActual, setProductoActual] = useState<Omit<Producto, 'id_producto'>>(productoVacio)
  const [idEditandoProducto, setIdEditandoProducto] = useState<number | null>(null)
  const [guardandoProducto, setGuardandoProducto] = useState(false)
  const [errorProducto, setErrorProducto] = useState<string | null>(null)
  const [modalProveedor, setModalProveedor] = useState(false)
  const [modoEdicionProveedor, setModoEdicionProveedor] = useState(false)
  const [proveedorActual, setProveedorActual] = useState(proveedorVacio)
  const [idEditandoProveedor, setIdEditandoProveedor] = useState<number | null>(null)
  const [guardandoProveedor, setGuardandoProveedor] = useState(false)
  const [errorProveedor, setErrorProveedor] = useState<string | null>(null)
  const [modalCaja, setModalCaja] = useState(false)
  const [modoEdicionCaja, setModoEdicionCaja] = useState(false)
  const [cajaActual, setCajaActual] = useState(cajaVacia)
  const [idEditandoCaja, setIdEditandoCaja] = useState<number | null>(null)
  const [guardandoCaja, setGuardandoCaja] = useState(false)
  const [errorCaja, setErrorCaja] = useState<string | null>(null)
  const [formData, setFormData] = useState(personalVacio)
  const [usuarioEditando, setUsuarioEditando] = useState<Personal | null>(null)
  const [errorPersonal, setErrorPersonal] = useState<ErrorPersonal | null>(null)
  const [guardandoPersonal, setGuardandoPersonal] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const metricasDashboard = [
    {
      icon: 'monetization_on',
      label: 'Ingresos del día',
      valor: datos.ingresosHoy === null ? '—' : formatoCOP.format(datos.ingresosHoy),
      badge: datos.semana.error ? 'Error al consultar' : 'Hoy',
      badgeColor: 'muted',
    },
    {
      icon: 'account_balance_wallet',
      label: 'Ventas del mes',
      valor: ingresosDelMes === null ? '—' : formatoCOP.format(ingresosDelMes),
      badge: datos.facturas.error ? 'Error al consultar' : 'Pagos aprobados',
      badgeColor: 'muted',
    },
    {
      icon: 'shopping_bag',
      label: 'Pedidos activos',
      valor: pedidosActivos == null ? '—' : String(pedidosActivos),
      badge: datos.activos.error ? 'Error al consultar' : pedidosActivos == null ? 'Cargando…' : pedidosActivos > 0 ? 'En curso' : 'Sin pedidos',
      badgeColor: pedidosActivos != null && pedidosActivos > 0 ? 'rojo' : 'muted',
    },
  ]

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
      datos.jornadas.cargar()
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
      datos.jornadas.cargar()
    } catch (error) {
      const mensaje = (error as { response?: { data?: { message?: string } } }).response?.data?.message
      setErrorTurno(mensaje ?? 'No se pudo cerrar el turno')
      datos.jornadas.cargar()
    }
  }

  const monedaTurno = (valor: string | number | null) =>
    valor === null || valor === undefined ? '—' : formatoCOP.format(Number(valor))

  const editarUsuario = (usuario: Personal) => {
    setUsuarioEditando(usuario)
    setFormData({ nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, id_rol: usuario.id_rol, contrasena: '' })
    setErrorPersonal(null)
  }
  const eliminarUsuario = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    setErrorPersonal(null)
    try { await api.delete(`/usuarios/${id}`); await datos.usuarios.cargar() } catch { setErrorPersonal({ origen: 'lista', mensaje: 'No se pudo eliminar el usuario' }) }
  }
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.id_rol) { setErrorPersonal({ origen: 'formulario', mensaje: 'Selecciona un rol' }); return }
    setGuardandoPersonal(true)
    setErrorPersonal(null)
    try {
      const campos = { ...formData, id_rol: Number(formData.id_rol), ...(formData.contrasena ? { contrasena: formData.contrasena } : {}) }
      if (usuarioEditando) await api.put(`/usuarios/${usuarioEditando.id_usuario}`, campos)
      else await api.post('/usuarios', campos)
      setFormData(personalVacio)
      setUsuarioEditando(null)
      setMostrarContrasena(false)
      await datos.usuarios.cargar()
    } catch (err) {
      setErrorPersonal({ origen: 'formulario', mensaje: mensajeError(err) })
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
      setModalProducto(false); datos.catalogo.cargar()
    } catch (err) { setErrorProducto(mensajeError(err)) }
    finally { setGuardandoProducto(false) }
  }
  const toggleProducto = async (id: number, estado: number) => {
    if (!confirm(`¿Deseas ${estado ? 'desactivar' : 'activar'} este producto?`)) return
    try { await api.delete(`/productos/${id}`); datos.catalogo.cargar() } catch { alert('Error') }
  }
  const eliminarIngrediente = async (id: number) => {
    if (!confirm('¿Eliminar este ingrediente?')) return
    try { await api.delete(`/ingredientes/${id}`); datos.inventario.cargar() } catch { alert('Error al eliminar') }
  }
  const abrirCrearProveedor = () => { setModoEdicionProveedor(false); setProveedorActual(proveedorVacio); setIdEditandoProveedor(null); setErrorProveedor(null); setModalProveedor(true) }
  const abrirEditarProveedor = (p: Proveedor) => { setModoEdicionProveedor(true); setProveedorActual({ nombre: p.nombre, nombre_contacto: p.nombre_contacto, telefono: p.telefono, email: p.email, direccion: p.direccion, nit: p.nit, tipo_proveedor: p.tipo_proveedor, estado: p.estado }); setIdEditandoProveedor(p.id_proveedor); setErrorProveedor(null); setModalProveedor(true) }
  const guardarProveedor = async () => {
    if (!proveedorActual.nombre.trim()) { setErrorProveedor('El nombre es obligatorio'); return }
    setGuardandoProveedor(true); setErrorProveedor(null)
    try {
      modoEdicionProveedor && idEditandoProveedor ? await api.put(`/proveedores/${idEditandoProveedor}`, proveedorActual) : await api.post('/proveedores', proveedorActual)
      setModalProveedor(false); datos.proveedores.cargar()
    } catch (err) { setErrorProveedor(mensajeError(err)) }
    finally { setGuardandoProveedor(false) }
  }
  const toggleProveedor = async (id: number, estado: string) => {
    const nuevo = estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    if (!confirm(`¿Deseas ${nuevo === 'INACTIVO' ? 'desactivar' : 'activar'} este proveedor?`)) return
    try { await api.delete(`/proveedores/${id}`); datos.proveedores.cargar() } catch { alert('Error') }
  }
  const abrirCrearCaja = () => { setModoEdicionCaja(false); setCajaActual(cajaVacia); setIdEditandoCaja(null); setErrorCaja(null); setModalCaja(true) }
  const abrirEditarCaja = (c: Caja) => { setModoEdicionCaja(true); setCajaActual({ nombre: c.nombre, estado: c.estado }); setIdEditandoCaja(c.id_caja); setErrorCaja(null); setModalCaja(true) }
  const guardarCaja = async () => {
    if (!cajaActual.nombre.trim()) { setErrorCaja('El nombre es obligatorio'); return }
    setGuardandoCaja(true); setErrorCaja(null)
    try {
      modoEdicionCaja && idEditandoCaja ? await api.put(`/cajas/${idEditandoCaja}`, cajaActual) : await api.post('/cajas', cajaActual)
      setModalCaja(false); datos.cajas.cargar()
    } catch (err) { setErrorCaja(mensajeError(err)) }
    finally { setGuardandoCaja(false) }
  }
  const toggleCaja = async (id: number, estado: string) => {
    if (!confirm(`¿Deseas ${estado === 'ACTIVA' ? 'desactivar' : 'activar'} esta caja?`)) return
    try { await api.delete(`/cajas/${id}`); datos.cajas.cargar() } catch { alert('Error') }
  }
  return (
    <div className="flex min-h-screen bg-[var(--bg)] font-['DM_Sans']">
      <Sidebar
        subtitulo="Gerente"
        menuItems={menuItems}
        vistaActual={vistaActual}
        onNavigate={setVistaActual}
        onLogout={() => { logout(); navigate('/') }}
        footer={<Button className="mb-2" onClick={() => setVistaActual('turnos')}>Cerrar Caja</Button>}
      />
      <main className="flex min-w-0 flex-1 flex-col gap-8 p-4 pt-20 md:p-8">
        <Header
          seccionActiva={seccionActiva}
          nombreUsuario={[user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Gerente'}
          subtitulo={user?.nombre_establecimiento ? `Establecimiento: ${user.nombre_establecimiento}` : undefined}
        />
        {datos.aviso && <EstadoLectura consulta={datos.aviso} />}
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
                  <EstadoLectura consulta={datos.semana} vacio={!tendenciaSemanal.length ? 'No hay ventas registradas en los últimos 7 días.' : undefined} />
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
                    <button className="flex items-center justify-between rounded-[10px] bg-[var(--accion-primaria)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-[var(--sobre-accion)]">
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
                    <button type="button" onClick={() => setSeccionActiva('Inventario')} className="text-sm font-semibold text-[var(--rojo-dark)]">Ver inventario</button>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    <EstadoLectura consulta={datos.inventario} vacio={!estadoInventario.length ? 'No hay ingredientes registrados.' : undefined} />
                    {estadoInventario.map(i => (
                      <div key={i.id}>
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
                  <Button onClick={abrirCrearProducto}>+ Nuevo Producto</Button>
                </div>
              </div>
              {datos.catalogo.data === null || datos.catalogo.error ? (
                <EstadoLectura consulta={datos.catalogo} />
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
                          <button className="font-semibold text-[var(--rojo-dark)]" onClick={() => setReceta(p)}>Receta</button>
                          <Button size="small" variant="outline" onClick={() => abrirEditarProducto(p)}>Editar</Button>
                          <Button size="small" variant={p.Estado ? 'ghost' : 'primary'} onClick={() => toggleProducto(p.id_producto, p.Estado)}>
                            {p.Estado ? 'Desactivar' : 'Activar'}
                          </Button>
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
                  <div><h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Estado de mesas</h3>
                    <button type="button" onClick={() => setSeccionActiva('Mesas')} className="text-sm font-semibold text-[var(--rojo-dark)]">Administrar mesas</button>
                  </div>
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
                  <EstadoLectura consulta={datos.plano} vacio={!mesas.length ? 'No hay mesas registradas.' : undefined} />
                  {mesas.map(m => (
                    <div
                      key={m.numero}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 ${
                        m.ocupada
                          ? 'border-[rgba(239,159,39,0.3)] bg-[var(--amarillo-light)]'
                          : 'border-[rgba(29,158,117,0.3)] bg-[var(--verde-light)]'
                      }`}
                    >
                      <span className="text-[0.65rem] font-bold text-[var(--texto-muted)]">{etiquetaMesa(m.numero)}</span>
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
                  <button type="button" onClick={() => setSeccionActiva('Finanzas')} className="text-sm font-semibold text-[var(--rojo-dark)]">Ver finanzas</button>
                </div>
                <div className="flex flex-col gap-4">
                  <EstadoLectura consulta={datos.facturas} vacio={!movimientosRecientes.length ? 'No hay pagos registrados.' : undefined} />
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
        {seccionActiva === 'Inventario' && datos.inventario.data !== null && (
          <IngredientesSection
            ingredientes={ingredientes}
            actualizar={datos.inventario.cargar}
            onDelete={eliminarIngrediente}
          />
        )}
        {/* PROVEEDORES — CRUD */}
        {seccionActiva === 'Proveedores' && !datos.aviso && <ProveedoresSection proveedores={proveedores} onCreate={abrirCrearProveedor} onEdit={abrirEditarProveedor} onToggle={toggleProveedor} />}
        {/* FLUJO DE CAJA — CRUD Cajas */}
        {seccionActiva === 'Flujo de Caja' && !datos.aviso && <CajasSection cajas={cajas} onCreate={abrirCrearCaja} onEdit={abrirEditarCaja} onToggle={toggleCaja} />}
        {/* FINANZAS — pagos aprobados y compras de la base */}
        {seccionActiva === 'Finanzas' && !datos.aviso && (
          <FinanzasSection
            stats={[
              {
                icon: 'trending_up',
                label: 'Ventas del mes',
                valor: ingresosDelMes === null ? '—' : formatoCOP.format(ingresosDelMes),
                badge: 'Pagos aprobados',
                badgeColor: 'verde',
              },
              {
                icon: 'trending_down',
                label: 'Gastos del mes',
                valor: gastosMes === null ? '...' : formatoCOP.format(gastosMes),
                badge: 'Compras del mes',
                badgeColor: 'rojo',
              },
              {
                icon: 'account_balance_wallet',
                label: 'Utilidad neta',
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
                monto: formatoCOP.format(Number(p.monto ?? 0)),
                positivo: true,
              }))}
          />
        )}
        {/* PEDIDOS — pedidos en curso desde la base */}
        {seccionActiva === 'Pedidos' && !datos.aviso && (
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
        {seccionActiva === 'Mesas' && !datos.aviso && (
          <MesasSection mesas={mesas} actualizar={datos.plano.cargar} />
        )}
        {seccionActiva === 'IA Insights' && <IASection />}
        {/* HISTORIAL — pedidos, pagos y turnos de la base */}
        {seccionActiva === 'Historial' && !datos.aviso && (
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
        {seccionActiva === 'Personal' && !datos.aviso && (
          <PersonalSection
            personal={personal}
            formData={formData}
            usuarioEditando={usuarioEditando}
            errorPersonal={errorPersonal}
            guardandoPersonal={guardandoPersonal}
            cargandoPersonal={datos.usuarios.cargando}
            mostrarContrasena={mostrarContrasena}
            onFormSubmit={handleSubmit}
            onFormChange={(field, value) => {
              setErrorPersonal(null)
              setFormData(current => ({ ...current, [field]: value }))
            }}
            onEdit={editarUsuario}
            onDelete={eliminarUsuario}
            onCancelEdit={() => { setUsuarioEditando(null); setFormData(personalVacio); setErrorPersonal(null) }}
            onTogglePassword={() => setMostrarContrasena(current => !current)}
          />
        )}
        {/* TURNOS — apertura y cierre de caja con datos de la base */}
        {seccionActiva === 'Turnos' && !datos.aviso && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Turnos de caja</h3>
              <Button variant={mostrarAbrirTurno ? 'outline' : 'primary'} onClick={() => { setMostrarAbrirTurno(v => !v); setErrorTurno('') }}>
                {mostrarAbrirTurno ? 'Cancelar' : 'Abrir turno'}
              </Button>
            </div>
            {mostrarAbrirTurno && (
              <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-[var(--borde)] p-4 md:grid-cols-4">
                <select aria-label="Caja"
                  value={formAbrir.id_caja}
                  onChange={e => setFormAbrir({ ...formAbrir, id_caja: e.target.value })}
                  className="rounded-lg border border-[var(--borde)] bg-white px-3 py-2 text-[0.85rem] text-[var(--texto)]"
                >
                  <option value="">Caja</option>
                  {cajas.filter(c => c.estado === 'ACTIVA').map(c => (
                    <option key={c.id_caja} value={c.id_caja}>{c.nombre}</option>
                  ))}
                </select>
                <select aria-label="Cajero"
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
                <Button variant="success" onClick={abrirTurno}>Confirmar apertura</Button>
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
                        <Button size="small" variant="outline"
                          onClick={() => {
                            setTurnoCerrando(t.id_turno)
                            setEfectivoContado('')
                            setNotasCierre('')
                            setErrorTurno('')
                          }}
                        >
                          Cerrar turno
                        </Button>
                      ) : (
                        '—'
                      ),
                  },
                ]}
                data={turnos}
                emptyMessage="No hay turnos registrados."
                keyExtractor={(t) => t.id_turno}
              />

              <Modal title="Cerrar turno" isOpen={turnoParaCerrar !== null} onClose={() => setTurnoCerrando(null)}>
                {turnoParaCerrar && (
                  <>
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
                      <Button className="mt-2" onClick={() => cerrarTurno(turnoParaCerrar)}>Confirmar cierre</Button>
                    </div>
                  </>
                )}
              </Modal>
          </section>
        )}
      </main>
      {receta && <RecetaProducto key={receta.id_producto} producto={receta} cerrar={() => setReceta(null)} />}
      <GerenteModals
        producto={productoActual}
        proveedor={proveedorActual}
        caja={cajaActual}
        productoOpen={modalProducto}
        proveedorOpen={modalProveedor}
        cajaOpen={modalCaja}
        editProducto={modoEdicionProducto}
        editProveedor={modoEdicionProveedor}
        editCaja={modoEdicionCaja}
        savingProducto={guardandoProducto}
        savingProveedor={guardandoProveedor}
        savingCaja={guardandoCaja}
        errorProducto={errorProducto}
        errorProveedor={errorProveedor}
        errorCaja={errorCaja}
        setProducto={setProductoActual}
        setProveedor={setProveedorActual}
        setCaja={setCajaActual}
        closeProducto={() => setModalProducto(false)}
        closeProveedor={() => setModalProveedor(false)}
        closeCaja={() => setModalCaja(false)}
        submitProducto={guardarProducto}
        submitProveedor={guardarProveedor}
        submitCaja={guardarCaja}
      />
    </div>
  )
}
// Reiniciar las lecturas y formularios si cambia la cuenta en la misma pestaña.
export default function PanelGerente() {
  const { user } = useAuth()
  return <Gerente key={`${user?.id_usuario}:${user?.id_restaurante}`} />
}
