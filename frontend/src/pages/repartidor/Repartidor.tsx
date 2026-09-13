/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react'
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

// ===========================================================
// SOPORTE: casos (reclamos de cliente + reportes de repartidor)
// ===========================================================

interface Caso {
  id: number
  tipo: 'Reclamo cliente' | 'Reporte repartidor'
  pedido: string
  cliente?: string
  fecha: string
  hora: string
  estado: 'Abierto' | 'Resuelto'
  categoria: string
  descripcion: string
}

const casosIniciales: Caso[] = [
  {
    id: 1,
    tipo: 'Reclamo cliente',
    pedido: '#8840',
    cliente: 'Ana Torres',
    fecha: '02/09/2026',
    hora: '01:15 PM',
    estado: 'Abierto',
    categoria: 'Pedido incompleto',
    descripcion: 'La cliente reporta que faltó una bebida (Vintage Negroni) en el pedido entregado.',
  },
  {
    id: 2,
    tipo: 'Reclamo cliente',
    pedido: '#8832',
    cliente: 'Jorge Ruiz',
    fecha: '01/09/2026',
    hora: '07:40 PM',
    estado: 'Resuelto',
    categoria: 'Demora en entrega',
    descripcion: 'El cliente indicó que la entrega tardó más de 40 minutos por encima del tiempo estimado.',
  },
  {
    id: 3,
    tipo: 'Reclamo cliente',
    pedido: '#8821',
    cliente: 'Marcela Ortiz',
    fecha: '31/08/2026',
    hora: '09:05 PM',
    estado: 'Resuelto',
    categoria: 'Producto en mal estado',
    descripcion: 'La cliente reportó que la comida llegó fría y con el empaque abierto.',
  },
]

const categoriasReporte = [
  'No encuentra la dirección',
  'Cliente no responde',
  'Producto dañado durante el trayecto',
  'Problema de acceso (portería, conjunto cerrado)',
  'Situación de seguridad',
  'Otro',
]

const LONG_PRESS_MS = 600

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

  // ===========================================================
  // SOPORTE: mantener presionado para reportar problema + lista de casos
  // ===========================================================

  const [casos, setCasos] = useState<Caso[]>(casosIniciales)
  const casosAbiertos = casos.filter(c => c.estado === 'Abierto').length

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pressingKey, setPressingKey] = useState<string | null>(null)

  const [modalReporte, setModalReporte] = useState<{ open: boolean; pedido: string }>({ open: false, pedido: '' })
  const [nuevoReporte, setNuevoReporte] = useState({ categoria: '', descripcion: '' })
  const [errorReporte, setErrorReporte] = useState<string | null>(null)

  const [modalSuceso, setModalSuceso] = useState<{ open: boolean; caso: Caso | null }>({ open: false, caso: null })

  const iniciarPresion = (key: string, pedido: string) => {
    setPressingKey(key)
    pressTimer.current = setTimeout(() => {
      setPressingKey(null)
      abrirReportarProblema(pedido)
    }, LONG_PRESS_MS)
  }

  const cancelarPresion = () => {
    setPressingKey(null)
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const abrirReportarProblema = (pedido: string) => {
    setNuevoReporte({ categoria: '', descripcion: '' })
    setErrorReporte(null)
    setModalReporte({ open: true, pedido })
  }

  const guardarReporte = () => {
    if (!nuevoReporte.categoria) {
      setErrorReporte('Selecciona una categoría del problema')
      return
    }
    if (!nuevoReporte.descripcion.trim()) {
      setErrorReporte('Describe brevemente lo ocurrido')
      return
    }

    const ahora = new Date()

    const caso: Caso = {
      id: Date.now(),
      tipo: 'Reporte repartidor',
      pedido: modalReporte.pedido,
      fecha: ahora.toLocaleDateString('es-CO'),
      hora: ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      estado: 'Abierto',
      categoria: nuevoReporte.categoria,
      descripcion: nuevoReporte.descripcion,
    }

    setCasos(prev => [caso, ...prev])
    setModalReporte({ open: false, pedido: '' })
  }

  const resolverCaso = (id: number) => {
    setCasos(prev => prev.map(c => (c.id === id ? { ...c, estado: 'Resuelto' as const } : c)))
    setModalSuceso({ open: false, caso: null })
  }

  // ===========================================================
  // HISTORIAL: entregas ya completadas (demo)
  // ===========================================================

  interface EntregaHistorial {
    id: string
    fecha: string
    hora: string
    cliente: string
    direccion: string
    ganancia: number
    distancia: string
    estado: 'Entregado' | 'Cancelado'
  }

  const historial: EntregaHistorial[] = [
    { id: '#8845', fecha: '02/09/2026', hora: '01:45 PM', cliente: 'Carlos Méndez', direccion: '42 West Side Apts', ganancia: 8500, distancia: '2.4 km', estado: 'Entregado' },
    { id: '#8840', fecha: '02/09/2026', hora: '01:10 PM', cliente: 'Ana Torres', direccion: 'Carrera 15 # 88-42', ganancia: 7200, distancia: '1.9 km', estado: 'Entregado' },
    { id: '#8836', fecha: '02/09/2026', hora: '12:30 PM', cliente: 'Felipe Duarte', direccion: 'Calle 90 # 11-20', ganancia: 6800, distancia: '3.1 km', estado: 'Entregado' },
    { id: '#8829', fecha: '01/09/2026', hora: '08:15 PM', cliente: 'Laura Prieto', direccion: 'Av. Suba # 120-30', ganancia: 0, distancia: '1.2 km', estado: 'Cancelado' },
    { id: '#8821', fecha: '01/09/2026', hora: '06:50 PM', cliente: 'Marcela Ortiz', direccion: 'Transversal 8 # 45-12', ganancia: 9100, distancia: '4.0 km', estado: 'Entregado' },
  ]

  const totalGananciaHistorial = historial.filter(h => h.estado === 'Entregado').reduce((acc, h) => acc + h.ganancia, 0)
  const totalEntregadas = historial.filter(h => h.estado === 'Entregado').length
  const totalCanceladas = historial.filter(h => h.estado === 'Cancelado').length

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
              {item.label === 'Soporte' && casosAbiertos > 0 && (
                <span className="ml-auto rounded-full bg-[var(--rd-primary)] px-2 py-0.5 text-[0.7rem] font-bold text-white">
                  {casosAbiertos}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2.5 px-1">
          <button className="w-full rounded-xl border-none bg-[var(--rd-primary)] px-4 py-3.5 font-bold text-white">
            <span className="material-symbols-outlined mr-2 align-middle text-[18px]">schedule</span>
            Finalizar turno
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
                      <div className="flex items-center gap-2.5">
                        {/* BOTÓN DE SOPORTE: mantener presionado para reportar problema */}
                        <button
                          onMouseDown={() => iniciarPresion('resumen-8845', '#8845')}
                          onMouseUp={cancelarPresion}
                          onMouseLeave={cancelarPresion}
                          onTouchStart={() => iniciarPresion('resumen-8845', '#8845')}
                          onTouchEnd={cancelarPresion}
                          title="Mantén presionado para reportar un problema con este domicilio"
                          className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border-none text-[var(--rd-danger)] transition-transform ${
                            pressingKey === 'resumen-8845' ? 'scale-90 bg-[#fdecea]' : 'bg-[#fdecea]/60'
                          }`}
                        >
                          <span className="material-symbols-outlined">report</span>
                        </button>
                        <button className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-none bg-[#f8f4f1] text-[var(--rd-primary-dark)]">
                          <span className="material-symbols-outlined">call</span>
                        </button>
                      </div>
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
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex justify-between gap-3 text-[0.78rem] text-[var(--rd-text-muted)]">
                              <span>{q.address}</span>
                              <span className="ml-3">{q.distance}</span>
                            </div>
                            {/* BOTÓN DE SOPORTE en cada pedido de la cola */}
                            <button
                              onMouseDown={() => iniciarPresion(`cola-${q.id}`, q.id)}
                              onMouseUp={cancelarPresion}
                              onMouseLeave={cancelarPresion}
                              onTouchStart={() => iniciarPresion(`cola-${q.id}`, q.id)}
                              onTouchEnd={cancelarPresion}
                              title="Mantén presionado para reportar un problema"
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-none text-[var(--rd-danger)] transition-transform ${
                                pressingKey === `cola-${q.id}` ? 'scale-90 bg-[#fdecea]' : 'bg-[#fdecea]/50'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">report</span>
                            </button>
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
            <div className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-[var(--rd-border)] bg-[rgba(253,250,247,0.88)] px-7 py-5.5 backdrop-blur-[12px]">
              <div className="flex flex-col gap-1">
                <h1 className="font-['Syne'] text-[1.4rem] font-extrabold">Gestión de Entregas</h1>
                <p className="text-[0.88rem] text-[var(--rd-text-muted)]">Bienvenido de nuevo, <strong>{user?.nombre ?? 'Repartidor'}</strong></p>
              </div>
              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  className="flex w-auto items-center justify-center gap-2.5 rounded-2xl border-none bg-[var(--rd-primary)] px-5 py-2.5 text-[0.875rem] font-extrabold text-white"
                  onClick={abrirCrearDomicilio}
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Nuevo Domicilio
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-7">
              {cargandoDomicilios ? (
                <div className="p-12 text-center text-[var(--rd-text-muted)]">
                  <span className="material-symbols-outlined mb-2 block text-[2rem]">sync</span>
                  Cargando domicilios...
                </div>
              ) : domicilios.length === 0 ? (
                <div className="rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-16 text-center text-[var(--rd-text-muted)]">
                  <span className="material-symbols-outlined mb-3 block text-[2.5rem] text-[var(--rd-primary)]">local_shipping</span>
                  <p className="text-[1rem] font-bold text-[var(--rd-text)]">Sin domicilios registrados</p>
                  <p className="mt-1.5 text-[0.85rem]">Crea el primer domicilio con el botón de arriba</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4.5">
                  {domicilios.map(d => (
                    <div key={d.id_domicilio} className="rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                      <div className="mb-3.5 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-[#f7f2ee] text-[var(--rd-primary)]">
                            <span className="material-symbols-outlined">local_shipping</span>
                          </div>
                          <div>
                            <p className="text-[0.95rem] font-extrabold">Domicilio #{d.id_domicilio}</p>
                            <p className="text-[0.78rem] text-[var(--rd-text-muted)]">Pedido #{d.id_pedido}</p>
                          </div>
                        </div>
                        <span
                          className="rounded-full px-3 py-1 text-[0.72rem] font-bold"
                          style={{ background: estadoBg[d.estado] ?? '#f0ebe7', color: estadoColor[d.estado] ?? 'var(--rd-text-muted)' }}
                        >
                          {d.estado}
                        </span>
                      </div>
                      <div className="mb-2.5 flex items-center gap-1.5 text-[var(--rd-text-muted)]">
                        <span className="material-symbols-outlined text-[18px] text-[var(--rd-primary)]">location_on</span>
                        <span className="text-[0.875rem]">{d.direccion}</span>
                      </div>
                      {d.nombre_cliente && (
                        <div className="mb-2.5 flex items-center gap-1.5 text-[0.82rem] text-[var(--rd-text-muted)]">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                          {d.nombre_cliente}
                        </div>
                      )}
                      {d.estado_pedido && (
                        <div className="mb-3.5 text-[0.78rem] text-[var(--rd-text-muted)]">
                          Estado pedido: <strong>{d.estado_pedido}</strong>
                        </div>
                      )}
                      <div className="mt-1 flex gap-2.5">
                        <button
                          onClick={() => abrirEditarDomicilio(d)}
                          className="flex-1 rounded-xl border-[1.5px] border-[var(--rd-border)] bg-white px-3 py-2.5 text-[0.82rem] font-bold text-[var(--rd-primary-dark)]"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => cancelarDomicilio(d.id_domicilio)}
                          disabled={d.estado === 'CANCELADO'}
                          className={`flex-1 rounded-xl border-[1.5px] border-[#f0ebe7] px-3 py-2.5 text-[0.82rem] font-bold ${
                            d.estado === 'CANCELADO'
                              ? 'cursor-not-allowed bg-[#f8f4f1] text-[var(--rd-text-muted)] opacity-50'
                              : 'cursor-pointer bg-[var(--rd-primary-soft)] text-[var(--rd-danger)]'
                          }`}
                        >
                          Cancelar
                        </button>
                        {/* BOTÓN DE SOPORTE: mantener presionado para reportar problema */}
                        <button
                          onMouseDown={() => iniciarPresion(`entrega-${d.id_domicilio}`, `#${d.id_pedido}`)}
                          onMouseUp={cancelarPresion}
                          onMouseLeave={cancelarPresion}
                          onTouchStart={() => iniciarPresion(`entrega-${d.id_domicilio}`, `#${d.id_pedido}`)}
                          onTouchEnd={cancelarPresion}
                          title="Mantén presionado para reportar un problema con este domicilio"
                          className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border-[1.5px] border-[#f0ebe7] text-[var(--rd-danger)] transition-transform ${
                            pressingKey === `entrega-${d.id_domicilio}` ? 'scale-90 bg-[#fdecea]' : 'bg-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">report</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Modal isOpen={modalDomicilio} onClose={() => setModalDomicilio(false)}>
              <div className="px-6 pb-6">
                <h3 className="mb-6 font-['Syne'] text-[1.2rem] font-extrabold">
                  {modoEdicionDomicilio ? 'Editar Domicilio' : 'Nuevo Domicilio'}
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">ID Pedido *</label>
                    <input
                      type="number"
                      placeholder="Ej: 12"
                      value={domicilioActual.id_pedido}
                      onChange={e => setDomicilioActual(prev => ({ ...prev, id_pedido: e.target.value }))}
                      disabled={modoEdicionDomicilio}
                      className="w-full rounded-xl border border-[var(--rd-border)] bg-[#fcfaf8] px-3.5 py-2.5 text-[0.9rem] text-[var(--rd-text)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">Dirección *</label>
                    <input
                      type="text"
                      placeholder="Ej: Calle 45 # 12-34, Bogotá"
                      value={domicilioActual.direccion}
                      onChange={e => setDomicilioActual(prev => ({ ...prev, direccion: e.target.value }))}
                      className="w-full rounded-xl border border-[var(--rd-border)] bg-[#fcfaf8] px-3.5 py-2.5 text-[0.9rem] text-[var(--rd-text)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">Estado</label>
                    <select
                      value={domicilioActual.estado}
                      onChange={e => setDomicilioActual(prev => ({ ...prev, estado: e.target.value }))}
                      className="w-full cursor-pointer rounded-xl border border-[var(--rd-border)] bg-[#fcfaf8] px-3.5 py-2.5 text-[0.9rem] text-[var(--rd-text)] outline-none"
                    >
                      <option value="ASIGNADO">ASIGNADO</option>
                      <option value="EN_CAMINO">EN_CAMINO</option>
                      <option value="ENTREGADO">ENTREGADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">ID Repartidor</label>
                    <input
                      type="number"
                      placeholder="Opcional"
                      value={domicilioActual.id_repartidor}
                      onChange={e => setDomicilioActual(prev => ({ ...prev, id_repartidor: e.target.value }))}
                      className="w-full rounded-xl border border-[var(--rd-border)] bg-[#fcfaf8] px-3.5 py-2.5 text-[0.9rem] text-[var(--rd-text)] outline-none"
                    />
                  </div>
                  {errorDomicilio && (
                    <p className="rounded-[10px] bg-[#fdecea] px-3.5 py-2.5 text-[0.82rem] text-[var(--rd-danger)]">
                      {errorDomicilio}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2.5">
                    <button
                      onClick={() => setModalDomicilio(false)}
                      className="flex-1 rounded-[14px] border-[1.5px] border-[var(--rd-border)] bg-white px-3 py-3 text-[0.875rem] font-bold text-[var(--rd-text-muted)]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarDomicilio}
                      disabled={guardandoDomicilio}
                      className="flex flex-[2] items-center justify-center gap-2.5 rounded-2xl border-none bg-[var(--rd-primary)] px-4.5 py-3 text-[0.875rem] font-extrabold text-white"
                    >
                      {guardandoDomicilio ? 'Guardando...' : modoEdicionDomicilio ? 'Actualizar' : 'Crear Domicilio'}
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          </>
        )}

        {/* =========================================================
            HISTORIAL
        ========================================================== */}
        {activeItem === 'Historial' && (
          <>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-[var(--rd-border)] bg-[rgba(253,250,247,0.88)] px-7 py-5.5 backdrop-blur-[12px]">
              <div className="flex flex-col gap-1">
                <h1 className="font-['Syne'] text-[1.4rem] font-extrabold">Historial de entregas</h1>
                <p className="text-[0.88rem] text-[var(--rd-text-muted)]">Consulta tus entregas anteriores</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-7">
              <div className="grid grid-cols-3 gap-4.5">
                <div className="flex min-h-[110px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Ganado (entregadas)</span>
                  <span className="font-['Syne'] text-[1.7rem] font-extrabold text-[var(--rd-success)]">
                    ${totalGananciaHistorial.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex min-h-[110px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Entregadas</span>
                  <span className="font-['Syne'] text-[1.7rem] font-extrabold">{totalEntregadas}</span>
                </div>
                <div className="flex min-h-[110px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Canceladas</span>
                  <span className="font-['Syne'] text-[1.7rem] font-extrabold text-[var(--rd-danger)]">{totalCanceladas}</span>
                </div>
              </div>

              <div className="rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)]">
                <div className="border-b border-[var(--rd-border)] p-5.5">
                  <h3 className="font-['Syne'] text-[1.1rem] font-extrabold">Entregas recientes</h3>
                </div>
                <div className="flex flex-col">
                  {historial.map((h, i) => (
                    <div
                      key={h.id}
                      className={`flex items-center justify-between gap-4 px-5.5 py-4 ${
                        i !== historial.length - 1 ? 'border-b border-[#f0ebe7]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="flex h-[42px] w-[42px] items-center justify-center rounded-2xl"
                          style={{
                            background: h.estado === 'Entregado' ? 'var(--rd-success-soft)' : '#fdecea',
                            color: h.estado === 'Entregado' ? 'var(--rd-success)' : 'var(--rd-danger)',
                          }}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {h.estado === 'Entregado' ? 'check_circle' : 'cancel'}
                          </span>
                        </div>
                        <div>
                          <p className="text-[0.92rem] font-bold">Pedido {h.id} · {h.cliente}</p>
                          <p className="text-[0.78rem] text-[var(--rd-text-muted)]">
                            {h.direccion} · {h.distancia} · {h.fecha} {h.hora}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-[0.95rem] font-extrabold"
                          style={{ color: h.estado === 'Entregado' ? 'var(--rd-text)' : 'var(--rd-text-muted)' }}
                        >
                          {h.estado === 'Entregado' ? `$${h.ganancia.toLocaleString('es-CO')}` : '—'}
                        </p>
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold"
                          style={{
                            background: h.estado === 'Entregado' ? 'var(--rd-success-soft)' : '#fdecea',
                            color: h.estado === 'Entregado' ? 'var(--rd-success)' : 'var(--rd-danger)',
                          }}
                        >
                          {h.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* =========================================================
            SOPORTE
        ========================================================== */}
        {activeItem === 'Soporte' && (
          <>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-6 border-b border-[var(--rd-border)] bg-[rgba(253,250,247,0.88)] px-7 py-5.5 backdrop-blur-[12px]">
              <div className="flex flex-col gap-1">
                <h1 className="font-['Syne'] text-[1.4rem] font-extrabold">Soporte</h1>
                <p className="text-[0.88rem] text-[var(--rd-text-muted)]">
                  Reclamos de clientes y reportes que has enviado
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-7">
              <div className="rounded-[18px] border border-[var(--rd-secondary-soft)] bg-[var(--rd-secondary-soft)]/40 p-4.5 text-[0.85rem] text-[var(--rd-text-muted)]">
                <span className="material-symbols-outlined mr-1.5 align-middle text-[18px] text-[#9a5e10]">info</span>
                Tip: en cualquier domicilio, mantén presionado el ícono <strong>⚠ Reportar</strong> por un segundo para abrir un reporte de problema.
              </div>

              {casos.length === 0 ? (
                <div className="rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-16 text-center text-[var(--rd-text-muted)]">
                  <span className="material-symbols-outlined mb-3 block text-[2.5rem] text-[var(--rd-primary)]">support_agent</span>
                  <p className="text-[1rem] font-bold text-[var(--rd-text)]">Sin casos registrados</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {casos.map(c => (
                    <div key={c.id} className="rounded-[20px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl"
                            style={{
                              background: c.tipo === 'Reclamo cliente' ? '#fdecea' : 'var(--rd-secondary-soft)',
                              color: c.tipo === 'Reclamo cliente' ? 'var(--rd-danger)' : '#9a5e10',
                            }}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {c.tipo === 'Reclamo cliente' ? 'sentiment_dissatisfied' : 'report'}
                            </span>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[0.95rem] font-extrabold">{c.tipo}</p>
                              <span
                                className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold"
                                style={{
                                  background: c.estado === 'Abierto' ? '#fdecea' : 'var(--rd-success-soft)',
                                  color: c.estado === 'Abierto' ? 'var(--rd-danger)' : 'var(--rd-success)',
                                }}
                              >
                                {c.estado}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[0.82rem] text-[var(--rd-text-muted)]">
                              Pedido {c.pedido}
                              {c.cliente ? ` · ${c.cliente}` : ''} · {c.fecha} {c.hora}
                            </p>
                            <p className="mt-1 text-[0.85rem] font-semibold text-[var(--rd-text)]">{c.categoria}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => setModalSuceso({ open: true, caso: c })}
                          className="rounded-xl border-[1.5px] border-[var(--rd-border)] bg-white px-3.5 py-2 text-[0.8rem] font-bold text-[var(--rd-primary-dark)]"
                        >
                          Ver suceso
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MODAL: VER SUCESO */}
            <Modal isOpen={modalSuceso.open} onClose={() => setModalSuceso({ open: false, caso: null })}>
              {modalSuceso.caso && (
                <div className="px-6 pb-6">
                  <h3 className="mb-1 font-['Syne'] text-[1.2rem] font-extrabold">{modalSuceso.caso.tipo}</h3>
                  <p className="mb-5 text-[0.82rem] text-[var(--rd-text-muted)]">
                    Pedido {modalSuceso.caso.pedido}
                    {modalSuceso.caso.cliente ? ` · ${modalSuceso.caso.cliente}` : ''} · {modalSuceso.caso.fecha} {modalSuceso.caso.hora}
                  </p>

                  <div className="flex flex-col gap-3">
                    <div className="rounded-2xl border border-[#f0ebe7] bg-[#fcfaf8] p-4">
                      <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">Categoría</p>
                      <p className="text-[0.9rem] font-semibold">{modalSuceso.caso.categoria}</p>
                    </div>

                    <div className="rounded-2xl border border-[#f0ebe7] bg-[#fcfaf8] p-4">
                      <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">Suceso</p>
                      <p className="text-[0.9rem] leading-relaxed text-[var(--rd-text)]">{modalSuceso.caso.descripcion}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2.5">
                    <button
                      onClick={() => setModalSuceso({ open: false, caso: null })}
                      className="flex-1 rounded-[14px] border-[1.5px] border-[var(--rd-border)] bg-white px-3 py-3 text-[0.875rem] font-bold text-[var(--rd-text-muted)]"
                    >
                      Cerrar
                    </button>
                    {modalSuceso.caso.estado === 'Abierto' && (
                      <button
                        onClick={() => resolverCaso(modalSuceso.caso!.id)}
                        className="flex flex-[2] items-center justify-center gap-2.5 rounded-2xl border-none bg-[var(--rd-success)] px-4.5 py-3 text-[0.875rem] font-extrabold text-white"
                      >
                        Marcar como resuelto
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Modal>
          </>
        )}

        {/* MODAL: REPORTAR PROBLEMA (activado con mantener presionado) */}
        <Modal isOpen={modalReporte.open} onClose={() => setModalReporte({ open: false, pedido: '' })}>
          <div className="px-6 pb-6">
            <h3 className="mb-1 font-['Syne'] text-[1.2rem] font-extrabold">Reportar problema</h3>
            <p className="mb-5 text-[0.82rem] text-[var(--rd-text-muted)]">Pedido {modalReporte.pedido}</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">
                  Categoría *
                </label>
                <select
                  value={nuevoReporte.categoria}
                  onChange={e => setNuevoReporte(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full cursor-pointer rounded-xl border border-[var(--rd-border)] bg-[#fcfaf8] px-3.5 py-2.5 text-[0.9rem] text-[var(--rd-text)] outline-none"
                >
                  <option value="">Selecciona una opción</option>
                  {categoriasReporte.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">
                  Describe lo ocurrido *
                </label>
                <textarea
                  placeholder="Ej: El cliente no contesta el teléfono ni la puerta."
                  value={nuevoReporte.descripcion}
                  onChange={e => setNuevoReporte(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="min-h-[100px] w-full resize-y rounded-xl border border-[var(--rd-border)] bg-[#fcfaf8] px-3.5 py-2.5 text-[0.9rem] text-[var(--rd-text)] outline-none"
                />
              </div>

              {errorReporte && (
                <p className="rounded-[10px] bg-[#fdecea] px-3.5 py-2.5 text-[0.82rem] text-[var(--rd-danger)]">
                  {errorReporte}
                </p>
              )}

              <div className="mt-2 flex gap-2.5">
                <button
                  onClick={() => setModalReporte({ open: false, pedido: '' })}
                  className="flex-1 rounded-[14px] border-[1.5px] border-[var(--rd-border)] bg-white px-3 py-3 text-[0.875rem] font-bold text-[var(--rd-text-muted)]"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarReporte}
                  className="flex flex-[2] items-center justify-center gap-2.5 rounded-2xl border-none bg-[var(--rd-primary)] px-4.5 py-3 text-[0.875rem] font-extrabold text-white"
                >
                  Enviar reporte
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  )
}

export default Repartidor