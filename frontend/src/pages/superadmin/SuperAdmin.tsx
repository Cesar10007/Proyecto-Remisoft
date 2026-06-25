import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import './SuperAdmin.css'
import '../gerente/Gerente.css'
import Footer from '../../components/layout/Footer'

const menuItems = [
  { icon: 'group', label: 'Gestión de Usuarios' },
  { icon: 'people', label: 'Gestión de Clientes' },
  { icon: 'mark_email_unread', label: 'Solicitudes' },
  { icon: 'settings_applications', label: 'Configuración del Sistema' },
]

const metrics = [
  { label: 'Usuarios Activos Totales', value: '12,482', detail: '+8.4% este mes', icon: 'trending_up', color: 'green' },
  { label: 'Solicitudes Pendientes', value: '42', detail: '12 Prioridad Urgente', icon: null, color: 'amber' },
  { label: 'Tiempo de Actividad del Sistema', value: '99.98%', detail: 'Todos los nodos saludables', icon: 'check_circle', color: 'green' },
  { label: 'Respuesta de API', value: '142ms', detail: 'Latencia promedio global', icon: null, color: 'default' },
]

const requests = [
  { icon: 'key', title: 'Omisión de Restablecimiento de Contraseña', sub: 'Solicitud de David Lynch', color: 'primary' },
  { icon: 'person_search', title: 'Verificación de Cuenta', sub: 'Se requiere verificación manual de ID', color: 'secondary' },
]

const serverStats = [
  { name: 'Motor de Autenticación', value: 'ESTABLE', color: 'green' },
  { name: 'Sincronización de Datos', value: '94.2% CARGA', color: 'green' },
  { name: 'Cola de Correo', value: 'RECUPERANDO', color: 'amber' },
]

const roles = [
  { id: 1, nombre: 'SUPERADMIN' },
  { id: 2, nombre: 'GERENTE' },
  { id: 3, nombre: 'CAJERO' },
  { id: 4, nombre: 'MESERO' },
  { id: 5, nombre: 'REPARTIDOR' },
  { id: 6, nombre: 'CLIENTE' },
]

interface Usuario {
  id_usuario: number
  identificacion: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  activo: number
  rol: string
  id_rol?: number
}

interface Cliente {
  id_cliente: number
  Nombre: string
  Apellido: string
  Email: string
  Telefono: string
  Direccion: string
  tipo_documento: string
  Num_documento: string
}

const usuarioVacio = {
  id_rol: 4,
  identificacion: '',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  contrasena: '',
  activo: 1,
}

const clienteVacio = {
  Nombre: '',
  Apellido: '',
  Email: '',
  Telefono: '',
  Direccion: '',
  tipo_documento: 'CC',
  Num_documento: '',
}

function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('Gestión de Usuarios')
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  // Usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [modalUsuario, setModalUsuario] = useState(false)
  const [modoEdicionUsuario, setModoEdicionUsuario] = useState(false)
  const [usuarioActual, setUsuarioActual] = useState<typeof usuarioVacio>(usuarioVacio)
  const [idEditandoUsuario, setIdEditandoUsuario] = useState<number | null>(null)
  const [guardandoUsuario, setGuardandoUsuario] = useState(false)
  const [errorUsuario, setErrorUsuario] = useState<string | null>(null)

  // Clientes
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [modalCliente, setModalCliente] = useState(false)
  const [modoEdicionCliente, setModoEdicionCliente] = useState(false)
  const [clienteActual, setClienteActual] = useState<typeof clienteVacio>(clienteVacio)
  const [idEditandoCliente, setIdEditandoCliente] = useState<number | null>(null)
  const [guardandoCliente, setGuardandoCliente] = useState(false)
  const [errorCliente, setErrorCliente] = useState<string | null>(null)

  const cargarUsuarios = () => {
    api.get('/usuarios').then(res => setUsuarios(res.data)).catch(console.error)
  }

  const cargarClientes = () => {
    api.get('/clientes').then(res => setClientes(res.data)).catch(console.error)
  }

  useEffect(() => { cargarUsuarios() }, [])
  useEffect(() => { if (activeTab === 'Gestión de Clientes') cargarClientes() }, [activeTab])

  // --- CRUD Usuarios ---
  const abrirCrearUsuario = () => {
    setModoEdicionUsuario(false)
    setUsuarioActual(usuarioVacio)
    setIdEditandoUsuario(null)
    setErrorUsuario(null)
    setModalUsuario(true)
  }

  const abrirEditarUsuario = (u: Usuario) => {
    setModoEdicionUsuario(true)
    setUsuarioActual({
      id_rol: u.id_rol ?? 4,
      identificacion: u.identificacion,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telefono: u.telefono,
      contrasena: '',
      activo: u.activo,
    })
    setIdEditandoUsuario(u.id_usuario)
    setErrorUsuario(null)
    setModalUsuario(true)
  }

  const guardarUsuario = async () => {
    if (!usuarioActual.nombre.trim()) { setErrorUsuario('El nombre es obligatorio'); return }
    if (!usuarioActual.email.trim()) { setErrorUsuario('El email es obligatorio'); return }
    if (!modoEdicionUsuario && !usuarioActual.contrasena) { setErrorUsuario('La contraseña es obligatoria'); return }

    setGuardandoUsuario(true)
    setErrorUsuario(null)
    try {
      if (modoEdicionUsuario && idEditandoUsuario !== null) {
        await api.put(`/usuarios/${idEditandoUsuario}`, usuarioActual)
      } else {
        await api.post('/usuarios', usuarioActual)
      }
      setModalUsuario(false)
      cargarUsuarios()
    } catch (err: any) {
      setErrorUsuario(err.response?.data?.message ?? 'Error al guardar')
    } finally {
      setGuardandoUsuario(false)
    }
  }

  const toggleUsuario = async (id: number, activo: number) => {
    if (!confirm(`¿Deseas ${activo ? 'desactivar' : 'activar'} este usuario?`)) return
    try {
      await api.delete(`/usuarios/${id}`)
      cargarUsuarios()
    } catch { alert('Error al cambiar estado') }
  }

  // --- CRUD Clientes ---
  const abrirCrearCliente = () => {
    setModoEdicionCliente(false)
    setClienteActual(clienteVacio)
    setIdEditandoCliente(null)
    setErrorCliente(null)
    setModalCliente(true)
  }

  const abrirEditarCliente = (c: Cliente) => {
    setModoEdicionCliente(true)
    setClienteActual({
      Nombre: c.Nombre,
      Apellido: c.Apellido,
      Email: c.Email,
      Telefono: c.Telefono,
      Direccion: c.Direccion,
      tipo_documento: c.tipo_documento,
      Num_documento: c.Num_documento,
    })
    setIdEditandoCliente(c.id_cliente)
    setErrorCliente(null)
    setModalCliente(true)
  }

  const guardarCliente = async () => {
    if (!clienteActual.Nombre.trim()) { setErrorCliente('El nombre es obligatorio'); return }
    if (!clienteActual.Email.trim()) { setErrorCliente('El email es obligatorio'); return }

    setGuardandoCliente(true)
    setErrorCliente(null)
    try {
      if (modoEdicionCliente && idEditandoCliente !== null) {
        await api.put(`/clientes/${idEditandoCliente}`, clienteActual)
      } else {
        await api.post('/clientes', clienteActual)
      }
      setModalCliente(false)
      cargarClientes()
    } catch (err: any) {
      setErrorCliente(err.response?.data?.message ?? 'Error al guardar')
    } finally {
      setGuardandoCliente(false)
    }
  }

  const eliminarCliente = async (id: number) => {
    if (!confirm('¿Eliminar este cliente?')) return
    try {
      await api.delete(`/clientes/${id}`)
      cargarClientes()
    } catch { alert('Error al eliminar') }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
    border: '1.5px solid var(--borde)', background: 'var(--bg)',
    fontSize: '0.95rem', color: 'var(--texto)', outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div className="sa-wrapper">
      <aside className="ge-sidebar">
        <div className="ge-sidebar-brand">
          <div className="ge-logo">Remi<span className="ge-logo-accent">Soft</span></div>
          <div className="ge-role">Superadministrador</div>
        </div>
        <div className="ge-sidebar-menu">
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`ge-menu-btn ${activeTab === item.label ? 'is-active' : ''}`}
            >
              <span className="material-symbols-outlined ge-menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="ge-sidebar-footer">
          <button className="ge-primary-btn">Soporte</button>
          <button onClick={() => { logout(); navigate('/') }} className="ge-logout-btn">
            <span className="material-symbols-outlined ge-logout-icon">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="sa-main" style={{ marginLeft: '240px' }}>
        <header className="sa-topbar">
          <div className="sa-topbar__left">
            <h1 className="sa-topbar__title">Centro de Comando Administrativo</h1>
            <p style={{ color: 'var(--texto-muted)', fontSize: '0.85rem', margin: 0 }}>
              Bienvenido, {user?.nombre ?? 'SuperAdmin'}
            </p>
          </div>
          <div className="sa-topbar__right">
            <button className="sa-icon-btn"><span className="material-symbols-outlined">notifications</span></button>
            <button className="sa-icon-btn"><span className="material-symbols-outlined">admin_panel_settings</span></button>
          </div>
        </header>

        <div className="sa-content">

          {/* GESTIÓN DE USUARIOS */}
          {activeTab === 'Gestión de Usuarios' && (
            <>
              <section className="sa-metrics-grid">
                {metrics.map((metric) => (
                  <div key={metric.label} className="sa-metric-card">
                    <p className="sa-metric-card__label">{metric.label}</p>
                    <h3 className={`sa-metric-card__value${metric.color ? ` sa-metric-card__value--${metric.color}` : ''}`}>{metric.value}</h3>
                    {metric.icon ? (
                      <div className={`sa-metric-card__detail sa-metric-card__detail--${metric.color}`}>
                        <span className="material-symbols-outlined">{metric.icon}</span>
                        <span>{metric.detail}</span>
                      </div>
                    ) : (
                      <p className="sa-metric-card__text-detail">{metric.detail}</p>
                    )}
                  </div>
                ))}
              </section>

              <section className="sa-users-panel">
                <div className="sa-panel-header">
                  <div>
                    <h2 className="sa-panel-title">Gestión de Usuarios</h2>
                    <p className="sa-panel-subtitle">Controlar acceso a la plataforma y privilegios de usuario</p>
                  </div>
                  <button className="sa-btn-add-member" onClick={abrirCrearUsuario}>
                    <span className="material-symbols-outlined">person_add</span>
                    <span>Agregar Usuario</span>
                  </button>
                </div>
                <div className="sa-table-card">
                  <div className="sa-table-scroll">
                    <table className="sa-table">
                      <thead>
                        <tr>
                          <th>Usuario</th>
                          <th>Identificación</th>
                          <th>Rol</th>
                          <th>Teléfono</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--texto-muted)' }}>Cargando usuarios...</td></tr>
                        ) : (
                          usuarios.map((u) => (
                            <tr key={u.id_usuario}>
                              <td>
                                <div className="sa-user-cell">
                                  <div className="sa-user-avatar-wrap" style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: 'var(--rojo)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                                  }}>
                                    {u.nombre?.[0]?.toUpperCase() ?? 'U'}
                                  </div>
                                  <div>
                                    <p className="sa-user-name">{u.nombre} {u.apellido}</p>
                                    <p className="sa-user-email">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td>{u.identificacion}</td>
                              <td><span className="sa-role-pill">{u.rol}</span></td>
                              <td>{u.telefono}</td>
                              <td>
                                <div className="sa-status-wrap">
                                  <span className={`sa-status-dot${u.activo ? ' sa-status-dot--active' : ''}`} />
                                  <span className={`sa-status-text${u.activo ? ' sa-status-text--active' : ''}`}>
                                    {u.activo ? 'Activo' : 'Inactivo'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="sa-actions-cell">
                                  <button className="sa-action-btn" onClick={() => abrirEditarUsuario(u)}>
                                    <span className="material-symbols-outlined">edit</span>
                                  </button>
                                  <button
                                    className={`sa-action-btn ${u.activo ? 'sa-action-btn--danger' : ''}`}
                                    onClick={() => toggleUsuario(u.id_usuario, u.activo)}
                                  >
                                    <span className="material-symbols-outlined">{u.activo ? 'block' : 'check_circle'}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* GESTIÓN DE CLIENTES */}
          {activeTab === 'Gestión de Clientes' && (
            <section className="sa-users-panel">
              <div className="sa-panel-header">
                <div>
                  <h2 className="sa-panel-title">Gestión de Clientes</h2>
                  <p className="sa-panel-subtitle">Administrar clientes registrados del restaurante</p>
                </div>
                <button className="sa-btn-add-member" onClick={abrirCrearCliente}>
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Nuevo Cliente</span>
                </button>
              </div>
              <div className="sa-table-card">
                <div className="sa-table-scroll">
                  <table className="sa-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Documento</th>
                        <th>Dirección</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.length === 0 ? (
                        <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--texto-muted)' }}>Cargando clientes...</td></tr>
                      ) : (
                        clientes.map((c) => (
                          <tr key={c.id_cliente}>
                            <td>
                              <div className="sa-user-cell">
                                <div style={{
                                  width: 36, height: 36, borderRadius: '50%',
                                  background: 'var(--verde)', color: 'white',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                                }}>
                                  {c.Nombre?.[0]?.toUpperCase() ?? 'C'}
                                </div>
                                <div>
                                  <p className="sa-user-name">{c.Nombre} {c.Apellido}</p>
                                </div>
                              </div>
                            </td>
                            <td>{c.Email}</td>
                            <td>{c.Telefono}</td>
                            <td>{c.tipo_documento} {c.Num_documento}</td>
                            <td>{c.Direccion}</td>
                            <td>
                              <div className="sa-actions-cell">
                                <button className="sa-action-btn" onClick={() => abrirEditarCliente(c)}>
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button className="sa-action-btn sa-action-btn--danger" onClick={() => eliminarCliente(c.id_cliente)}>
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* SOLICITUDES */}
          {activeTab === 'Solicitudes' && (
            <div className="sa-requests-card">
              <div className="sa-requests-header">
                <h2 className="sa-panel-title">Solicitudes Pendientes</h2>
                <span className="sa-urgent-badge">Urgente</span>
              </div>
              <div className="sa-requests-list">
                {requests.map((req) => (
                  <div key={req.title} className="sa-request-item">
                    <div className="sa-request-item__top">
                      <div className={`sa-request-icon sa-request-icon--${req.color}`}>
                        <span className="material-symbols-outlined">{req.icon}</span>
                      </div>
                      <div>
                        <p className="sa-request-title">{req.title}</p>
                        <p className="sa-request-sub">{req.sub}</p>
                      </div>
                    </div>
                    <div className="sa-request-actions">
                      <button className="sa-request-btn sa-request-btn--approve">Aprobar</button>
                      <button className="sa-request-btn sa-request-btn--reject">Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONFIGURACIÓN */}
          {activeTab === 'Configuración del Sistema' && (
            <section className="sa-bottom-grid">
              <div className="sa-server-card">
                <div className="sa-server-card__content">
                  <h2 className="sa-panel-title">Radar de Salud del Servidor</h2>
                  <p className="sa-panel-subtitle">Estado en tiempo real de microservicios</p>
                  <div className="sa-server-stats">
                    {serverStats.map((item) => (
                      <div key={item.name} className={`sa-server-stat${item.color === 'amber' ? ' sa-server-stat--warning' : ''}`}>
                        <span className={`sa-server-stat__dot sa-server-stat__dot--${item.color}`} />
                        <div>
                          <p className="sa-server-stat__label">{item.name}</p>
                          <p className="sa-server-stat__value">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="sa-audit-card">
                <div className="sa-audit-card__content">
                  <span className="material-symbols-outlined sa-audit-card__icon">auto_awesome</span>
                  <h3>Inteligencia de Auditoría</h3>
                  <p>Patrones impulsados por IA detectaron 3 intentos potenciales de acceso no autorizado hoy.</p>
                </div>
                <button className="sa-audit-btn">Ejecutar Auditoría de Seguridad Completa</button>
                <div className="sa-audit-card__glow" />
              </div>
            </section>
          )}

          <Footer />
        </div>
      </main>

      {/* MODAL USUARIO */}
      <Modal isOpen={modalUsuario} onClose={() => setModalUsuario(false)}>
        <div style={{ padding: '1.5rem', minWidth: '420px' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--texto)' }}>
            {modoEdicionUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          {errorUsuario && (
            <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{errorUsuario}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input name="nombre" placeholder="Nombre *" value={usuarioActual.nombre}
                onChange={e => setUsuarioActual(p => ({ ...p, nombre: e.target.value }))} style={inputStyle} />
              <input name="apellido" placeholder="Apellido" value={usuarioActual.apellido}
                onChange={e => setUsuarioActual(p => ({ ...p, apellido: e.target.value }))} style={inputStyle} />
            </div>
            <input name="email" type="email" placeholder="Email *" value={usuarioActual.email}
              onChange={e => setUsuarioActual(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input name="identificacion" placeholder="Identificación" value={usuarioActual.identificacion}
                onChange={e => setUsuarioActual(p => ({ ...p, identificacion: e.target.value }))} style={inputStyle} />
              <input name="telefono" placeholder="Teléfono" value={usuarioActual.telefono}
                onChange={e => setUsuarioActual(p => ({ ...p, telefono: e.target.value }))} style={inputStyle} />
            </div>
            {!modoEdicionUsuario && (
              <input name="contrasena" type="password" placeholder="Contraseña *" value={usuarioActual.contrasena}
                onChange={e => setUsuarioActual(p => ({ ...p, contrasena: e.target.value }))} style={inputStyle} />
            )}
            <select value={usuarioActual.id_rol}
              onChange={e => setUsuarioActual(p => ({ ...p, id_rol: Number(e.target.value) }))} style={inputStyle}>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button className="ge-secondary-btn" onClick={() => setModalUsuario(false)} disabled={guardandoUsuario}>Cancelar</button>
            <button className="ge-primary-btn" onClick={guardarUsuario} disabled={guardandoUsuario}>
              {guardandoUsuario ? 'Guardando...' : modoEdicionUsuario ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL CLIENTE */}
      <Modal isOpen={modalCliente} onClose={() => setModalCliente(false)}>
        <div style={{ padding: '1.5rem', minWidth: '420px' }}>
          <h3 style={{ margin: '0 0 1rem', color: 'var(--texto)' }}>
            {modoEdicionCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          {errorCliente && (
            <p style={{ color: 'var(--rojo)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{errorCliente}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input placeholder="Nombre *" value={clienteActual.Nombre}
                onChange={e => setClienteActual(p => ({ ...p, Nombre: e.target.value }))} style={inputStyle} />
              <input placeholder="Apellido" value={clienteActual.Apellido}
                onChange={e => setClienteActual(p => ({ ...p, Apellido: e.target.value }))} style={inputStyle} />
            </div>
            <input type="email" placeholder="Email *" value={clienteActual.Email}
              onChange={e => setClienteActual(p => ({ ...p, Email: e.target.value }))} style={inputStyle} />
            <input placeholder="Teléfono" value={clienteActual.Telefono}
              onChange={e => setClienteActual(p => ({ ...p, Telefono: e.target.value }))} style={inputStyle} />
            <input placeholder="Dirección" value={clienteActual.Direccion}
              onChange={e => setClienteActual(p => ({ ...p, Direccion: e.target.value }))} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select value={clienteActual.tipo_documento}
                onChange={e => setClienteActual(p => ({ ...p, tipo_documento: e.target.value }))} style={inputStyle}>
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="TI">TI</option>
                <option value="PP">PP</option>
              </select>
              <input placeholder="Número documento" value={clienteActual.Num_documento}
                onChange={e => setClienteActual(p => ({ ...p, Num_documento: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button className="ge-secondary-btn" onClick={() => setModalCliente(false)} disabled={guardandoCliente}>Cancelar</button>
            <button className="ge-primary-btn" onClick={guardarCliente} disabled={guardandoCliente}>
              {guardandoCliente ? 'Guardando...' : modoEdicionCliente ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SuperAdmin