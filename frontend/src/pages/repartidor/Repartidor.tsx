/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import './Repartidor.css'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import { InputField } from '../../components/common/InputField'
import { SelectField } from '../../components/common/SelectField'

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
  Fecha_asignacion?: string | null
  fecha_entrega?: string | null
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
  ASIGNADO: 'var(--t-txt-9a5e10, #9a5e10)',
  EN_CAMINO: 'var(--t-txt-1d9e75, #1d9e75)',
  ENTREGADO: 'var(--t-txt-1d9e75, #1d9e75)',
  CANCELADO: 'var(--t-txt-c24732, #c24732)',
}

const estadoBg: Record<string, string> = {
  ASIGNADO: 'var(--t-bg-faeeda, #faeeda)',
  EN_CAMINO: 'var(--t-bg-e1f5ee, #e1f5ee)',
  ENTREGADO: 'var(--t-bg-e1f5ee, #e1f5ee)',
  CANCELADO: 'var(--t-bg-fdecea, #fdecea)',
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

type ResumenRepartidor = {
  ganancias_hoy: number
  entregas_hoy: number
  cola: { id_domicilio: number; id_pedido: number; estado: string; direccion: string | null; cliente: string | null; items: number }[]
  actual: {
    id_domicilio: number
    id_pedido: number
    cliente: string | null
    telefono: string | null
    direccion: string | null
    items: { nombre: string; cantidad: number; subtotal: number }[]
    total: number
  } | null
  top: { id_usuario: number; nombre: string; entregas: number }[]
}

const formatoPesos = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor)

const etiquetaEstadoCola: Record<string, string> = { ASIGNADO: 'Asignado', EN_CAMINO: 'En camino' }

function Repartidor() {
  const [activeItem, setActiveItem] = useState('resumen')
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const nombreUsuario = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Repartidor'

  const [domicilios, setDomicilios] = useState<Domicilio[]>([])
  const [cargandoDomicilios, setCargandoDomicilios] = useState(false)
  const [modalDomicilio, setModalDomicilio] = useState(false)
  const [modoEdicionDomicilio, setModoEdicionDomicilio] = useState(false)
  const [domicilioActual, setDomicilioActual] = useState(domicilioVacio)
  const [idEditandoDomicilio, setIdEditandoDomicilio] = useState<number | null>(null)
  const [guardandoDomicilio, setGuardandoDomicilio] = useState(false)
  const [errorDomicilio, setErrorDomicilio] = useState<string | null>(null)
  const [resumen, setResumen] = useState<ResumenRepartidor | null>(null)

  const cargarDomicilios = () => {
    setCargandoDomicilios(true)
    api.get('/domicilios').then(r => setDomicilios(r.data)).catch(console.error).finally(() => setCargandoDomicilios(false))
  }

  useEffect(() => { if (['resumen', 'entregas', 'historial'].includes(activeItem)) cargarDomicilios() }, [activeItem])

  useEffect(() => {
    if (activeItem !== 'resumen') return
    api.get('/domicilios/resumen').then(r => setResumen(r.data.data)).catch(console.error)
  }, [activeItem])

  // Vista de la cola de pedidos a partir del resumen (datos reales).
  const colaVista = (resumen?.cola ?? []).map(c => ({
    id: `#${c.id_pedido}`,
    restaurant: c.cliente ?? 'Cliente',
    address: c.direccion ?? '—',
    eta: etiquetaEstadoCola[c.estado] ?? c.estado,
    distance: `${c.items} ítems`,
    icon: 'restaurant',
  }))

  const abrirCrearDomicilio = () => {
    setModoEdicionDomicilio(false)
    setDomicilioActual({ ...domicilioVacio, id_repartidor: user?.id_usuario?.toString() ?? '' })
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
    ganancia: number | null
    distancia: string
    estado: 'Entregado' | 'Cancelado'
  }

  const formatoHoraBogota = (fecha: Date, opciones: Intl.DateTimeFormatOptions) =>
    fecha.toLocaleString('es-CO', { timeZone: 'America/Bogota', ...opciones })
  const hoyBogota = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
  const misDomicilios = domicilios.filter(d => d.id_repartidor === user?.id_usuario)

  const entregadasHoy = misDomicilios.filter(d =>
    d.estado === 'ENTREGADO' && d.fecha_entrega &&
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date(d.fecha_entrega)) === hoyBogota,
  ).length
  const pendientesCola = misDomicilios.filter(d => d.estado === 'ASIGNADO').length

  // Ganancia y distancia no existen en la base: quedan en '—'.
  const historial: EntregaHistorial[] = misDomicilios
    .filter(d => d.estado === 'ENTREGADO' || d.estado === 'CANCELADO')
    .map(d => {
      const referencia = d.fecha_entrega ?? d.Fecha_asignacion
      const fecha = referencia ? new Date(referencia) : null
      return {
        id: `#${d.id_pedido}`,
        fecha: fecha ? formatoHoraBogota(fecha, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—',
        hora: fecha ? formatoHoraBogota(fecha, { hour: '2-digit', minute: '2-digit' }) : '—',
        cliente: d.nombre_cliente ?? '—',
        direccion: d.direccion ?? '—',
        ganancia: null,
        distancia: '—',
        estado: d.estado === 'ENTREGADO' ? 'Entregado' : 'Cancelado',
      }
    })

  const totalEntregadas = historial.filter(h => h.estado === 'Entregado').length
  const totalCanceladas = historial.filter(h => h.estado === 'Cancelado').length

  return (
    <div
      className="rd-wrapper flex min-h-screen font-['DM_Sans']"
      style={{
        background: 'var(--rd-bg)',
        color: 'var(--rd-text)',
      }}
    >
      <Sidebar
        subtitulo="Operación de Reparto"
        menuItems={menuItems.map(m => ({ ...m, badge: m.label === 'Soporte' ? casosAbiertos : undefined }))}
        vistaActual={activeItem}
        onNavigate={setActiveItem}
        onLogout={() => { logout(); navigate('/') }}
        footer={
          <button type="button" onClick={() => { logout(); navigate('/') }} className="mb-2 w-full rounded-xl border-none bg-[var(--rd-primary)] px-4 py-3 font-bold text-white">
            <span className="material-symbols-outlined mr-2 align-middle text-[18px]">schedule</span>
            Finalizar turno
          </button>
        }
      />

      <main className="min-w-0 flex-1 pt-14 md:pt-0">
        {activeItem === 'resumen' && (
          <>
            <div className="px-4 pt-6 md:px-7">
              <Header
                seccionActiva="Resumen"
                subtitulo="Tu operación de hoy"
                nombreUsuario={nombreUsuario}
                acciones={
                  <>
                    <div className="relative w-full md:w-80">
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
                  </>
                }
              />
            </div>

            <div className="flex flex-col gap-6 p-4 md:p-7">
              <div className="grid grid-cols-1 gap-4.5 md:grid-cols-3">
                <div className="flex min-h-[140px] flex-col justify-between rounded-[22px] border-transparent bg-gradient-to-br from-[#d85a30] to-[#b34725] p-5.5 text-white">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-white/82">Ganancias del día</span>
                  <span className="font-['Syne'] text-[2rem] font-extrabold">{formatoPesos(resumen?.ganancias_hoy ?? 0)}</span>
                  <span className="text-[0.8rem] font-semibold text-white/82">Facturas de tus entregas de hoy</span>
                </div>
                <div className="flex min-h-[140px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Entregas completadas</span>
                  <span className="font-['Syne'] text-[2rem] font-extrabold text-[var(--rd-success)]">{entregadasHoy}</span>
                  <span className="text-[0.8rem] font-semibold text-[var(--rd-success)]">{pendientesCola} pendientes en cola</span>
                </div>
                <div className="flex min-h-[140px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Tiempo de turno</span>
                  <span className="font-['Syne'] text-[2rem] font-extrabold">6h 14m</span>
                  <span className="text-[0.65rem] font-bold uppercase text-[var(--rd-text-muted)]">Demo</span>
                  <span className="text-[0.8rem] font-semibold text-[var(--rd-text-muted)]">Inicio: 11:30 AM (Demo)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
                <div className="overflow-hidden rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)]">
                  <div className="relative h-[260px]">
                    <div className="flex h-full w-full items-center justify-center bg-[var(--rd-card)] px-6 text-center text-[0.85rem] text-[var(--rd-text-muted)]">
                      Mapa no disponible: la base no tiene un mapa para esta entrega.
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/38 to-transparent" />
                    <div className="absolute bottom-5 left-5 z-[2] flex items-center gap-3 text-white">
                      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white text-[var(--rd-primary)]">
                        <span className="material-symbols-outlined text-[20px]">navigation</span>
                      </div>
                      <div>
                        <p className="text-[0.72rem] opacity-82">Siguiente entrega</p>
                        <h4 className="text-[1rem] font-extrabold">{resumen?.actual?.direccion ?? 'Sin entrega asignada'}</h4>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-5 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Cliente actual</p>
                        <p className="font-['Syne'] text-[1.5rem] font-extrabold">{resumen?.actual?.cliente ?? 'Sin entrega asignada'}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-[var(--rd-text-muted)]">
                          <span className="material-symbols-outlined text-[18px] text-[var(--rd-primary)]">location_on</span>
                          <span>{resumen?.actual?.direccion ?? '—'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {/* BOTÓN DE SOPORTE: mantener presionado para reportar problema */}
                        <button
                          onMouseDown={() => iniciarPresion('resumen-actual', `#${resumen?.actual?.id_pedido ?? ''}`)}
                          onMouseUp={cancelarPresion}
                          onMouseLeave={cancelarPresion}
                          onTouchStart={() => iniciarPresion('resumen-actual', `#${resumen?.actual?.id_pedido ?? ''}`)}
                          onTouchEnd={cancelarPresion}
                          title="Mantén presionado para reportar un problema con este domicilio"
                          className={`flex h-[52px] w-[52px] items-center justify-center rounded-full border-none text-[var(--rd-danger)] transition-transform ${
                            pressingKey === 'resumen-actual' ? 'scale-90 bg-[var(--t-bg-fdecea,#fdecea)]' : 'bg-[var(--t-bg-fdecea,#fdecea)]/60'
                          }`}
                        >
                          <span className="material-symbols-outlined">report</span>
                        </button>
                        <button className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-none bg-[var(--t-bg-f8f4f1,#f8f4f1)] text-[var(--rd-primary-dark)]">
                          <span className="material-symbols-outlined">call</span>
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-[var(--t-brd-f0ebe7,#f0ebe7)] bg-[var(--t-bg-fcfaf8,#fcfaf8)] p-4.5">
                      <ul className="flex flex-col gap-3">
                        {(resumen?.actual?.items ?? []).map((it, idx) => (
                          <li key={idx} className="flex justify-between gap-3 font-bold"><span>{it.cantidad}x {it.nombre}</span><span>{formatoPesos(it.subtotal)}</span></li>
                        ))}
                        <li className="mt-1.5 flex justify-between gap-3 border-t border-[var(--t-brd-ebe4df,#ebe4df)] pt-3.5 text-[1rem] font-bold">
                          <span>Total</span><span className="text-[var(--rd-primary-dark)]">{formatoPesos(resumen?.actual?.total ?? 0)}</span>
                        </li>
                      </ul>
                    </div>
                    <div className="flex flex-col gap-3.5">
                      <div className="grid grid-cols-3 gap-3">
                        <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[var(--t-brd-eee5df,#eee5df)] bg-white px-3 py-4 text-[0.78rem] font-bold text-[var(--rd-text)]">
                          <span className="material-symbols-outlined">payments</span>Efectivo
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[var(--rd-primary)] bg-[var(--rd-primary-soft)] px-3 py-4 text-[0.78rem] font-bold text-[var(--rd-primary-dark)]">
                          <span className="material-symbols-outlined">credit_card</span>Tarjeta
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[var(--t-brd-eee5df,#eee5df)] bg-white px-3 py-4 text-[0.78rem] font-bold text-[var(--rd-text)]">
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
                      <span className="inline-flex items-center rounded-full bg-[var(--rd-primary-soft)] px-2.5 py-1.5 text-[0.7rem] font-bold text-[var(--rd-primary-dark)]">{colaVista.length} órdenes</span>
                    </div>
                    <div className="flex flex-col gap-3.5">
                      {colaVista.map(q => (
                        <div key={q.id} className="rounded-2xl border border-[var(--t-brd-f0ebe7,#f0ebe7)] bg-[var(--t-bg-fcfaf8,#fcfaf8)] p-4">
                          <div className="mb-3.5 flex items-start justify-between gap-3">
                            <div className="flex gap-3">
                              <div className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-[var(--t-bg-f7f2ee,#f7f2ee)] text-[var(--rd-primary)]">
                                <span className="material-symbols-outlined">{q.icon}</span>
                              </div>
                              <div>
                                <h5 className="font-extrabold">Pedido {q.id}</h5>
                                <p className="mt-0.5 text-[0.8rem] text-[var(--rd-text-muted)]">{q.restaurant}</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-[var(--rd-secondary-soft)] px-2.5 py-1.5 text-[0.7rem] font-bold text-[var(--t-txt-9a5e10,#9a5e10)]">{q.eta}</span>
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
                                pressingKey === `cola-${q.id}` ? 'scale-90 bg-[var(--t-bg-fdecea,#fdecea)]' : 'bg-[var(--t-bg-fdecea,#fdecea)]/50'
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
                      {(resumen?.top ?? []).map((t) => (
                        <div key={t.id_usuario} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[var(--t-bg-f2ece8,#f2ece8)] text-[0.8rem] font-bold text-[var(--rd-primary-dark)]">
                              {t.nombre[0]}
                            </div>
                            <span className="text-[0.88rem] font-semibold">{t.nombre}</span>
                          </div>
                          <span className="text-[0.78rem] text-[var(--rd-text-muted)]">{t.entregas} entregas</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {activeItem === 'entregas' && (
          <>
            <div className="px-4 pt-6 md:px-7">
              <Header
                seccionActiva="Gestión de Entregas"
                subtitulo="Tus domicilios asignados"
                nombreUsuario={nombreUsuario}
                acciones={
                  <button
                    className="flex w-auto items-center justify-center gap-2.5 rounded-2xl border-none bg-[var(--rd-primary)] px-5 py-2.5 text-[0.875rem] font-extrabold text-white"
                    onClick={abrirCrearDomicilio}
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Nuevo Domicilio
                  </button>
                }
              />
            </div>

            <div className="flex flex-col gap-6 p-4 md:p-7">
              {cargandoDomicilios ? (
                <div className="p-12 text-center text-[var(--rd-text-muted)]">
                  <span className="material-symbols-outlined mb-2 block text-[2rem]">sync</span>
                  Cargando domicilios...
                </div>
              ) : misDomicilios.length === 0 ? (
                <div className="rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-16 text-center text-[var(--rd-text-muted)]">
                  <span className="material-symbols-outlined mb-3 block text-[2.5rem] text-[var(--rd-primary)]">local_shipping</span>
                  <p className="text-[1rem] font-bold text-[var(--rd-text)]">Sin domicilios registrados</p>
                  <p className="mt-1.5 text-[0.85rem]">Crea el primer domicilio con el botón de arriba</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4.5">
                  {misDomicilios.map(d => (
                    <div key={d.id_domicilio} className="rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                      <div className="mb-3.5 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-[var(--t-bg-f7f2ee,#f7f2ee)] text-[var(--rd-primary)]">
                            <span className="material-symbols-outlined">local_shipping</span>
                          </div>
                          <div>
                            <p className="text-[0.95rem] font-extrabold">Domicilio #{d.id_domicilio}</p>
                            <p className="text-[0.78rem] text-[var(--rd-text-muted)]">Pedido #{d.id_pedido}</p>
                          </div>
                        </div>
                        <span
                          className="rounded-full px-3 py-1 text-[0.72rem] font-bold"
                          style={{ background: estadoBg[d.estado] ?? 'var(--t-bg-f0ebe7, #f0ebe7)', color: estadoColor[d.estado] ?? 'var(--rd-text-muted)' }}
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
                          className={`flex-1 rounded-xl border-[1.5px] border-[var(--t-brd-f0ebe7,#f0ebe7)] px-3 py-2.5 text-[0.82rem] font-bold ${
                            d.estado === 'CANCELADO'
                              ? 'cursor-not-allowed bg-[var(--t-bg-f8f4f1,#f8f4f1)] text-[var(--rd-text-muted)] opacity-50'
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
                          className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border-[1.5px] border-[var(--t-brd-f0ebe7,#f0ebe7)] text-[var(--rd-danger)] transition-transform ${
                            pressingKey === `entrega-${d.id_domicilio}` ? 'scale-90 bg-[var(--t-bg-fdecea,#fdecea)]' : 'bg-white'
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
                  <InputField label="ID Pedido *" type="number" placeholder="Ej: 12" value={domicilioActual.id_pedido} onChange={e => setDomicilioActual(prev => ({ ...prev, id_pedido: e.target.value }))} disabled={modoEdicionDomicilio} />
                  <InputField label="Dirección *" type="text" placeholder="Ej: Calle 45 # 12-34, Bogotá" value={domicilioActual.direccion} onChange={e => setDomicilioActual(prev => ({ ...prev, direccion: e.target.value }))} />
                  <SelectField label="Estado" value={domicilioActual.estado} onChange={e => setDomicilioActual(prev => ({ ...prev, estado: e.target.value }))}>
                      <option value="ASIGNADO">ASIGNADO</option>
                      <option value="EN_CAMINO">EN_CAMINO</option>
                      <option value="ENTREGADO">ENTREGADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </SelectField>
                  <InputField label="ID Repartidor" type="number" placeholder="Opcional" value={domicilioActual.id_repartidor} onChange={e => setDomicilioActual(prev => ({ ...prev, id_repartidor: e.target.value }))} />
                  {errorDomicilio && (
                    <p className="rounded-[10px] bg-[var(--t-bg-fdecea,#fdecea)] px-3.5 py-2.5 text-[0.82rem] text-[var(--rd-danger)]">
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
        {activeItem === 'historial' && (
          <>
            <div className="px-4 pt-6 md:px-7">
              <Header
                seccionActiva="Historial de entregas"
                subtitulo="Consulta tus entregas anteriores"
                nombreUsuario={nombreUsuario}
              />
            </div>

            <div className="flex flex-col gap-6 p-4 md:p-7">
              <div className="grid grid-cols-1 gap-4.5 md:grid-cols-3">
                <div className="flex min-h-[110px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Ganado (entregadas)</span>
                  <span className="font-['Syne'] text-[1.7rem] font-extrabold text-[var(--rd-success)]">
                    —
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
                        i !== historial.length - 1 ? 'border-b border-[var(--t-brd-f0ebe7,#f0ebe7)]' : ''
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
                            {h.direccion} · {h.fecha} {h.hora}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-[0.95rem] font-extrabold"
                          style={{ color: h.estado === 'Entregado' ? 'var(--rd-text)' : 'var(--rd-text-muted)' }}
                        >
                          {h.estado === 'Entregado' && h.ganancia !== null ? `$${h.ganancia.toLocaleString('es-CO')}` : '—'}
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
        {activeItem === 'soporte' && (
          <>
            <div className="px-4 pt-6 md:px-7">
              <Header
                seccionActiva="Soporte"
                subtitulo={
                  <>
                    Reclamos de clientes y reportes que has enviado
                    <span className="ml-2 rounded-full bg-[var(--rd-card)] px-2 py-0.5 text-[0.65rem] text-[var(--rd-text-muted)]">Demo</span>
                  </>
                }
                nombreUsuario={nombreUsuario}
              />
            </div>

            <div className="flex flex-col gap-6 p-4 md:p-7">
              <div className="rounded-[18px] border border-[var(--rd-secondary-soft)] bg-[var(--rd-secondary-soft)]/40 p-4.5 text-[0.85rem] text-[var(--rd-text-muted)]">
                <span className="material-symbols-outlined mr-1.5 align-middle text-[18px] text-[var(--t-txt-9a5e10,#9a5e10)]">info</span>
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
                    <div className="rounded-2xl border border-[var(--t-brd-f0ebe7,#f0ebe7)] bg-[var(--t-bg-fcfaf8,#fcfaf8)] p-4">
                      <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">Categoría</p>
                      <p className="text-[0.9rem] font-semibold">{modalSuceso.caso.categoria}</p>
                    </div>

                    <div className="rounded-2xl border border-[var(--t-brd-f0ebe7,#f0ebe7)] bg-[var(--t-bg-fcfaf8,#fcfaf8)] p-4">
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
              <SelectField
                label="Categoría *"
                value={nuevoReporte.categoria}
                onChange={e => setNuevoReporte(prev => ({ ...prev, categoria: e.target.value }))}
              >
                <option value="">Selecciona una opción</option>
                {categoriasReporte.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </SelectField>

              <div>
                <label className="mb-1.5 block text-[0.75rem] font-bold uppercase tracking-[1px] text-[var(--rd-text-muted)]">
                  Describe lo ocurrido *
                </label>
                <textarea
                  placeholder="Ej: El cliente no contesta el teléfono ni la puerta."
                  value={nuevoReporte.descripcion}
                  onChange={e => setNuevoReporte(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="min-h-[100px] w-full resize-y rounded-xl border border-[var(--rd-border)] bg-[var(--t-bg-fcfaf8,#fcfaf8)] px-3.5 py-2.5 text-[0.9rem] text-[var(--rd-text)] outline-none"
                />
              </div>

              {errorReporte && (
                <p className="rounded-[10px] bg-[var(--t-bg-fdecea,#fdecea)] px-3.5 py-2.5 text-[0.82rem] text-[var(--rd-danger)]">
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