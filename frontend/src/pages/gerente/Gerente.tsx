/* eslint-disable react-hooks/exhaustive-deps */
import './Gerente.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'

const menuItems = [
  { icon: 'restaurant_menu', label: 'Menú' },
  { icon: 'inventory_2', label: 'Inventario' },
  { icon: 'payments', label: 'Finanzas' },
  { icon: 'add_shopping_cart', label: 'Pedidos' },
  { icon: 'groups', label: 'Mesas' },
  { icon: 'auto_awesome', label: 'IA Insights' },
  { icon: 'local_shipping', label: 'Proveedores' },
  { icon: 'receipt_long', label: 'Historial' },
  { icon: 'account_balance', label: 'Flujo de Caja' },
  { icon: 'schedule', label: 'Turnos' },
]

const metricas = [
  { icon: 'monetization_on', label: 'Ingresos del día', valor: '$4.250.000', badge: '+12.5%', badgeColor: 'verde' },
  { icon: 'account_balance_wallet', label: 'Flujo de caja', valor: '$28.140.500', badge: 'Estable', badgeColor: 'muted' },
  { icon: 'shopping_bag', label: 'Pedidos activos', valor: '42', badge: '8 pendientes', badgeColor: 'rojo' },
]

const inventario = [
  { nombre: 'Carnes & Proteínas', porcentaje: 82, color: 'verde' },
  { nombre: 'Vegetales Frescos', porcentaje: 45, color: 'amarillo' },
  { nombre: 'Bebidas & Licores', porcentaje: 12, color: 'rojo' },
]

const movimientos = [
  { icon: 'shopping_cart', titulo: 'Mesa 03 - Pago recibido', sub: 'Hace 14 min • Visa ***4212', monto: '+$84.500', positivo: true },
  { icon: 'local_shipping', titulo: 'Proveedor: La Huerta S.A.', sub: 'Hace 1 hora • Orden #9822', monto: '-$210.000', positivo: false },
  { icon: 'shopping_cart', titulo: 'Mesa 12 - Pago recibido', sub: 'Hace 3 horas • Efectivo', monto: '+$126.000', positivo: true },
  { icon: 'settings_backup_restore', titulo: 'Reembolso mesa 01', sub: 'Hace 5 horas • Cancelación', monto: '-$15.200', positivo: false },
]

const mesas = [
  { id: 'T-01', ocupada: false }, { id: 'T-02', ocupada: true },
  { id: 'T-03', ocupada: true },  { id: 'T-04', ocupada: false },
  { id: 'T-05', ocupada: false }, { id: 'T-06', ocupada: true },
  { id: 'T-07', ocupada: false }, { id: 'T-08', ocupada: false },
  { id: 'T-09', ocupada: true },  { id: 'T-10', ocupada: false },
  { id: 'T-11', ocupada: false }, { id: 'T-12', ocupada: false },
]

const barras = [
  { dia: 'LUN', alto: 40 }, { dia: 'MAR', alto: 60 },
  { dia: 'MIE', alto: 80 }, { dia: 'JUE', alto: 75 },
  { dia: 'VIE', alto: 95 }, { dia: 'SAB', alto: 85 },
  { dia: 'DOM', alto: 70 },
]
const finanzasStats = [
  { icon: 'trending_up', label: 'Ingresos del mes', valor: '$84.250.000', badge: '+8.2%', badgeColor: 'verde' },
  { icon: 'trending_down', label: 'Gastos del mes', valor: '$32.180.000', badge: '+3.1%', badgeColor: 'rojo' },
  { icon: 'account_balance_wallet', label: 'Utilidad neta', valor: '$52.070.000', badge: '61.8%', badgeColor: 'muted' },
]
const transacciones = [
  { fecha: '18 Ago', concepto: 'Ventas del día', categoria: 'Ingreso', monto: '$4.250.000', positivo: true },
  { fecha: '17 Ago', concepto: 'Pago proveedor La Huerta S.A.', categoria: 'Gasto', monto: '$1.210.000', positivo: false },
  { fecha: '17 Ago', concepto: 'Ventas del día', categoria: 'Ingreso', monto: '$3.980.000', positivo: true },
  { fecha: '16 Ago', concepto: 'Nómina quincenal', categoria: 'Gasto', monto: '$8.500.000', positivo: false },
  { fecha: '15 Ago', concepto: 'Ventas del día', categoria: 'Ingreso', monto: '$4.560.000', positivo: true },
]
const pedidosActivosMock = [
  { id: '#1042', mesa: 'Mesa 3', items: 'Combo corriente ×2', estado: 'Preparando', tiempo: '5 min' },
  { id: '#1043', mesa: 'Mesa 7', items: 'Hamburguesa BBQ', estado: 'Listo', tiempo: '12 min' },
  { id: '#1044', mesa: 'Domicilio', items: 'Cra 5 #22, en camino', estado: 'En camino', tiempo: '18 min' },
  { id: '#1045', mesa: 'Mesa 1', items: 'Desayuno ejecutivo ×3', estado: 'Preparando', tiempo: '3 min' },
  { id: '#1046', mesa: 'Mesa 9', items: 'Ensalada César', estado: 'Entregado', tiempo: '25 min' },
]
const iaInsights = [
  { icon: 'trending_up', titulo: 'Demanda proyectada al alza', detalle: 'Se espera un incremento del 15% en pedidos este viernes basado en patrones históricos.', tono: 'verde' },
  { icon: 'inventory_2', titulo: 'Alerta de inventario', detalle: 'Las papas fritas alcanzarán el stock mínimo en 2 días al ritmo de consumo actual.', tono: 'amarillo' },
  { icon: 'schedule', titulo: 'Optimización de turnos', detalle: 'Considera agregar un mesero adicional en el turno de la tarde de fin de semana.', tono: 'muted' },
  { icon: 'local_offer', titulo: 'Oportunidad de promoción', detalle: 'El combo de hamburguesas tiene baja rotación los martes, considera una oferta.', tono: 'rojo' },
]
const historialEventos = [
  { fecha: '18 Ago, 14:32', usuario: 'Laura Gómez', accion: 'Actualizó el producto "Pizza Margarita"' },
  { fecha: '18 Ago, 11:05', usuario: 'Carlos Ruiz', accion: 'Creó un nuevo proveedor: "Distribuidora Andina"' },
  { fecha: '17 Ago, 19:47', usuario: 'Laura Gómez', accion: 'Cerró la caja principal con un total de $2.840.000' },
  { fecha: '17 Ago, 09:12', usuario: 'Sistema', accion: 'Se generó el reporte semanal de ventas' },
  { fecha: '16 Ago, 16:20', usuario: 'Carlos Ruiz', accion: 'Desactivó el ingrediente "Salsa BBQ especial"' },
]
const turnosMock = [
  { empleado: 'Sofía Ramírez', rol: 'Mesero', turno: '7:00 AM - 3:00 PM', estado: 'Activo' },
  { empleado: 'Juan Torres', rol: 'Repartidor', turno: '11:00 AM - 7:00 PM', estado: 'Activo' },
  { empleado: 'Ana Martínez', rol: 'Cajero', turno: '3:00 PM - 11:00 PM', estado: 'Pendiente' },
  { empleado: 'Diego López', rol: 'Mesero', turno: '3:00 PM - 11:00 PM', estado: 'Pendiente' },
]

// Interfaces
interface Producto {
  id_producto: number
  Nombre: string
  Descripcion: string
  precio_venta: string
  Categoria: string
  Tiempo_preparacion: string
  Estado: number
}

interface Ingrediente {
  id_ingrediente: number
  nombre: string
  descripcion: string
  unidad_medida: string
  costo_unitario_ref: string
  stock_minimo: string
}

interface Proveedor {
  id_proveedor: number
  nombre: string
  nombre_contacto: string
  telefono: string
  email: string
  direccion: string
  nit: string
  tipo_proveedor: string
  estado: string
}

interface Caja {
  id_caja: number
  nombre: string
  estado: string
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

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
  border: '1.5px solid var(--borde)', background: 'var(--bg)',
  fontSize: '0.95rem', color: 'var(--texto)', outline: 'none',
  boxSizing: 'border-box',
}

function Gerente() {
  const [seccionActiva, setSeccionActiva] = useState('Menú')
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  // Productos
  const [productos, setProductos] = useState<Producto[]>([])
  const [fuenteProductos, setFuenteProductos] = useState<'vista' | 'sp'>('vista')
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [modalProducto, setModalProducto] = useState(false)
  const [modoEdicionProducto, setModoEdicionProducto] = useState(false)
  const [productoActual, setProductoActual] = useState<Omit<Producto, 'id_producto'>>(productoVacio)
  const [idEditandoProducto, setIdEditandoProducto] = useState<number | null>(null)
  const [guardandoProducto, setGuardandoProducto] = useState(false)
  const [errorProducto, setErrorProducto] = useState<string | null>(null)

  // Ingredientes
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [modalIngrediente, setModalIngrediente] = useState(false)
  const [modoEdicionIngrediente, setModoEdicionIngrediente] = useState(false)
  const [ingredienteActual, setIngredienteActual] = useState(ingredienteVacio)
  const [idEditandoIngrediente, setIdEditandoIngrediente] = useState<number | null>(null)
  const [guardandoIngrediente, setGuardandoIngrediente] = useState(false)
  const [errorIngrediente, setErrorIngrediente] = useState<string | null>(null)

  // Proveedores
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [modalProveedor, setModalProveedor] = useState(false)
  const [modoEdicionProveedor, setModoEdicionProveedor] = useState(false)
  const [proveedorActual, setProveedorActual] = useState(proveedorVacio)
  const [idEditandoProveedor, setIdEditandoProveedor] = useState<number | null>(null)
  const [guardandoProveedor, setGuardandoProveedor] = useState(false)
  const [errorProveedor, setErrorProveedor] = useState<string | null>(null)

  // Cajas
  const [cajas, setCajas] = useState<Caja[]>([])
  const [modalCaja, setModalCaja] = useState(false)
  const [modoEdicionCaja, setModoEdicionCaja] = useState(false)
  const [cajaActual, setCajaActual] = useState(cajaVacia)
  const [idEditandoCaja, setIdEditandoCaja] = useState<number | null>(null)
  const [guardandoCaja, setGuardandoCaja] = useState(false)
  const [errorCaja, setErrorCaja] = useState<string | null>(null)

  // Carga de datos
  const cargarProductos = () => {
    const endpoint = fuenteProductos === 'vista' ? '/productos/vista' : '/productos/sp'
    setCargandoProductos(true)
    api.get(endpoint).then(res => setProductos(res.data)).catch(console.error).finally(() => setCargandoProductos(false))
  }

  useEffect(() => { cargarProductos() }, [fuenteProductos])
  useEffect(() => { if (seccionActiva === 'Inventario') api.get('/ingredientes').then(r => setIngredientes(r.data)).catch(console.error) }, [seccionActiva])
  useEffect(() => { if (seccionActiva === 'Proveedores') api.get('/proveedores').then(r => setProveedores(r.data)).catch(console.error) }, [seccionActiva])
  useEffect(() => { if (seccionActiva === 'Flujo de Caja') api.get('/cajas').then(r => setCajas(r.data)).catch(console.error) }, [seccionActiva])

  // --- CRUD Productos ---
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

  // --- CRUD Ingredientes ---
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

  // --- CRUD Proveedores ---
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

  // --- CRUD Cajas ---
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
      <aside className="fixed left-0 top-0 z-[100] flex min-h-screen w-[240px] flex-col border-r border-[var(--borde)] bg-[var(--bg-card)] p-4">
        <div className="mb-8 px-2">
          <div className="font-['Syne'] text-[1.2rem] font-extrabold text-[var(--rojo-dark)]">
            Remi<span className="text-[var(--amarillo)]">Soft</span>
          </div>
          <div className="mt-1 text-[0.7rem] uppercase tracking-[1.5px] text-[var(--texto-muted)]">
            Gerente
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => setSeccionActiva(item.label)}
              className={`flex items-center gap-3 rounded-[10px] border-r-[3px] px-3 py-2.5 text-left font-['DM_Sans'] text-[0.875rem] font-medium transition-all duration-150 ease-in-out ${
                seccionActiva === item.label
                  ? 'border-r-[var(--rojo)] bg-[var(--rojo-light)] text-[var(--rojo-dark)]'
                  : 'border-r-transparent bg-transparent text-[var(--texto-muted)]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1 border-t border-[var(--borde)] pt-4">
          <button className="mb-2 rounded-[10px] bg-[var(--rojo)] px-2.5 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white">
            Cerrar Caja
          </button>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2 rounded-[10px] bg-transparent px-3 py-2 font-['DM_Sans'] text-[0.875rem] text-[var(--texto-muted)]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="ml-[240px] flex flex-1 flex-col gap-8 p-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-['Syne'] text-[1.6rem] font-extrabold tracking-[-0.5px] text-[var(--texto)]">
              {seccionActiva}
            </h1>
            <p className="mt-0.5 text-[0.85rem] text-[var(--texto-muted)]">
              Bienvenido de nuevo, {user?.nombre ?? 'Gerente'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--borde)] bg-[var(--bg-card)] text-[var(--texto-muted)]">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--bg-card)] bg-[var(--rojo)]"></span>
            </button>
            <div className="flex items-center gap-2.5 rounded-full border border-[var(--borde)] bg-[var(--bg-card)] py-1.5 pl-1.5 pr-3.5">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--rojo-light)] text-[0.85rem] font-bold text-[var(--rojo-dark)]">
                G
              </div>
              <span className="text-[0.85rem] font-medium text-[var(--texto)]">
                {user?.nombre ?? 'Gerente'}
              </span>
            </div>
          </div>
        </header>

        {/* MENÚ — Dashboard principal */}
        {seccionActiva === 'Menú' && (
          <>
            <section className="grid grid-cols-3 gap-4">
              {metricas.map(m => (
                <div key={m.label} className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-[var(--sombra)]">
                  <div className="flex items-start justify-between">
                    <span className={`material-symbols-outlined rounded-[10px] p-2 text-[22px] ${
                      m.badgeColor === 'verde' ? 'bg-[var(--verde-light)] text-[var(--verde)]' :
                      m.badgeColor === 'rojo' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' :
                      'bg-[#f0ebe5] text-[var(--texto-muted)]'
                    }`}>{m.icon}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ${
                      m.badgeColor === 'verde' ? 'bg-[var(--verde-light)] text-[var(--verde)]' :
                      m.badgeColor === 'rojo' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' :
                      'bg-[#f0ebe5] text-[var(--texto-muted)]'
                    }`}>{m.badge}</span>
                  </div>
                  <div>
                    <p className="mb-1 text-[0.78rem] text-[var(--texto-muted)]">{m.label}</p>
                    <p className="font-['Syne'] text-[1.6rem] font-bold text-[var(--texto)]">{m.valor}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-[1fr_320px] gap-4">
              <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-7 shadow-[var(--sombra)]">
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <h3 className="font-['Syne'] text-[1.1rem] font-bold text-[var(--texto)]">Tendencia semanal</h3>
                    <p className="mt-0.5 text-[0.8rem] text-[var(--texto-muted)]">Predicción de demanda basada en historial</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-[var(--rojo)]">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-current"></span>Proyectado
                    </span>
                    <span className="flex items-center gap-1 text-[0.72rem] font-semibold text-[var(--amarillo)]">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-current"></span>Real
                    </span>
                  </div>
                </div>
                <div className="flex h-40 items-end justify-between gap-2">
                  {barras.map(b => (
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
                    <button className="flex items-center justify-between rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-[var(--texto-muted)]">
                      Control de Menú
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-5 shadow-[var(--sombra)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">Estado inventario</h4>
                    <span className="rounded-full bg-[#f0ebe5] px-2 py-0.5 text-[0.65rem] text-[var(--texto-muted)]">En vivo</span>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    {inventario.map(i => (
                      <div key={i.nombre}>
                        <div className="mb-1 flex justify-between">
                          <span className="text-[0.75rem] font-medium text-[var(--texto-muted)]">{i.nombre}</span>
                          <span className={`text-[0.75rem] font-bold ${
                            i.color === 'verde' ? 'text-[var(--verde)]' :
                            i.color === 'rojo' ? 'text-[var(--rojo)]' : 'text-[#BA7517]'
                          }`}>{i.porcentaje}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[#f0ebe5]">
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
                <div className="flex items-center gap-3">
                  <button
                    className={`rounded-[10px] border border-[var(--borde)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold ${
                      fuenteProductos === 'vista' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' : 'bg-[#f9f5f0] text-[var(--texto-muted)]'
                    }`}
                    onClick={() => setFuenteProductos('vista')}
                  >
                    Vista SQL
                  </button>
                  <button
                    className={`rounded-[10px] border border-[var(--borde)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold ${
                      fuenteProductos === 'sp' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' : 'bg-[#f9f5f0] text-[var(--texto-muted)]'
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
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Nombre</th>
                        <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Descripción</th>
                        <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Precio</th>
                        <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Categoría</th>
                        <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Tiempo prep.</th>
                        <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Estado</th>
                        <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.length === 0 ? (
                        <tr><td colSpan={7} className="py-4 text-center text-[var(--texto-muted)]">Sin productos</td></tr>
                      ) : productos.map(p => (
                        <tr key={p.id_producto}>
                          <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]"><strong>{p.Nombre}</strong></td>
                          <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{p.Descripcion}</td>
                          <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">${Number(p.precio_venta).toLocaleString('es-CO')}</td>
                          <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{p.Categoria}</td>
                          <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{p.Tiempo_preparacion}</td>
                          <td className={`border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] ${p.Estado ? 'text-[var(--verde)]' : 'text-[var(--rojo)]'}`}>{p.Estado ? 'Activo' : 'Inactivo'}</td>
                          <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem]">
                            <div className="flex gap-2">
                              <button className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]" onClick={() => abrirEditarProducto(p)}>Editar</button>
                              <button
                                className={`rounded-[10px] px-3 py-1.5 text-[0.8rem] font-semibold ${
                                  p.Estado ? 'bg-transparent text-[var(--texto-muted)]' : 'bg-[var(--rojo)] text-white'
                                }`}
                                onClick={() => toggleProducto(p.id_producto, p.Estado)}
                              >
                                {p.Estado ? 'Desactivar' : 'Activar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="grid grid-cols-[1fr_360px] gap-4">
              <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-7 shadow-[var(--sombra)]">
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
                  {movimientos.map((mov, i) => (
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
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Gestión de Ingredientes</h3>
              <button
                className="rounded-[10px] bg-[var(--rojo)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
                onClick={abrirCrearIngrediente}
              >
                + Nuevo Ingrediente
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Nombre</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Descripción</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Unidad</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Costo ref.</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Stock mínimo</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredientes.length === 0 ? (
                    <tr><td colSpan={6} className="py-4 text-center text-[var(--texto-muted)]">Cargando...</td></tr>
                  ) : ingredientes.map(i => (
                    <tr key={i.id_ingrediente}>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]"><strong>{i.nombre}</strong></td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{i.descripcion}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{i.unidad_medida}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">${Number(i.costo_unitario_ref).toLocaleString('es-CO')}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{i.stock_minimo}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem]">
                        <div className="flex gap-2">
                          <button className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]" onClick={() => abrirEditarIngrediente(i)}>Editar</button>
                          <button className="rounded-[10px] bg-transparent px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]" onClick={() => eliminarIngrediente(i.id_ingrediente)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {/* PROVEEDORES — CRUD */}
        {seccionActiva === 'Proveedores' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Gestión de Proveedores</h3>
              <button
                className="rounded-[10px] bg-[var(--rojo)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
                onClick={abrirCrearProveedor}
              >
                + Nuevo Proveedor
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Nombre</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Contacto</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Teléfono</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Email</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Tipo</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Estado</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.length === 0 ? (
                    <tr><td colSpan={7} className="py-4 text-center text-[var(--texto-muted)]">Cargando...</td></tr>
                  ) : proveedores.map(p => (
                    <tr key={p.id_proveedor}>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]"><strong>{p.nombre}</strong></td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{p.nombre_contacto}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{p.telefono}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{p.email}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{p.tipo_proveedor}</td>
                      <td className={`border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] ${p.estado === 'ACTIVO' ? 'text-[var(--verde)]' : 'text-[var(--rojo)]'}`}>{p.estado}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem]">
                        <div className="flex gap-2">
                          <button className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]" onClick={() => abrirEditarProveedor(p)}>Editar</button>
                          <button
                            className={`rounded-[10px] px-3 py-1.5 text-[0.8rem] font-semibold ${
                              p.estado === 'ACTIVO' ? 'bg-transparent text-[var(--texto-muted)]' : 'bg-[var(--rojo)] text-white'
                            }`}
                            onClick={() => toggleProveedor(p.id_proveedor, p.estado)}
                          >
                            {p.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* FLUJO DE CAJA — CRUD Cajas */}
        {seccionActiva === 'Flujo de Caja' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Gestión de Cajas</h3>
              <button
                className="rounded-[10px] bg-[var(--rojo)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
                onClick={abrirCrearCaja}
              >
                + Nueva Caja
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Nombre</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Estado</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cajas.length === 0 ? (
                    <tr><td colSpan={3} className="py-4 text-center text-[var(--texto-muted)]">Cargando...</td></tr>
                  ) : cajas.map(c => (
                    <tr key={c.id_caja}>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]"><strong>{c.nombre}</strong></td>
                      <td className={`border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] ${c.estado === 'ACTIVA' ? 'text-[var(--verde)]' : 'text-[var(--rojo)]'}`}>{c.estado}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem]">
                        <div className="flex gap-2">
                          <button className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]" onClick={() => abrirEditarCaja(c)}>Editar</button>
                          <button
                            className={`rounded-[10px] px-3 py-1.5 text-[0.8rem] font-semibold ${
                              c.estado === 'ACTIVA' ? 'bg-transparent text-[var(--texto-muted)]' : 'bg-[var(--rojo)] text-white'
                            }`}
                            onClick={() => toggleCaja(c.id_caja, c.estado)}
                          >
                            {c.estado === 'ACTIVA' ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {/* FINANZAS — vista con datos de ejemplo */}
        {seccionActiva === 'Finanzas' && (
          <>
            <section className="grid grid-cols-3 gap-4">
              {finanzasStats.map(m => (
                <div key={m.label} className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-[var(--sombra)]">
                  <div className="flex items-start justify-between">
                    <span className={`material-symbols-outlined rounded-[10px] p-2 text-[22px] ${
                      m.badgeColor === 'verde' ? 'bg-[var(--verde-light)] text-[var(--verde)]' :
                      m.badgeColor === 'rojo' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' :
                      'bg-[#f0ebe5] text-[var(--texto-muted)]'
                    }`}>{m.icon}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold ${
                      m.badgeColor === 'verde' ? 'bg-[var(--verde-light)] text-[var(--verde)]' :
                      m.badgeColor === 'rojo' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' :
                      'bg-[#f0ebe5] text-[var(--texto-muted)]'
                    }`}>{m.badge}</span>
                  </div>
                  <div>
                    <p className="mb-1 text-[0.78rem] text-[var(--texto-muted)]">{m.label}</p>
                    <p className="font-['Syne'] text-[1.6rem] font-bold text-[var(--texto)]">{m.valor}</p>
                  </div>
                </div>
              ))}
            </section>
            <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
              <h3 className="mb-5 font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Transacciones recientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Fecha</th>
                      <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Concepto</th>
                      <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Categoría</th>
                      <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map((t, i) => (
                      <tr key={i}>
                        <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto-muted)]">{t.fecha}</td>
                        <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{t.concepto}</td>
                        <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto-muted)]">{t.categoria}</td>
                        <td className={`border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] font-semibold ${t.positivo ? 'text-[var(--verde)]' : 'text-[var(--rojo)]'}`}>
                          {t.positivo ? '+' : '-'}{t.monto.replace('$', '$')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* PEDIDOS — vista con datos de ejemplo */}
        {seccionActiva === 'Pedidos' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <h3 className="mb-5 font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Pedidos activos</h3>
            <div className="flex flex-col gap-3">
              {pedidosActivosMock.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--borde)] bg-[#f9f5f0] px-4 py-3">
                  <div className="flex items-center gap-4">
                    <span className="font-['Syne'] text-[0.9rem] font-bold text-[var(--texto-muted)]">{p.id}</span>
                    <div>
                      <p className="text-[0.85rem] font-semibold text-[var(--texto)]">{p.mesa}</p>
                      <p className="text-[0.78rem] text-[var(--texto-muted)]">{p.items}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[0.75rem] text-[var(--texto-muted)]">{p.tiempo}</span>
                    <span className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
                      p.estado === 'Preparando' ? 'bg-[var(--amarillo-light)] text-[#854F0B]' :
                      p.estado === 'Listo' ? 'bg-[var(--verde-light)] text-[#0F6E56]' :
                      p.estado === 'En camino' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' :
                      'bg-[#f0ebe5] text-[var(--texto-muted)]'
                    }`}>{p.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MESAS — vista con datos de ejemplo (reutiliza array 'mesas') */}
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
            {iaInsights.map((insight, i) => (
              <div key={i} className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-[var(--sombra)]">
                <div className="mb-3 flex items-center gap-3">
                  <span className={`material-symbols-outlined rounded-[10px] p-2 text-[22px] ${
                    insight.tono === 'verde' ? 'bg-[var(--verde-light)] text-[var(--verde)]' :
                    insight.tono === 'rojo' ? 'bg-[var(--rojo-light)] text-[var(--rojo-dark)]' :
                    insight.tono === 'amarillo' ? 'bg-[var(--amarillo-light)] text-[#854F0B]' :
                    'bg-[#f0ebe5] text-[var(--texto-muted)]'
                  }`}>{insight.icon}</span>
                  <h4 className="font-['Syne'] text-[0.95rem] font-bold text-[var(--texto)]">{insight.titulo}</h4>
                </div>
                <p className="text-[0.85rem] leading-[1.6] text-[var(--texto-muted)]">{insight.detalle}</p>
              </div>
            ))}
          </section>
        )}

        {/* HISTORIAL — vista con datos de ejemplo */}
        {seccionActiva === 'Historial' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <h3 className="mb-5 font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Historial de actividad</h3>
            <div className="flex flex-col gap-4">
              {historialEventos.map((h, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-[var(--borde)] pb-4 last:border-b-0 last:pb-0">
                  <span className="material-symbols-outlined mt-0.5 text-[18px] text-[var(--texto-muted)]">history</span>
                  <div>
                    <p className="text-[0.85rem] text-[var(--texto)]">{h.accion}</p>
                    <p className="mt-0.5 text-[0.75rem] text-[var(--texto-muted)]">{h.usuario} · {h.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TURNOS — vista con datos de ejemplo */}
        {seccionActiva === 'Turnos' && (
          <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
            <h3 className="mb-5 font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Turnos del personal</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Empleado</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Rol</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Turno</th>
                    <th className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {turnosMock.map((t, i) => (
                    <tr key={i}>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]"><strong>{t.empleado}</strong></td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto-muted)]">{t.rol}</td>
                      <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto-muted)]">{t.turno}</td>
                      <td className={`border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] font-semibold ${t.estado === 'Activo' ? 'text-[var(--verde)]' : 'text-[#854F0B]'}`}>{t.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* MODAL PRODUCTOS */}
      <Modal isOpen={modalProducto} onClose={() => setModalProducto(false)}>
        <div className="min-w-[400px] p-6">
          <h3 className="mb-4 font-['Syne'] text-[1.2rem] font-bold text-[var(--texto)]">
            {modoEdicionProducto ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          {errorProducto && (
            <p className="mb-3 text-[0.85rem] text-[var(--rojo)]">{errorProducto}</p>
          )}
          <div className="flex flex-col gap-3">
            <input
              placeholder="Nombre *"
              value={productoActual.Nombre}
              onChange={e => setProductoActual(p => ({ ...p, Nombre: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <textarea
              placeholder="Descripción"
              value={productoActual.Descripcion}
              onChange={e => setProductoActual(p => ({ ...p, Descripcion: e.target.value }))}
              rows={3}
              className="w-full resize-y rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <input
              type="number"
              placeholder="Precio *"
              value={productoActual.precio_venta}
              onChange={e => setProductoActual(p => ({ ...p, precio_venta: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <input
              placeholder="Categoría"
              value={productoActual.Categoria}
              onChange={e => setProductoActual(p => ({ ...p, Categoria: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <input
              placeholder="Tiempo prep. (HH:MM:SS)"
              value={productoActual.Tiempo_preparacion}
              onChange={e => setProductoActual(p => ({ ...p, Tiempo_preparacion: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <select
              value={productoActual.Estado}
              onChange={e => setProductoActual(p => ({ ...p, Estado: Number(e.target.value) }))}
              className="w-full cursor-pointer rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-[var(--texto-muted)]"
              onClick={() => setModalProducto(false)}
              disabled={guardandoProducto}
            >
              Cancelar
            </button>
            <button
              className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
              onClick={guardarProducto}
              disabled={guardandoProducto}
            >
              {guardandoProducto ? 'Guardando...' : modoEdicionProducto ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL INGREDIENTES */}
      <Modal isOpen={modalIngrediente} onClose={() => setModalIngrediente(false)}>
        <div className="min-w-[400px] p-6">
          <h3 className="mb-4 font-['Syne'] text-[1.2rem] font-bold text-[var(--texto)]">
            {modoEdicionIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
          </h3>
          {errorIngrediente && (
            <p className="mb-3 text-[0.85rem] text-[var(--rojo)]">{errorIngrediente}</p>
          )}
          <div className="flex flex-col gap-3">
            <input
              placeholder="Nombre *"
              value={ingredienteActual.nombre}
              onChange={e => setIngredienteActual(p => ({ ...p, nombre: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <textarea
              placeholder="Descripción"
              value={ingredienteActual.descripcion}
              onChange={e => setIngredienteActual(p => ({ ...p, descripcion: e.target.value }))}
              rows={2}
              className="w-full resize-y rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Unidad de medida"
                value={ingredienteActual.unidad_medida}
                onChange={e => setIngredienteActual(p => ({ ...p, unidad_medida: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
              />
              <input
                type="number"
                placeholder="Costo unitario ref."
                value={ingredienteActual.costo_unitario_ref}
                onChange={e => setIngredienteActual(p => ({ ...p, costo_unitario_ref: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
              />
            </div>
            <input
              type="number"
              placeholder="Stock mínimo"
              value={ingredienteActual.stock_minimo}
              onChange={e => setIngredienteActual(p => ({ ...p, stock_minimo: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-[var(--texto-muted)]"
              onClick={() => setModalIngrediente(false)}
              disabled={guardandoIngrediente}
            >
              Cancelar
            </button>
            <button
              className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
              onClick={guardarIngrediente}
              disabled={guardandoIngrediente}
            >
              {guardandoIngrediente ? 'Guardando...' : modoEdicionIngrediente ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL PROVEEDORES */}
      <Modal isOpen={modalProveedor} onClose={() => setModalProveedor(false)}>
        <div className="min-w-[420px] p-6">
          <h3 className="mb-4 font-['Syne'] text-[1.2rem] font-bold text-[var(--texto)]">
            {modoEdicionProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          {errorProveedor && (
            <p className="mb-3 text-[0.85rem] text-[var(--rojo)]">{errorProveedor}</p>
          )}
          <div className="flex flex-col gap-3">
            <input
              placeholder="Nombre *"
              value={proveedorActual.nombre}
              onChange={e => setProveedorActual(p => ({ ...p, nombre: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <input
              placeholder="Nombre contacto"
              value={proveedorActual.nombre_contacto}
              onChange={e => setProveedorActual(p => ({ ...p, nombre_contacto: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Teléfono"
                value={proveedorActual.telefono}
                onChange={e => setProveedorActual(p => ({ ...p, telefono: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={proveedorActual.email}
                onChange={e => setProveedorActual(p => ({ ...p, email: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
              />
            </div>
            <input
              placeholder="Dirección"
              value={proveedorActual.direccion}
              onChange={e => setProveedorActual(p => ({ ...p, direccion: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="NIT"
                value={proveedorActual.nit}
                onChange={e => setProveedorActual(p => ({ ...p, nit: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
              />
              <input
                placeholder="Tipo proveedor"
                value={proveedorActual.tipo_proveedor}
                onChange={e => setProveedorActual(p => ({ ...p, tipo_proveedor: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
              />
            </div>
            <select
              value={proveedorActual.estado}
              onChange={e => setProveedorActual(p => ({ ...p, estado: e.target.value }))}
              className="w-full cursor-pointer rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            >
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-[var(--texto-muted)]"
              onClick={() => setModalProveedor(false)}
              disabled={guardandoProveedor}
            >
              Cancelar
            </button>
            <button
              className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
              onClick={guardarProveedor}
              disabled={guardandoProveedor}
            >
              {guardandoProveedor ? 'Guardando...' : modoEdicionProveedor ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL CAJAS */}
      <Modal isOpen={modalCaja} onClose={() => setModalCaja(false)}>
        <div className="min-w-[380px] p-6">
          <h3 className="mb-4 font-['Syne'] text-[1.2rem] font-bold text-[var(--texto)]">
            {modoEdicionCaja ? 'Editar Caja' : 'Nueva Caja'}
          </h3>
          {errorCaja && (
            <p className="mb-3 text-[0.85rem] text-[var(--rojo)]">{errorCaja}</p>
          )}
          <div className="flex flex-col gap-3">
            <input
              placeholder="Nombre de la caja *"
              value={cajaActual.nombre}
              onChange={e => setCajaActual(p => ({ ...p, nombre: e.target.value }))}
              className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            />
            <select
              value={cajaActual.estado}
              onChange={e => setCajaActual(p => ({ ...p, estado: e.target.value }))}
              className="w-full cursor-pointer rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 font-['DM_Sans'] text-[0.95rem] text-[var(--texto)] outline-none"
            >
              <option value="ACTIVA">Activa</option>
              <option value="INACTIVA">Inactiva</option>
            </select>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-[var(--texto-muted)]"
              onClick={() => setModalCaja(false)}
              disabled={guardandoCaja}
            >
              Cancelar
            </button>
            <button
              className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
              onClick={guardarCaja}
              disabled={guardandoCaja}
            >
              {guardandoCaja ? 'Guardando...' : modoEdicionCaja ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Gerente