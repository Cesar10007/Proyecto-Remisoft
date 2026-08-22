/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import './Repartidor.css'

const menuItems = [
  { icon: 'dashboard', label: 'Resumen' },
  { icon: 'local_shipping', label: 'Entregas' },
  { icon: 'history', label: 'Historial' },
  { icon: 'support_agent', label: 'Soporte' },
]

interface Domicilio {
  id_domicilio: number
  id_pedido: number
  direccion: string
  estado: string
  id_repartidor: number | null
  estado_pedido?: string
  nombre_cliente?: string
}

const domicilioVacio = {
  id_pedido: '',
  direccion: '',
  estado: 'ASIGNADO',
  id_repartidor: '',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.08)',
  background: '#fcfaf8',
  fontSize: '0.9rem',
  color: '#1a1a1a',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'DM Sans, sans-serif',
}

const estadoColor: Record<string, string> = {
  ASIGNADO: '#9a5e10',
  EN_CAMINO: '#1d9e75',
  ENTREGADO: '#1d9e75',
  CANCELADO: '#c24732',
}

const estadoBg: Record<string, string> = {
  ASIGNADO: '#faeeda',
  EN_CAMINO: '#e1f5ee',
  ENTREGADO: '#e1f5ee',
  CANCELADO: '#fdecea',
}

function Repartidor() {
  const [activeItem, setActiveItem] = useState('Resumen')
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [domicilios, setDomicilios] = useState<Domicilio[]>([])
  const [cargandoDomicilios, setCargandoDomicilios] = useState(false)
  const [modalDomicilio, setModalDomicilio] = useState(false)
  const [modoEdicionDomicilio, setModoEdicionDomicilio] = useState(false)
  const [domicilioActual, setDomicilioActual] = useState(domicilioVacio)
  const [idEditandoDomicilio, setIdEditandoDomicilio] = useState<number | null>(null)
  const [guardandoDomicilio, setGuardandoDomicilio] = useState(false)
  const [errorDomicilio, setErrorDomicilio] = useState<string | null>(null)

  const cargarDomicilios = () => {
    setCargandoDomicilios(true)
    api.get('/domicilios').then(r => setDomicilios(r.data)).catch(console.error).finally(() => setCargandoDomicilios(false))
  }

  useEffect(() => { if (activeItem === 'Entregas') cargarDomicilios() }, [activeItem])

  const abrirCrearDomicilio = () => {
    setModoEdicionDomicilio(false)
    setDomicilioActual(domicilioVacio)
    setIdEditandoDomicilio(null)
    setErrorDomicilio(null)
    setModalDomicilio(true)
  }

  // Comunicación HIJO → PADRE: el botón Editar de la tarjeta (hijo) llama esta función
  // pasando los datos del domicilio al estado del padre para poblar el formulario
  const abrirEditarDomicilio = (d: Domicilio) => {
    setModoEdicionDomicilio(true)
    setDomicilioActual({
      id_pedido: d.id_pedido.toString(),
      direccion: d.direccion,
      estado: d.estado,
      id_repartidor: d.id_repartidor?.toString() ?? '',
    })
    setIdEditandoDomicilio(d.id_domicilio)
    setErrorDomicilio(null)
    setModalDomicilio(true)
  }

  const guardarDomicilio = async () => {
    if (!domicilioActual.id_pedido) { setErrorDomicilio('El ID del pedido es obligatorio'); return }
    if (!domicilioActual.direccion.trim()) { setErrorDomicilio('La dirección es obligatoria'); return }
    setGuardandoDomicilio(true)
    setErrorDomicilio(null)
    try {
      const payload = {
        ...domicilioActual,
        id_pedido: Number(domicilioActual.id_pedido),
        id_repartidor: domicilioActual.id_repartidor ? Number(domicilioActual.id_repartidor) : null,
      }
      modoEdicionDomicilio && idEditandoDomicilio
        ? await api.put(`/domicilios/${idEditandoDomicilio}`, payload)
        : await api.post('/domicilios', payload)
      setModalDomicilio(false)
      cargarDomicilios()
    } catch (err: any) {
      setErrorDomicilio(err.response?.data?.message ?? 'Error al guardar')
    } finally {
      setGuardandoDomicilio(false)
    }
  }

  const cancelarDomicilio = async (id: number) => {
    if (!confirm('¿Deseas cancelar este domicilio?')) return
    try { await api.delete(`/domicilios/${id}`); cargarDomicilios() } catch { alert('Error al cancelar') }
  }

  return (
    <div
      className="flex min-h-screen font-['DM_Sans']"
      style={{
        ['--rd-primary' as any]: '#d85a30',
        ['--rd-primary-dark' as any]: '#993c1d',
        ['--rd-primary-soft' as any]: '#faece7',
        ['--rd-secondary' as any]: '#ef9f27',
        ['--rd-secondary-soft' as any]: '#faeeda',
        ['--rd-success' as any]: '#1d9e75',
        ['--rd-success-soft' as any]: '#e1f5ee',
        ['--rd-danger' as any]: '#c24732',
        ['--rd-bg' as any]: '#fdfaf7',
        ['--rd-card' as any]: '#ffffff',
        ['--rd-border' as any]: 'rgba(0,0,0,0.08)',
        ['--rd-text' as any]: '#1a1a1a',
        ['--rd-text-muted' as any]: '#5f5e5a',
        background: 'var(--rd-bg)',
        color: 'var(--rd-text)',
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="fixed left-0 top-0 z-20 flex min-h-screen w-60 flex-col border-r border-[var(--rd-border)] bg-[var(--rd-card)] p-4">
        <div className="mb-8 px-2">
          <span className="block font-['Syne'] text-[1.2rem] font-extrabold text-[var(--rd-primary-dark)]">
            Remi<span className="text-[var(--rd-secondary)]">Soft</span>
          </span>
          <span className="mt-1 block text-[0.7rem] uppercase tracking-[1.5px] text-[var(--rd-text-muted)]">
            Operación de Reparto
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[0.92rem] font-medium ${
                activeItem === item.label
                  ? 'bg-[var(--rd-primary-soft)] font-bold text-[var(--rd-primary-dark)]'
                  : 'bg-transparent text-[var(--rd-text-muted)] hover:bg-[#f8f4f1] hover:text-[var(--rd-text)]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
              {item.label === 'Soporte' && (
                <span className="ml-auto rounded-full bg-[var(--rd-primary)] px-2 py-0.5 text-[0.7rem] font-bold text-white">3</span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2.5 px-1">
          <button className="w-full rounded-xl border-none bg-[var(--rd-primary)] px-4 py-3.5 font-bold text-white">
            <span className="material-symbols-outlined mr-2 align-middle text-[18px]">schedule</span>
            Finalizar turno
          </button>
          <button className="flex items-center gap-2.5 rounded-[10px] border-none bg-transparent px-3 py-2.5 text-[0.9rem] text-[var(--rd-text-muted)] hover:bg-[#f8f4f1]">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            Configuraciones
          </button>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-2.5 rounded-[10px] border-none bg-transparent px-3 py-2.5 text-[0.9rem] text-[#b64646] hover:bg-[#f8f4f1]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="ml-60 min-w-0 flex-1">
        {activeItem === 'Resumen' && (
          <>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-[var(--rd-border)] bg-[rgba(253,250,247,0.88)] px-7 py-5.5 backdrop-blur-[12px]">
              <div className="flex flex-col gap-1">
                <p className="text-[0.88rem] text-[var(--rd-text-muted)]">Bienvenido de nuevo, <strong>{user?.nombre ?? 'Repartidor'}</strong></p>
              </div>
              <div className="flex flex-wrap items-center gap-3.5">
                <div className="relative w-80">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[var(--rd-text-muted)]">search</span>
                  <input
                    type="text"
                    placeholder="Buscar una orden específica..."
                    className="w-full rounded-full border border-[var(--rd-border)] bg-white py-2.5 pl-10 pr-4 outline-none"
                  />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--rd-success-soft)] px-3 py-2 text-[0.76rem] font-bold text-[var(--rd-success)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--rd-success)]" />
                  En turno
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[var(--rd-text-muted)]">
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
                <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#f2ece8] text-[0.9rem] font-bold text-[var(--rd-primary-dark)]">
                  {(user?.nombre ?? 'R')[0].toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-7">
              <div className="grid grid-cols-3 gap-4.5">
                <div className="flex min-h-[140px] flex-col justify-between rounded-[22px] border-transparent bg-gradient-to-br from-[#d85a30] to-[#b34725] p-5.5 text-white">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-white/82">Ganancias del día</span>
                  <span className="font-['Syne'] text-[2rem] font-extrabold">$142.500</span>
                  <span className="text-[0.8rem] font-semibold text-white/82">+12% vs ayer</span>
                </div>
                <div className="flex min-h-[140px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Entregas completadas</span>
                  <span className="font-['Syne'] text-[2rem] font-extrabold text-[var(--rd-success)]">18</span>
                  <span className="text-[0.8rem] font-semibold text-[var(--rd-success)]">2 pendientes en cola</span>
                </div>
                <div className="flex min-h-[140px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Tiempo de turno</span>
                  <span className="font-['Syne'] text-[2rem] font-extrabold">6h 14m</span>
                  <span className="text-[0.8rem] font-semibold text-[var(--rd-text-muted)]">Inicio: 11:30 AM</span>
                </div>
              </div>

              <div className="grid grid-cols-[2fr_1fr] gap-6">
                <div className="overflow-hidden rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)]">
                  <div className="relative h-[260px]">
                    <img
                      src="https://picsum.photos/seed/bogota-map/800/260"
                      alt="Mapa de entregas"
                      width={800}
                      height={260}
                      loading="lazy"
                      className="block h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/38 to-transparent" />
                    <div className="absolute bottom-5 left-5 z-[2] flex items-center gap-3 text-white">
                      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white text-[var(--rd-primary)]">
                        <span className="material-symbols-outlined text-[20px]">navigation</span>
                      </div>
                      <div>
                        <p className="text-[0.72rem] opacity-82">Optimizando ruta</p>
                        <h4 className="text-[1rem] font-extrabold">Bogotá · Entrega óptima</h4>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Cliente actual</p>
                        <p className="font-['Syne'] text-[1.5rem] font-extrabold">Carlos Méndez</p>
                        <div className="mt-2 flex items-center gap-1.5 text-[var(--rd-text-muted)]">
                          <span className="material-symbols-outlined text-[18px] text-[var(--rd-primary)]">location_on</span>
                          <span>Calle 72 # 14-25, Bogotá</span>
                        </div>
                      </div>
                      <button className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-none bg-[#f8f4f1] text-[var(--rd-primary-dark)]">
                        <span className="material-symbols-outlined">call</span>
                      </button>
                    </div>
                    <div className="rounded-2xl border border-[#f0ebe7] bg-[#fcfaf8] p-4.5">
                      <ul className="flex flex-col gap-3">
                        <li className="flex justify-between gap-3 font-bold"><span>1x Truffle Risotto</span><span>$32.000</span></li>
                        <li className="flex justify-between gap-3 font-bold"><span>2x Vintage Negroni</span><span>$28.000</span></li>
                        <li className="mt-1.5 flex justify-between gap-3 border-t border-[#ebe4df] pt-3.5 text-[1rem] font-bold">
                          <span>Total</span><span className="text-[var(--rd-primary-dark)]">$60.000</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col gap-3.5">
                      <div className="grid grid-cols-3 gap-3">
                        <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#eee5df] bg-white px-3 py-4 text-[0.78rem] font-bold text-[var(--rd-text)]">
                          <span className="material-symbols-outlined">payments</span>Efectivo
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[var(--rd-primary)] bg-[var(--rd-primary-soft)] px-3 py-4 text-[0.78rem] font-bold text-[var(--rd-primary-dark)]">
                          <span className="material-symbols-outlined">credit_card</span>Tarjeta
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#eee5df] bg-white px-3 py-4 text-[0.78rem] font-bold text-[var(--rd-text)]">
                          <span className="material-symbols-outlined">qr_code_2</span>App Pay
                        </button>
                      </div>
                      <button className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-none bg-[var(--rd-primary)] px-4.5 py-4 text-[1rem] font-extrabold text-white">
                        <span className="material-symbols-outlined">check_circle</span>
                        Confirmar entrega
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-['Syne'] text-[1.25rem] font-extrabold">Cola de Pedidos</h3>
                        <p className="mt-1 text-[0.85rem] text-[var(--rd-text-muted)]">Próximas entregas asignadas</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-[var(--rd-primary-soft)] px-2.5 py-1.5 text-[0.7rem] font-bold text-[var(--rd-primary-dark)]">2 órdenes</span>
                    </div>
                    <div className="flex flex-col gap-3.5">
                      {[
                        { id: '#8845', restaurant: 'The Bistro Main', address: '42 West Side Apts', eta: '12 min', distance: '2.4 km', icon: 'restaurant' },
                        { id: '#8848', restaurant: "Mamma's Kitchen", address: 'Central Plaza Hotel', eta: '22 min', distance: '4.1 km', icon: 'local_pizza' },
                      ].map(q => (
                        <div key={q.id} className="rounded-2xl border border-[#f0ebe7] bg-[#fcfaf8] p-4">
                          <div className="mb-3.5 flex items-start justify-between gap-3">
                            <div className="flex gap-3">
                              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-[#f7f2ee] text-[var(--rd-primary)]">
                                <span className="material-symbols-outlined">{q.icon}</span>
                              </div>
                              <div>
                                <h5 className="font-extrabold">Pedido {q.id}</h5>
                                <p className="mt-0.5 text-[0.8rem] text-[var(--rd-text-muted)]">{q.restaurant}</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-[var(--rd-secondary-soft)] px-2.5 py-1.5 text-[0.7rem] font-bold text-[#9a5e10]">{q.eta}</span>
                          </div>
                          <div className="flex justify-between text-[0.78rem] text-[var(--rd-text-muted)]">
                            <span>{q.address}</span>
                            <span>{q.distance}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                    <div className="mb-4.5">
                      <h3 className="font-['Syne'] text-[1.25rem] font-extrabold">Top Performers</h3>
                      <p className="mt-1 text-[0.85rem] text-[var(--rd-text-muted)]">Top Repartidores hoy</p>
                    </div>
                    <div className="flex flex-col gap-3">
                      {['Carlos M.', 'Diana R.', 'Luis P.'].map((name, i) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#f2ece8] text-[0.8rem] font-bold text-[var(--rd-primary-dark)]">
                              {name[0]}
                            </div>
                            <span className="text-[0.88rem] font-semibold">{name}</span>
                          </div>
                          <span className="text-[0.78rem] text-[var(--rd-text-muted)]">{18 - i * 2} entregas</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {activeItem === 'Entregas' && (
          <>
            <div className="rd-topbar">
              <div className="rd-topbar__left">
                <h1 className="rd-topbar__title">Gestión de Entregas</h1>
                <p className="rd-topbar__subtitle">Bienvenido de nuevo, <strong>{user?.nombre ?? 'Repartidor'}</strong></p>
              </div>
              <div className="rd-topbar__right">
                <button className="rd-confirm-btn" style={{ width: 'auto', padding: '10px 20px', fontSize: '0.875rem' }} onClick={abrirCrearDomicilio}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Nuevo Domicilio
                </button>
              </div>
            </div>

            <div className="rd-content">
              {cargandoDomicilios ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--rd-text-muted)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>sync</span>
                  Cargando domicilios...
                </div>
              ) : domicilios.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--rd-text-muted)', background: 'var(--rd-card)', borderRadius: '22px', border: '1px solid var(--rd-border)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', color: 'var(--rd-primary)' }}>local_shipping</span>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--rd-text)' }}>Sin domicilios registrados</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.4rem' }}>Crea el primer domicilio con el botón de arriba</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {domicilios.map(d => (
                    <div key={d.id_domicilio} className="rd-queue-item" style={{ borderRadius: '22px', padding: '22px', background: 'var(--rd-card)', border: '1px solid var(--rd-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div className="rd-queue-item__icon">
                            <span className="material-symbols-outlined">local_shipping</span>
                          </div>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>Domicilio #{d.id_domicilio}</p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--rd-text-muted)' }}>Pedido #{d.id_pedido}</p>
                          </div>
                        </div>
                        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: estadoBg[d.estado] ?? '#f0ebe7', color: estadoColor[d.estado] ?? 'var(--rd-text-muted)' }}>
                          {d.estado}
                        </span>
                      </div>
                      <div className="rd-address-row" style={{ marginBottom: '10px' }}>
                        <span className="material-symbols-outlined">location_on</span>
                        <span style={{ fontSize: '0.875rem' }}>{d.direccion}</span>
                      </div>
                      {d.nombre_cliente && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--rd-text-muted)', fontSize: '0.82rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                          {d.nombre_cliente}
                        </div>
                      )}
                      {d.estado_pedido && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--rd-text-muted)', marginBottom: '14px' }}>
                          Estado pedido: <strong>{d.estado_pedido}</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button onClick={() => abrirEditarDomicilio(d)} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1.5px solid var(--rd-border)', background: '#fff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', color: 'var(--rd-primary-dark)' }}>
                          Editar
                        </button>
                        <button onClick={() => cancelarDomicilio(d.id_domicilio)} disabled={d.estado === 'CANCELADO'} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1.5px solid #f0ebe7', background: d.estado === 'CANCELADO' ? '#f8f4f1' : 'var(--rd-primary-soft)', fontWeight: 700, fontSize: '0.82rem', cursor: d.estado === 'CANCELADO' ? 'not-allowed' : 'pointer', color: d.estado === 'CANCELADO' ? 'var(--rd-text-muted)' : 'var(--rd-danger)', opacity: d.estado === 'CANCELADO' ? 0.5 : 1 }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Modal isOpen={modalDomicilio} onClose={() => setModalDomicilio(false)}>
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: 800, fontFamily: 'Syne, sans-serif', fontSize: '1.2rem' }}>
                  {modoEdicionDomicilio ? 'Editar Domicilio' : 'Nuevo Domicilio'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rd-text-muted)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ID Pedido *</label>
                    <input style={inputStyle} type="number" placeholder="Ej: 12" value={domicilioActual.id_pedido}
                      onChange={e => setDomicilioActual(prev => ({ ...prev, id_pedido: e.target.value }))}
                      disabled={modoEdicionDomicilio} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rd-text-muted)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Dirección *</label>
                    <input style={inputStyle} type="text" placeholder="Ej: Calle 45 # 12-34, Bogotá" value={domicilioActual.direccion}
                      onChange={e => setDomicilioActual(prev => ({ ...prev, direccion: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rd-text-muted)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado</label>
                    <select style={inputStyle} value={domicilioActual.estado}
                      onChange={e => setDomicilioActual(prev => ({ ...prev, estado: e.target.value }))}>
                      <option value="ASIGNADO">ASIGNADO</option>
                      <option value="EN_CAMINO">EN_CAMINO</option>
                      <option value="ENTREGADO">ENTREGADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rd-text-muted)', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>ID Repartidor</label>
                    <input style={inputStyle} type="number" placeholder="Opcional" value={domicilioActual.id_repartidor}
                      onChange={e => setDomicilioActual(prev => ({ ...prev, id_repartidor: e.target.value }))} />
                  </div>
                  {errorDomicilio && (
                    <p style={{ color: 'var(--rd-danger)', fontSize: '0.82rem', background: '#fdecea', padding: '0.6rem 0.85rem', borderRadius: '10px' }}>
                      {errorDomicilio}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button onClick={() => setModalDomicilio(false)} style={{ flex: 1, padding: '12px', borderRadius: '14px', border: '1.5px solid var(--rd-border)', background: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', color: 'var(--rd-text-muted)' }}>
                      Cancelar
                    </button>
                    <button onClick={guardarDomicilio} disabled={guardandoDomicilio} className="rd-confirm-btn" style={{ flex: 2, padding: '12px', fontSize: '0.875rem' }}>
                      {guardandoDomicilio ? 'Guardando...' : modoEdicionDomicilio ? 'Actualizar' : 'Crear Domicilio'}
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          </>
        )}

        {(activeItem === 'Historial' || activeItem === 'Soporte') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--rd-text-muted)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--rd-primary)' }}>
              {activeItem === 'Historial' ? 'history' : 'support_agent'}
            </span>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--rd-text)' }}>{activeItem}</p>
            <p style={{ marginTop: '0.4rem', fontSize: '0.875rem' }}>Sección en construcción</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Repartidor