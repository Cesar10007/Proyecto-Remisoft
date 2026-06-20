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

interface Producto {
  id_producto: number
  Nombre: string
  Descripcion: string
  precio_venta: string
  Categoria: string
  Tiempo_preparacion: string
  Estado: number
}

const productoVacio: Omit<Producto, 'id_producto'> = {
  Nombre: '',
  Descripcion: '',
  precio_venta: '',
  Categoria: '',
  Tiempo_preparacion: '00:00:00',
  Estado: 1,
}

function Gerente() {
  const [seccionActiva, setSeccionActiva] = useState('Menú')
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [productos, setProductos] = useState<Producto[]>([])
  const [fuenteProductos, setFuenteProductos] = useState<'vista' | 'sp'>('vista')
  const [cargandoProductos, setCargandoProductos] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [productoActual, setProductoActual] = useState<Omit<Producto, 'id_producto'>>(productoVacio)
  const [idEditando, setIdEditando] = useState<number | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cargarProductos = () => {
    const endpoint = fuenteProductos === 'vista' ? '/productos/vista' : '/productos/sp'
    setCargandoProductos(true)
    api.get(endpoint)
      .then(res => setProductos(res.data))
      .catch(err => console.error(err))
      .finally(() => setCargandoProductos(false))
  }

  useEffect(() => {
    cargarProductos()
  }, [fuenteProductos])

  const abrirCrear = () => {
    setModoEdicion(false)
    setProductoActual(productoVacio)
    setIdEditando(null)
    setError(null)
    setModalAbierto(true)
  }

  const abrirEditar = (p: Producto) => {
    setModoEdicion(true)
    setProductoActual({
      Nombre: p.Nombre,
      Descripcion: p.Descripcion,
      precio_venta: p.precio_venta,
      Categoria: p.Categoria,
      Tiempo_preparacion: p.Tiempo_preparacion,
      Estado: p.Estado,
    })
    setIdEditando(p.id_producto)
    setError(null)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setError(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProductoActual(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const guardar = async () => {
    if (!productoActual.Nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!productoActual.precio_venta) { setError('El precio es obligatorio'); return }

    setGuardando(true)
    setError(null)
    try {
      if (modoEdicion && idEditando !== null) {
        await api.put(`/productos/${idEditando}`, productoActual)
      } else {
        await api.post('/productos', productoActual)
      }
      cerrarModal()
      cargarProductos()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const toggleEstado = async (id: number, estadoActual: number) => {
    const accion = estadoActual ? 'desactivar' : 'activar'
    if (!confirm(`¿Deseas ${accion} este producto?`)) return
    try {
      await api.delete(`/productos/${id}`)
      cargarProductos()
    } catch {
      alert(`Error al ${accion} el producto`)
    }
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
            <button
              key={item.label}
              onClick={() => setSeccionActiva(item.label)}
              className={`ge-menu-btn ${seccionActiva === item.label ? 'is-active' : ''}`}
            >
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
                <button className="ge-primary-btn ge-primary-btn--split">
                  Nuevo Pedido
                  <span className="material-symbols-outlined ge-action-icon">arrow_forward</span>
                </button>
                <button className="ge-secondary-btn ge-secondary-btn--split">
                  Control de Menú
                  <span className="material-symbols-outlined ge-action-icon">edit_note</span>
                </button>
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

        {/* SECCIÓN PRODUCTOS */}
        <section className="ge-card ge-productos-card" style={{ marginTop: '1.5rem' }}>
          <div className="ge-productos-header">
            <h3 className="ge-section-title ge-section-title--sm">Listado de Productos</h3>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button
                className={`ge-secondary-btn ${fuenteProductos === 'vista' ? 'is-active' : ''}`}
                onClick={() => setFuenteProductos('vista')}
              >Vista SQL</button>
              <button
                className={`ge-secondary-btn ${fuenteProductos === 'sp' ? 'is-active' : ''}`}
                onClick={() => setFuenteProductos('sp')}
              >Procedimiento</button>
              <button className="ge-primary-btn" onClick={abrirCrear}>+ Nuevo Producto</button>
            </div>
          </div>

          {cargandoProductos ? (
            <p style={{ color: 'var(--texto-muted)', fontSize: '0.85rem' }}>Cargando productos...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="ge-productos-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Categoría</th>
                    <th>Tiempo prep.</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: 'var(--texto-muted)' }}>Sin productos</td>
                    </tr>
                  ) : (
                    productos.map(p => (
                      <tr key={p.id_producto}>
                        <td><strong>{p.Nombre}</strong></td>
                        <td>{p.Descripcion}</td>
                        <td>${Number(p.precio_venta).toLocaleString('es-CO')}</td>
                        <td>{p.Categoria}</td>
                        <td>{p.Tiempo_preparacion}</td>
                        <td style={{ color: p.Estado ? 'var(--verde)' : 'var(--rojo)' }}>
                          {p.Estado ? 'Activo' : 'Inactivo'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="ge-secondary-btn" onClick={() => abrirEditar(p)}>Editar</button>
                            <button
                              className={p.Estado ? 'ge-logout-btn' : 'ge-primary-btn'}
                              onClick={() => toggleEstado(p.id_producto, p.Estado)}
                            >
                              {p.Estado ? 'Desactivar' : 'Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
                  <span className={`material-symbols-outlined ge-table-icon ${m.ocupada ? 'is-occupied' : 'is-free'}`}>
                    {m.ocupada ? 'person' : 'check_circle'}
                  </span>
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
      </main>

      {/* MODAL CRUD */}
      <Modal isOpen={modalAbierto} onClose={cerrarModal}>
        <div style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--texto-principal)' }}>
            {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>

          {error && (
            <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              name="Nombre"
              placeholder="Nombre *"
              value={productoActual.Nombre}
              onChange={handleChange}
              className="ge-input"
            />
            <textarea
              name="Descripcion"
              placeholder="Descripción"
              value={productoActual.Descripcion}
              onChange={handleChange}
              className="ge-input"
              rows={3}
            />
            <input
              name="precio_venta"
              type="number"
              placeholder="Precio *"
              value={productoActual.precio_venta}
              onChange={handleChange}
              className="ge-input"
            />
            <input
              name="Categoria"
              placeholder="Categoría"
              value={productoActual.Categoria}
              onChange={handleChange}
              className="ge-input"
            />
            <input
              name="Tiempo_preparacion"
              placeholder="Tiempo preparación (HH:MM:SS)"
              value={productoActual.Tiempo_preparacion}
              onChange={handleChange}
              className="ge-input"
            />
            <select
              name="Estado"
              value={productoActual.Estado}
              onChange={handleChange}
              className="ge-input"
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button className="ge-secondary-btn" onClick={cerrarModal} disabled={guardando}>Cancelar</button>
            <button className="ge-primary-btn" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Gerente