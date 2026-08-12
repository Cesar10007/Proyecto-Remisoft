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
    <div className="ge-wrapper">
      <aside className="ge-sidebar">
        <div className="ge-sidebar-brand">
          <div className="ge-logo">Remi<span className="ge-logo-accent">Soft</span></div>
          <div className="ge-role">Gerente</div>
        </div>
        <div className="ge-sidebar-menu">
          {menuItems.map(item => (
            <button key={item.label} onClick={() => setSeccionActiva(item.label)}
              className={`ge-menu-btn ${seccionActiva === item.label ? 'is-active' : ''}`}>
              <span className="material-symbols-outlined ge-menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="ge-sidebar-footer">
          <button className="ge-primary-btn">Cerrar Caja</button>
          <button onClick={() => { logout(); navigate('/') }} className="ge-logout-btn">
            <span className="material-symbols-outlined ge-logout-icon">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="ge-main">
        <header className="ge-topbar">
          <div>
            <h1 className="ge-page-title">{seccionActiva}</h1>
            <p className="ge-page-subtitle">Bienvenido de nuevo, {user?.nombre ?? 'Gerente'}</p>
          </div>
          <div className="ge-topbar-actions">
            <button className="ge-notification-btn">
              <span className="material-symbols-outlined ge-notification-icon">notifications</span>
              <span className="ge-notification-dot"></span>
            </button>
            <div className="ge-user-pill">
              <div className="ge-user-avatar">G</div>
              <span className="ge-user-name">{user?.nombre ?? 'Gerente'}</span>
            </div>
          </div>
        </header>

        {/* MENÚ — Dashboard principal */}
        {seccionActiva === 'Menú' && (
          <>
            <section className="ge-metrics-grid">
              {metricas.map(m => (
                <div key={m.label} className="ge-card ge-metric-card">
                  <div className="ge-metric-header">
                    <span className={`material-symbols-outlined ge-metric-icon ge-tone-${m.badgeColor}`}>{m.icon}</span>
                    <span className={`ge-badge ge-tone-${m.badgeColor}`}>{m.badge}</span>
                  </div>
                  <div>
                    <p className="ge-metric-label">{m.label}</p>
                    <p className="ge-metric-value">{m.valor}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="ge-main-grid">
              <div className="ge-card ge-chart-card">
                <div className="ge-chart-header">
                  <div>
                    <h3 className="ge-section-title">Tendencia semanal</h3>
                    <p className="ge-section-subtitle">Predicción de demanda basada en historial</p>
                  </div>
                  <div className="ge-legend">
                    <span className="ge-legend-item ge-legend-item--red"><span className="ge-legend-dot"></span>Proyectado</span>
                    <span className="ge-legend-item ge-legend-item--yellow"><span className="ge-legend-dot"></span>Real</span>
                  </div>
                </div>
                <div className="ge-bars-chart">
                  {barras.map(b => (
                    <div key={b.dia} className="ge-bar-column">
                      <div className="ge-bar-fill" style={{ ['--bar-height']: `${b.alto}%` } as React.CSSProperties}></div>
                      <span className="ge-bar-label">{b.dia}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ge-side-column">
                <div className="ge-card ge-quick-card">
                  <h4 className="ge-small-title">Acciones rápidas</h4>
                  <div className="ge-quick-actions">
                    <button className="ge-primary-btn ge-primary-btn--split">Nuevo Pedido<span className="material-symbols-outlined ge-action-icon">arrow_forward</span></button>
                    <button className="ge-secondary-btn ge-secondary-btn--split">Control de Menú<span className="material-symbols-outlined ge-action-icon">edit_note</span></button>
                  </div>
                </div>
                <div className="ge-card ge-inventory-card">
                  <div className="ge-inventory-header">
                    <h4 className="ge-small-title">Estado inventario</h4>
                    <span className="ge-live-badge">En vivo</span>
                  </div>
                  <div className="ge-inventory-list">
                    {inventario.map(i => (
                      <div key={i.nombre} className="ge-inventory-item">
                        <div className="ge-inventory-row">
                          <span className="ge-inventory-name">{i.nombre}</span>
                          <span className={`ge-inventory-value ge-text-${i.color}`}>{i.porcentaje}%</span>
                        </div>
                        <div className="ge-progress-track">
                          <div className={`ge-progress-fill ge-fill-${i.color}`} style={{ ['--progress']: `${i.porcentaje}%` } as React.CSSProperties}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="ge-card ge-productos-card" style={{ marginTop: '1.5rem' }}>
              <div className="ge-productos-header">
                <h3 className="ge-section-title ge-section-title--sm">Listado de Productos</h3>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button className={`ge-secondary-btn ${fuenteProductos === 'vista' ? 'is-active' : ''}`} onClick={() => setFuenteProductos('vista')}>Vista SQL</button>
                  <button className={`ge-secondary-btn ${fuenteProductos === 'sp' ? 'is-active' : ''}`} onClick={() => setFuenteProductos('sp')}>Procedimiento</button>
                  <button className="ge-primary-btn" onClick={abrirCrearProducto}>+ Nuevo Producto</button>
                </div>
              </div>
              {cargandoProductos ? <p style={{ color: 'var(--texto-muted)', fontSize: '0.85rem' }}>Cargando...</p> : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ge-productos-tabla">
                    <thead><tr><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Categoría</th><th>Tiempo prep.</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {productos.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-muted)' }}>Sin productos</td></tr> : productos.map(p => (
                        <tr key={p.id_producto}>
                          <td><strong>{p.Nombre}</strong></td>
                          <td>{p.Descripcion}</td>
                          <td>${Number(p.precio_venta).toLocaleString('es-CO')}</td>
                          <td>{p.Categoria}</td>
                          <td>{p.Tiempo_preparacion}</td>
                          <td style={{ color: p.Estado ? 'var(--verde)' : 'var(--rojo)' }}>{p.Estado ? 'Activo' : 'Inactivo'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className="ge-secondary-btn" onClick={() => abrirEditarProducto(p)}>Editar</button>
                              <button className={p.Estado ? 'ge-logout-btn' : 'ge-primary-btn'} onClick={() => toggleProducto(p.id_producto, p.Estado)}>{p.Estado ? 'Desactivar' : 'Activar'}</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="ge-bottom-grid">
              <div className="ge-card ge-tables-card">
                <div className="ge-card-header">
                  <h3 className="ge-section-title ge-section-title--sm">Estado de mesas</h3>
                  <div className="ge-legend">
                    <span className="ge-legend-item ge-legend-item--green"><span className="ge-legend-dot"></span>Disponible</span>
                    <span className="ge-legend-item ge-legend-item--yellow"><span className="ge-legend-dot"></span>Ocupada</span>
                  </div>
                </div>
                <div className="ge-tables-grid">
                  {mesas.map(m => (
                    <div key={m.id} className={`ge-table-box ${m.ocupada ? 'is-occupied' : 'is-free'}`}>
                      <span className="ge-table-id">{m.id}</span>
                      <span className={`material-symbols-outlined ge-table-icon ${m.ocupada ? 'is-occupied' : 'is-free'}`}>{m.ocupada ? 'person' : 'check_circle'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ge-card ge-movements-card">
                <div className="ge-card-header">
                  <h3 className="ge-section-title ge-section-title--sm">Movimientos recientes</h3>
                  <button className="ge-link-btn">Ver todo</button>
                </div>
                <div className="ge-movements-list">
                  {movimientos.map((mov, i) => (
                    <div key={i} className="ge-movement-item">
                      <div className="ge-movement-main">
                        <div className={`ge-movement-icon-wrap ${mov.positivo ? 'is-positive' : 'is-negative'}`}>
                          <span className="material-symbols-outlined ge-movement-icon">{mov.icon}</span>
                        </div>
                        <div>
                          <p className="ge-movement-title">{mov.titulo}</p>
                          <p className="ge-movement-sub">{mov.sub}</p>
                        </div>
                      </div>
                      <span className={`ge-movement-amount ${mov.positivo ? 'is-positive' : 'is-negative'}`}>{mov.monto}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* INVENTARIO — CRUD Ingredientes */}
        {seccionActiva === 'Inventario' && (
          <section className="ge-card ge-productos-card" style={{ marginTop: '1.5rem' }}>
            <div className="ge-productos-header">
              <h3 className="ge-section-title ge-section-title--sm">Gestión de Ingredientes</h3>
              <button className="ge-primary-btn" onClick={abrirCrearIngrediente}>+ Nuevo Ingrediente</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="ge-productos-tabla">
                <thead><tr><th>Nombre</th><th>Descripción</th><th>Unidad</th><th>Costo ref.</th><th>Stock mínimo</th><th>Acciones</th></tr></thead>
                <tbody>
                  {ingredientes.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--texto-muted)' }}>Cargando...</td></tr> : ingredientes.map(i => (
                    <tr key={i.id_ingrediente}>
                      <td><strong>{i.nombre}</strong></td>
                      <td>{i.descripcion}</td>
                      <td>{i.unidad_medida}</td>
                      <td>${Number(i.costo_unitario_ref).toLocaleString('es-CO')}</td>
                      <td>{i.stock_minimo}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="ge-secondary-btn" onClick={() => abrirEditarIngrediente(i)}>Editar</button>
                          <button className="ge-logout-btn" onClick={() => eliminarIngrediente(i.id_ingrediente)}>Eliminar</button>
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
          <section className="ge-card ge-productos-card" style={{ marginTop: '1.5rem' }}>
            <div className="ge-productos-header">
              <h3 className="ge-section-title ge-section-title--sm">Gestión de Proveedores</h3>
              <button className="ge-primary-btn" onClick={abrirCrearProveedor}>+ Nuevo Proveedor</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="ge-productos-tabla">
                <thead><tr><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {proveedores.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-muted)' }}>Cargando...</td></tr> : proveedores.map(p => (
                    <tr key={p.id_proveedor}>
                      <td><strong>{p.nombre}</strong></td>
                      <td>{p.nombre_contacto}</td>
                      <td>{p.telefono}</td>
                      <td>{p.email}</td>
                      <td>{p.tipo_proveedor}</td>
                      <td style={{ color: p.estado === 'ACTIVO' ? 'var(--verde)' : 'var(--rojo)' }}>{p.estado}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="ge-secondary-btn" onClick={() => abrirEditarProveedor(p)}>Editar</button>
                          <button className={p.estado === 'ACTIVO' ? 'ge-logout-btn' : 'ge-primary-btn'} onClick={() => toggleProveedor(p.id_proveedor, p.estado)}>{p.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</button>
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
          <section className="ge-card ge-productos-card" style={{ marginTop: '1.5rem' }}>
            <div className="ge-productos-header">
              <h3 className="ge-section-title ge-section-title--sm">Gestión de Cajas</h3>
              <button className="ge-primary-btn" onClick={abrirCrearCaja}>+ Nueva Caja</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="ge-productos-tabla">
                <thead><tr><th>Nombre</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {cajas.length === 0 ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--texto-muted)' }}>Cargando...</td></tr> : cajas.map(c => (
                    <tr key={c.id_caja}>
                      <td><strong>{c.nombre}</strong></td>
                      <td style={{ color: c.estado === 'ACTIVA' ? 'var(--verde)' : 'var(--rojo)' }}>{c.estado}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="ge-secondary-btn" onClick={() => abrirEditarCaja(c)}>Editar</button>
                          <button className={c.estado === 'ACTIVA' ? 'ge-logout-btn' : 'ge-primary-btn'} onClick={() => toggleCaja(c.id_caja, c.estado)}>{c.estado === 'ACTIVA' ? 'Desactivar' : 'Activar'}</button>
                        </div>
                      </td>
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
        <div style={{ padding: '1.5rem', minWidth: '400px' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--texto)' }}>{modoEdicionProducto ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          {errorProducto && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{errorProducto}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input placeholder="Nombre *" value={productoActual.Nombre} onChange={e => setProductoActual(p => ({ ...p, Nombre: e.target.value }))} style={inputStyle} />
            <textarea placeholder="Descripción" value={productoActual.Descripcion} onChange={e => setProductoActual(p => ({ ...p, Descripcion: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            <input type="number" placeholder="Precio *" value={productoActual.precio_venta} onChange={e => setProductoActual(p => ({ ...p, precio_venta: e.target.value }))} style={inputStyle} />
            <input placeholder="Categoría" value={productoActual.Categoria} onChange={e => setProductoActual(p => ({ ...p, Categoria: e.target.value }))} style={inputStyle} />
            <input placeholder="Tiempo prep. (HH:MM:SS)" value={productoActual.Tiempo_preparacion} onChange={e => setProductoActual(p => ({ ...p, Tiempo_preparacion: e.target.value }))} style={inputStyle} />
            <select value={productoActual.Estado} onChange={e => setProductoActual(p => ({ ...p, Estado: Number(e.target.value) }))} style={inputStyle}>
              <option value={1}>Activo</option><option value={0}>Inactivo</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button className="ge-secondary-btn" onClick={() => setModalProducto(false)} disabled={guardandoProducto}>Cancelar</button>
            <button className="ge-primary-btn" onClick={guardarProducto} disabled={guardandoProducto}>{guardandoProducto ? 'Guardando...' : modoEdicionProducto ? 'Actualizar' : 'Crear'}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL INGREDIENTES */}
      <Modal isOpen={modalIngrediente} onClose={() => setModalIngrediente(false)}>
        <div style={{ padding: '1.5rem', minWidth: '400px' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--texto)' }}>{modoEdicionIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</h3>
          {errorIngrediente && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{errorIngrediente}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input placeholder="Nombre *" value={ingredienteActual.nombre} onChange={e => setIngredienteActual(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
            <textarea placeholder="Descripción" value={ingredienteActual.descripcion} onChange={e => setIngredienteActual(p => ({ ...p, descripcion: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input placeholder="Unidad de medida" value={ingredienteActual.unidad_medida} onChange={e => setIngredienteActual(p => ({ ...p, unidad_medida: e.target.value }))} style={inputStyle} />
              <input type="number" placeholder="Costo unitario ref." value={ingredienteActual.costo_unitario_ref} onChange={e => setIngredienteActual(p => ({ ...p, costo_unitario_ref: e.target.value }))} style={inputStyle} />
            </div>
            <input type="number" placeholder="Stock mínimo" value={ingredienteActual.stock_minimo} onChange={e => setIngredienteActual(p => ({ ...p, stock_minimo: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button className="ge-secondary-btn" onClick={() => setModalIngrediente(false)} disabled={guardandoIngrediente}>Cancelar</button>
            <button className="ge-primary-btn" onClick={guardarIngrediente} disabled={guardandoIngrediente}>{guardandoIngrediente ? 'Guardando...' : modoEdicionIngrediente ? 'Actualizar' : 'Crear'}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL PROVEEDORES */}
      <Modal isOpen={modalProveedor} onClose={() => setModalProveedor(false)}>
        <div style={{ padding: '1.5rem', minWidth: '420px' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--texto)' }}>{modoEdicionProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
          {errorProveedor && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{errorProveedor}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input placeholder="Nombre *" value={proveedorActual.nombre} onChange={e => setProveedorActual(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
            <input placeholder="Nombre contacto" value={proveedorActual.nombre_contacto} onChange={e => setProveedorActual(p => ({ ...p, nombre_contacto: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input placeholder="Teléfono" value={proveedorActual.telefono} onChange={e => setProveedorActual(p => ({ ...p, telefono: e.target.value }))} style={inputStyle} />
              <input type="email" placeholder="Email" value={proveedorActual.email} onChange={e => setProveedorActual(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
            </div>
            <input placeholder="Dirección" value={proveedorActual.direccion} onChange={e => setProveedorActual(p => ({ ...p, direccion: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input placeholder="NIT" value={proveedorActual.nit} onChange={e => setProveedorActual(p => ({ ...p, nit: e.target.value }))} style={inputStyle} />
              <input placeholder="Tipo proveedor" value={proveedorActual.tipo_proveedor} onChange={e => setProveedorActual(p => ({ ...p, tipo_proveedor: e.target.value }))} style={inputStyle} />
            </div>
            <select value={proveedorActual.estado} onChange={e => setProveedorActual(p => ({ ...p, estado: e.target.value }))} style={inputStyle}>
              <option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button className="ge-secondary-btn" onClick={() => setModalProveedor(false)} disabled={guardandoProveedor}>Cancelar</button>
            <button className="ge-primary-btn" onClick={guardarProveedor} disabled={guardandoProveedor}>{guardandoProveedor ? 'Guardando...' : modoEdicionProveedor ? 'Actualizar' : 'Crear'}</button>
          </div>
        </div>
      </Modal>

      {/* MODAL CAJAS */}
      <Modal isOpen={modalCaja} onClose={() => setModalCaja(false)}>
        <div style={{ padding: '1.5rem', minWidth: '380px' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--texto)' }}>{modoEdicionCaja ? 'Editar Caja' : 'Nueva Caja'}</h3>
          {errorCaja && <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{errorCaja}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input placeholder="Nombre de la caja *" value={cajaActual.nombre} onChange={e => setCajaActual(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
            <select value={cajaActual.estado} onChange={e => setCajaActual(p => ({ ...p, estado: e.target.value }))} style={inputStyle}>
              <option value="ACTIVA">Activa</option><option value="INACTIVA">Inactiva</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button className="ge-secondary-btn" onClick={() => setModalCaja(false)} disabled={guardandoCaja}>Cancelar</button>
            <button className="ge-primary-btn" onClick={guardarCaja} disabled={guardandoCaja}>{guardandoCaja ? 'Guardando...' : modoEdicionCaja ? 'Actualizar' : 'Crear'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Gerente