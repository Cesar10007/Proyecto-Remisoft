/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import { InputField } from '../../components/common/InputField'
import { SelectField } from '../../components/common/SelectField'
import { DashboardSidebar } from '../../components/layout/DashboardSidebar'
import { useDashboardSidebarCollapsed } from '../../components/layout/useDashboardSidebar'
import './Repartidor.css'

const menuItems = [
  { id: 'resumen', icon: 'dashboard', label: 'Resumen' },
  { id: 'entregas', icon: 'local_shipping', label: 'Entregas' },
  { id: 'historial', icon: 'history', label: 'Historial' },
  { id: 'soporte', icon: 'support_agent', label: 'Soporte', badge: 3 },
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

function Repartidor() {
  const sidebarCollapsed = useDashboardSidebarCollapsed()
  const [activeItem, setActiveItem] = useState('Resumen')
  const { user } = useAuth()

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
      <DashboardSidebar
        roleTitle="Operación de Reparto"
        navItems={menuItems}
        activeItem={menuItems.find((item) => item.label === activeItem)?.id}
        onNavigate={(itemId) => {
          const selectedItem = menuItems.find((item) => item.id === itemId)
          if (selectedItem) setActiveItem(selectedItem.label)
        }}
        footerActions={
          <>
            <button
              type="button"
              className="w-full rounded-xl bg-[var(--rojo)] px-4 py-3.5 font-bold text-white"
            >
              <span className="material-symbols-outlined mr-2 align-middle text-[18px]">schedule</span>
              Finalizar turno
            </button>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm text-[var(--texto-muted)] hover:bg-[#f5ede7]"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Configuraciones
            </button>
          </>
        }
      />

      <main className={`ml-0 min-w-0 flex-1 pt-14 transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'} lg:pt-0`}>
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
                  <span className="font-number text-[2rem]">$142.500</span>
                  <span className="text-[0.8rem] font-semibold text-white/82">+12% vs ayer</span>
                </div>
                <div className="flex min-h-[140px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Entregas completadas</span>
                  <span className="font-number text-[2rem] text-[var(--rd-success)]">18</span>
                  <span className="text-[0.8rem] font-semibold text-[var(--rd-success)]">2 pendientes en cola</span>
                </div>
                <div className="flex min-h-[140px] flex-col justify-between rounded-[22px] border border-[var(--rd-border)] bg-[var(--rd-card)] p-5.5">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[1.4px] text-[var(--rd-text-muted)]">Tiempo de turno</span>
                  <span className="font-number text-[2rem]">6h 14m</span>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Modal isOpen={modalDomicilio} onClose={() => setModalDomicilio(false)}>
              <form
                className="px-6 pb-6"
                onSubmit={(event) => {
                  event.preventDefault()
                  void guardarDomicilio()
                }}
              >
                <h3 className="mb-6 font-['Syne'] text-[1.2rem] font-extrabold">
                  {modoEdicionDomicilio ? 'Editar Domicilio' : 'Nuevo Domicilio'}
                </h3>
                <div className="flex flex-col gap-4">
                  <InputField
                    label="ID Pedido *"
                    type="number"
                    placeholder="Ej: 12"
                    value={domicilioActual.id_pedido}
                    onChange={e => setDomicilioActual(prev => ({ ...prev, id_pedido: e.target.value }))}
                    disabled={modoEdicionDomicilio}
                    required
                  />
                  <InputField
                    label="Dirección *"
                    type="text"
                    placeholder="Ej: Calle 45 # 12-34, Bogotá"
                    value={domicilioActual.direccion}
                    onChange={e => setDomicilioActual(prev => ({ ...prev, direccion: e.target.value }))}
                    required
                  />
                  <SelectField
                    label="Estado"
                    value={domicilioActual.estado}
                    onChange={e => setDomicilioActual(prev => ({ ...prev, estado: e.target.value }))}
                  >
                    <option value="ASIGNADO">ASIGNADO</option>
                    <option value="EN_CAMINO">EN_CAMINO</option>
                    <option value="ENTREGADO">ENTREGADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </SelectField>
                  <InputField
                    label="ID Repartidor"
                    type="number"
                    placeholder="Opcional"
                    value={domicilioActual.id_repartidor}
                    onChange={e => setDomicilioActual(prev => ({ ...prev, id_repartidor: e.target.value }))}
                  />
                  {errorDomicilio && (
                    <p className="rounded-[10px] bg-[#fdecea] px-3.5 py-2.5 text-[0.82rem] text-[var(--rd-danger)]">
                      {errorDomicilio}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setModalDomicilio(false)}
                      className="flex-1 rounded-[14px] border-[1.5px] border-[var(--rd-border)] bg-white px-3 py-3 text-[0.875rem] font-bold text-[var(--rd-text-muted)]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardandoDomicilio}
                      className="flex flex-[2] items-center justify-center gap-2.5 rounded-2xl border-none bg-[var(--rd-primary)] px-4.5 py-3 text-[0.875rem] font-extrabold text-white"
                    >
                      {guardandoDomicilio ? 'Guardando...' : modoEdicionDomicilio ? 'Actualizar' : 'Crear Domicilio'}
                    </button>
                  </div>
                </div>
              </form>
            </Modal>
          </>
        )}
        {(activeItem === 'Historial' || activeItem === 'Soporte') && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-[var(--rd-text-muted)]">
            <span className="material-symbols-outlined mb-4 text-[3rem] text-[var(--rd-primary)]">
              {activeItem === 'Historial' ? 'history' : 'support_agent'}
            </span>
            <p className="font-['Syne'] text-[1.2rem] font-extrabold text-[var(--rd-text)]">{activeItem}</p>
            <p className="mt-1.5 text-[0.875rem]">Sección en construcción</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Repartidor