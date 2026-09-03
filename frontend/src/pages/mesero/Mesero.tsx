/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import Modal from '../../components/common/Modal'
import './Mesero.css'

const navItems = [
  { icon: 'table_restaurant', label: 'Mesas' },
  { icon: 'receipt_long', label: 'Pedidos' },
  { icon: 'point_of_sale', label: 'Caja' },
  { icon: 'description', label: 'Facturas' },
]

const stats = [
  { label: 'Mesas activas', value: '12', detail: '/ 24 total', color: 'green' },
  { label: 'Mesas en espera', value: '04', detail: 'Mesas esperando', color: 'amber', accented: true },
  { label: 'Ingresos', value: '2,482', prefix: '$', color: 'default' },
]

const tables = [
  { number: '12', name: 'The Smiths', meta: '4 Invitados • 6 Artículos', total: '$142.50', badge: '24m', state: 'occupied' },
  { number: '08', state: 'available' },
  { number: '04', name: 'Mesa 04', meta: '2 Invitados • Ordenando', total: '$0.00', badge: 'Esperando', state: 'waiting' },
  { number: '15', name: 'Alex & Co.', meta: '3 Invitados • Cuenta Lista', total: '$89.20', badge: 'Hecho', state: 'done' },
  { number: '22', name: 'Mesa 22', meta: '5 Invitados • Platos Principales Servidos', total: '$310.00', badge: '45m', state: 'occupied' },
  { number: '01', name: 'Mesa 01', meta: '2 Invitados • Entrantes', total: '$45.00', badge: '12m', state: 'occupied' },
  { number: '03', state: 'available' },
  { number: '09', state: 'available' },
]

const feedItems = [
  { status: 'Mesa 12 • Lista', time: 'Ahora mismo', title: '2x Lubina a la Parrilla', detail: 'Plato Principal • Paso A', tone: 'ready' },
  { status: 'Mesa 04 • Nueva Orden', time: 'hace 3m', title: '1x Risotto de Trufa', detail: 'Cocinando • Estación 2', tone: 'default' },
  { status: 'Mesa 01 • Retrasado', time: 'hace 8m', title: '1x Ribeye Poco Hecho', detail: 'Esperando guarnición • Estación 1', tone: 'warning' },
  { status: 'Mesa 15 • Lista', time: 'hace 12m', title: 'Botella de Chablis', detail: 'Lista en Barra', tone: 'ready' },
  { status: 'Mesa 22 • Enviado', time: 'hace 15m', title: 'Selección de Postres', detail: 'Preparando • Pastelería', tone: 'default' },
]

interface Pedido {
  id_pedido: number
  id_cliente: number | null
  id_mesero: number | null
  estado: string
  Tipo_pedido: string
  Mesa_num: number | null
  notas: string
  nombre_cliente?: string
  nombre_mesero?: string
}

interface Factura {
  id_factura: number
  numero: string
  id_cliente: number | null
  nombre_cliente?: string
  id_mesero: number | null
  nombre_mesero?: string
  Mesa_num: number | null
  fecha: string
  total: number
  estado: 'PAGADA' | 'PENDIENTE' | 'ANULADA'
}

const pedidoVacio = {
  id_cliente: '',
  id_mesero: '',
  estado: 'ABIERTO',
  Tipo_pedido: 'MESA',
  Mesa_num: '',
  notas: '',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  borderRadius: '8px',
  border: '1.5px solid var(--borde)',
  background: 'var(--bg)',
  fontSize: '0.95rem',
  color: 'var(--texto)',
  outline: 'none',
  boxSizing: 'border-box',
}

function Mesero() {
  const [activeItem, setActiveItem] = useState('Mesas')
  const [cajaVista, setCajaVista] = useState('resumen')

  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargandoPedidos, setCargandoPedidos] = useState(false)
  const [modalPedido, setModalPedido] = useState(false)
  const [modoEdicionPedido, setModoEdicionPedido] = useState(false)
  const [pedidoActual, setPedidoActual] = useState(pedidoVacio)
  const [idEditandoPedido, setIdEditandoPedido] = useState<number | null>(null)
  const [guardandoPedido, setGuardandoPedido] = useState(false)
  const [errorPedido, setErrorPedido] = useState<string | null>(null)

  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cargandoFacturas, setCargandoFacturas] = useState(false)

  const cargarPedidos = () => {
    setCargandoPedidos(true)

    api
      .get('/pedidos')
      .then(r => setPedidos(r.data))
      .catch(console.error)
      .finally(() => setCargandoPedidos(false))
  }

  const cargarFacturas = () => {
    setCargandoFacturas(true)

    api
      .get('/facturas')
      .then(r => setFacturas(r.data))
      .catch(console.error)
      .finally(() => setCargandoFacturas(false))
  }

  useEffect(() => {
    if (activeItem === 'Pedidos') cargarPedidos()
  }, [activeItem])

  useEffect(() => {
    if (activeItem === 'Facturas') cargarFacturas()
  }, [activeItem])

  const abrirCrearPedido = () => {
    setModoEdicionPedido(false)
    setPedidoActual(pedidoVacio)
    setIdEditandoPedido(null)
    setErrorPedido(null)
    setModalPedido(true)
  }

  const abrirEditarPedido = (p: Pedido) => {
    setModoEdicionPedido(true)

    setPedidoActual({
      id_cliente: p.id_cliente?.toString() ?? '',
      id_mesero: p.id_mesero?.toString() ?? '',
      estado: p.estado,
      Tipo_pedido: p.Tipo_pedido,
      Mesa_num: p.Mesa_num?.toString() ?? '',
      notas: p.notas ?? '',
    })

    setIdEditandoPedido(p.id_pedido)
    setErrorPedido(null)
    setModalPedido(true)
  }

  const guardarPedido = async () => {
    if (!pedidoActual.Tipo_pedido.trim()) {
      setErrorPedido('El tipo de pedido es obligatorio')
      return
    }

    setGuardandoPedido(true)
    setErrorPedido(null)

    try {
      const payload = {
        ...pedidoActual,
        id_cliente: pedidoActual.id_cliente
          ? Number(pedidoActual.id_cliente)
          : null,
        id_mesero: pedidoActual.id_mesero
          ? Number(pedidoActual.id_mesero)
          : null,
        Mesa_num: pedidoActual.Mesa_num
          ? Number(pedidoActual.Mesa_num)
          : null,
      }

      modoEdicionPedido && idEditandoPedido
        ? await api.put(`/pedidos/${idEditandoPedido}`, payload)
        : await api.post('/pedidos', payload)

      setModalPedido(false)
      cargarPedidos()
    } catch (err: any) {
      setErrorPedido(err.response?.data?.message ?? 'Error al guardar')
    } finally {
      setGuardandoPedido(false)
    }
  }

  const cancelarPedido = async (id: number) => {
    if (!confirm('¿Deseas cancelar este pedido?')) return

    try {
      await api.delete(`/pedidos/${id}`)
      cargarPedidos()
    } catch {
      alert('Error al cancelar')
    }
  }

  return (
    <div
      className="flex min-h-screen font-['Manrope',_'DM_Sans',_sans-serif]"
      style={{
        ['--wa-primary' as any]: '#a5360d',
        ['--wa-primary-dark' as any]: '#852400',
        ['--wa-primary-light' as any]: '#ffdbd0',
        ['--wa-primary-container' as any]: '#c74d24',
        ['--wa-secondary' as any]: '#855400',
        ['--wa-secondary-light' as any]: '#ffddb7',
        ['--wa-secondary-fixed-dim' as any]: '#ffb95d',
        ['--wa-secondary-container' as any]: '#fcaa33',
        ['--wa-tertiary' as any]: '#00694c',
        ['--wa-tertiary-light' as any]: '#86f8c9',
        ['--wa-bg' as any]: '#fcf9f8',
        ['--wa-surface' as any]: '#ffffff',
        ['--wa-surface-low' as any]: '#f6f3f2',
        ['--wa-surface-mid' as any]: '#f0eded',
        ['--wa-surface-high' as any]: '#e5e2e1',
        ['--wa-text' as any]: '#1c1b1b',
        ['--wa-text-muted' as any]: '#58423b',
        ['--wa-border' as any]: 'rgba(224, 192, 182, 0.2)',
        background: 'var(--wa-bg)',
        color: 'var(--wa-text)',
      }}
    >

      {/* SIDEBAR */}
      <aside className="flex h-screen w-64 min-w-64 shrink-0 flex-col bg-[var(--wa-bg)] p-6 px-4">

        <div className="mb-10 px-2">
          <span className="block text-[1.25rem] font-extrabold tracking-[-0.03em] text-[var(--wa-primary)]">
            Remi<span className="text-[var(--wa-primary)]">Soft</span>
          </span>

          <div className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">
            Mesero
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">

          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-[0.95rem] font-bold transition-all duration-150 ease-in-out active:scale-[0.97] ${
                activeItem === item.label
                  ? 'bg-[var(--wa-surface)] text-[var(--wa-primary)] shadow-[0_2px_10px_rgba(28,27,27,0.05)]'
                  : 'bg-transparent text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {item.icon}
              </span>

              {item.label}
            </button>
          ))}

        </div>

        <div className="mt-auto flex flex-col gap-2">

          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[var(--wa-primary)] to-[var(--wa-primary-container)] px-4 py-3.5 text-[0.9rem] font-extrabold text-white shadow-[0_16px_24px_rgba(165,54,13,0.22)]">
            <span className="material-symbols-outlined text-[18px]">
              add
            </span>
            Acción Rápida
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl bg-transparent px-3 py-3.5 text-left text-[0.95rem] font-bold text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)]">
            <span className="material-symbols-outlined text-[18px]">
              settings
            </span>
            Configuraciones
          </button>

          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-transparent px-3 py-3.5 text-left text-[0.95rem] font-bold text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)]"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            Cerrar sesión
          </button>

        </div>

      </aside>


      {/* CONTENIDO PRINCIPAL */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--wa-surface-low)]">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-6 border-b border-[var(--wa-border)] bg-[rgba(252,249,248,0.8)] px-6 py-3 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] backdrop-blur-[12px]">

          <div className="flex items-center gap-6">

            <span className="text-[1.125rem] font-black text-[var(--wa-text)]">
              Bienvenido de nuevo, {user?.nombre ?? 'Mesero'}
            </span>

            <div className="flex items-center gap-6">

              <button className="border-none bg-transparent text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-primary)]">
                Plano del Piso
              </button>

              <button className="border-none bg-transparent text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">
                Pago Rápido
              </button>

            </div>

          </div>

          <div className="flex items-center gap-6">

            <div className="relative w-64">

              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[var(--wa-text-muted)]">
                search
              </span>

              <input
                type="text"
                placeholder="Buscar mesas o artículos..."
                className="w-full rounded-full border border-[var(--wa-border)] bg-[var(--wa-surface)] py-2.5 pl-10 pr-4 text-[0.875rem] outline-none focus:border-[var(--wa-primary)]"
              />

            </div>

            <button className="flex items-center justify-center border-none bg-transparent text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined">
                notifications
              </span>
            </button>

            <div className="flex items-center gap-2 border-l border-[var(--wa-border)] pl-4">

              <span className="block text-[0.75rem] font-extrabold">
                {user?.nombre ?? 'Mesero'}
              </span>

              <span className="material-symbols-outlined text-[var(--wa-primary)] [font-variation-settings:'FILL'_1]">
                account_circle
              </span>

            </div>

          </div>

        </header>


        {/* CONTENIDO */}
        <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">

          {/* =========================================================
              MESAS
          ========================================================== */}

          {activeItem === 'Mesas' && (
            <>

              <section className="grid grid-cols-4 gap-6">

                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className={`flex min-h-[128px] flex-col justify-between rounded-[20px] bg-[var(--wa-surface)] p-6 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.03)] ${
                      stat.accented
                        ? 'border-l-4 border-[var(--wa-secondary)]'
                        : ''
                    }`}
                  >

                    <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">
                      {stat.label}
                    </p>

                    <div className="flex flex-wrap items-baseline gap-2">

                      {stat.prefix && (
                        <span className="text-[1.125rem] font-extrabold text-[var(--wa-text-muted)]">
                          {stat.prefix}
                        </span>
                      )}

                      <span
                        className={`text-[2.25rem] font-black tracking-[-0.05em] ${
                          stat.color === 'amber'
                            ? 'text-[var(--wa-secondary)]'
                            : ''
                        }`}
                      >
                        {stat.value}
                      </span>

                      {stat.detail && stat.label === 'Mesas activas' && (
                        <span className="text-[0.75rem] font-extrabold text-[var(--wa-tertiary)]">
                          {stat.detail}
                        </span>
                      )}

                      {stat.detail && stat.label === 'Mesas en espera' && (
                        <span className="text-[0.75rem] font-extrabold text-[var(--wa-text-muted)]">
                          {stat.detail}
                        </span>
                      )}

                    </div>

                  </div>
                ))}

                <button className="flex min-h-[128px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[20px] border-none bg-gradient-to-br from-[var(--wa-primary)] to-[var(--wa-primary-container)] text-white shadow-[0_12px_32px_-4px_rgba(165,54,13,0.2)] transition-transform duration-150 ease-in-out active:scale-95">

                  <span className="material-symbols-outlined text-[32px]">
                    add_shopping_cart
                  </span>

                  <p className="text-[0.9rem] font-extrabold">
                    Registrar Venta
                  </p>

                </button>

              </section>


              <div className="grid grid-cols-[8fr_4fr] gap-8">

                <section className="flex flex-col gap-6">

                  <div className="flex items-end justify-between gap-4">

                    <div>

                      <h2 className="text-[1.75rem] font-black tracking-[-0.04em]">
                        Sala de Comedor Principal
                      </h2>

                      <p className="text-[0.875rem] font-semibold text-[var(--wa-text-muted)]">
                        Haz clic en una mesa para gestionar pedidos o generar facturas.
                      </p>

                    </div>

                    <div className="flex flex-wrap gap-2">

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(0,105,76,0.1)] px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-[var(--wa-tertiary)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--wa-tertiary)]" />
                        Disponible
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(133,84,0,0.1)] px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-[var(--wa-secondary)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--wa-secondary)]" />
                        Ocupada
                      </span>

                    </div>

                  </div>


                  <div className="grid grid-cols-4 gap-4">

                    {tables.map((table) => {

                      if (table.state === 'available') {

                        return (
                          <div
                            key={table.number}
                            className="flex min-h-[206px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[rgba(140,113,105,0.3)] bg-[var(--wa-surface-low)] p-5 text-center opacity-60 transition-opacity duration-200 ease-in-out hover:opacity-100"
                          >

                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--wa-surface-high)] text-[1.25rem] font-black text-[var(--wa-text-muted)]">
                              {table.number}
                            </div>

                            <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">
                              Disponible
                            </p>

                          </div>
                        )
                      }

                      return (
                        <div
                          key={table.number}
                          className={`rounded-[20px] border-2 bg-[var(--wa-surface)] p-5 transition-all duration-200 ease-in-out ${
                            table.state === 'waiting'
                              ? 'border-[rgba(133,84,0,0.2)] shadow-[0_14px_26px_rgba(133,84,0,0.08)]'
                              : table.state === 'done'
                              ? 'border-[rgba(0,105,76,0.2)]'
                              : 'border-transparent hover:border-[rgba(165,54,13,0.1)] hover:shadow-[0_18px_30px_rgba(28,27,27,0.08)]'
                          }`}
                        >

                          <div className="mb-4 flex items-center justify-between">

                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-full text-[1.25rem] font-black ${
                                table.state === 'waiting'
                                  ? 'bg-[var(--wa-secondary-container)] text-[#2a1700]'
                                  : 'bg-[var(--wa-secondary-fixed-dim)] text-[#2a1700]'
                              }`}
                            >
                              {table.number}
                            </div>

                            <span
                              className={`rounded-lg px-2 py-1.5 text-[0.625rem] font-extrabold ${
                                table.state === 'waiting'
                                  ? 'animate-pulse bg-[var(--wa-secondary-light)] text-[var(--wa-secondary)]'
                                  : table.state === 'done'
                                  ? 'bg-[var(--wa-tertiary-light)] text-[var(--wa-tertiary)]'
                                  : 'bg-[var(--wa-surface-mid)] text-[var(--wa-text-muted)]'
                              }`}
                            >
                              {table.badge}
                            </span>

                          </div>

                          <div>

                            <h3 className="text-[1rem] font-extrabold text-[var(--wa-text)]">
                              {table.name}
                            </h3>

                            <p className="mt-1 text-[0.75rem] text-[var(--wa-text-muted)]">
                              {table.meta}
                            </p>

                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-[rgba(224,192,182,0.1)] pt-4">

                            <span className="text-[1rem] font-black text-[var(--wa-primary)]">
                              {table.total}
                            </span>

                            {table.state === 'done' ? (
                              <button className="cursor-pointer rounded-full border-none bg-[var(--wa-tertiary)] px-3 py-2 text-[0.625rem] font-extrabold uppercase tracking-[0.06em] text-white">
                                Factura
                              </button>
                            ) : (
                              <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-[var(--wa-primary)] hover:bg-[var(--wa-primary-light)]">
                                <span className="material-symbols-outlined">
                                  {table.state === 'waiting'
                                    ? 'add'
                                    : table.number === '12'
                                    ? 'arrow_forward'
                                    : 'more_horiz'}
                                </span>
                              </button>
                            )}

                          </div>

                        </div>
                      )
                    })}

                  </div>

                </section>


                <aside className="flex h-[calc(100vh-12rem)] flex-col rounded-[20px] bg-[var(--wa-surface)] p-6 shadow-[0_2px_10px_rgba(28,27,27,0.04)]">

                  <div className="mb-6 flex items-center justify-between">

                    <h2 className="text-[1.125rem] font-black">
                      Cocina
                    </h2>

                    <span className="material-symbols-outlined text-[var(--wa-secondary)] [font-variation-settings:'FILL'_1]">
                      restaurant
                    </span>

                  </div>

                  <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-2">

                    {feedItems.map((item) => (
                      <div
                        key={`${item.status}-${item.time}`}
                        className={`rounded-2xl p-4 ${
                          item.tone === 'ready'
                            ? 'border-l-4 border-[var(--wa-tertiary)] bg-[rgba(0,105,76,0.05)]'
                            : item.tone === 'warning'
                            ? 'border-l-4 border-[var(--wa-secondary)] bg-[rgba(133,84,0,0.05)]'
                            : 'bg-[var(--wa-surface-low)]'
                        }`}
                      >

                        <div className="mb-1 flex justify-between gap-3">

                          <span
                            className={`text-[0.625rem] font-extrabold uppercase ${
                              item.tone === 'ready'
                                ? 'text-[var(--wa-tertiary)]'
                                : item.tone === 'warning'
                                ? 'text-[var(--wa-secondary)]'
                                : 'text-[var(--wa-text-muted)]'
                            }`}
                          >
                            {item.status}
                          </span>

                          <span className="text-[0.625rem] font-semibold text-[var(--wa-text-muted)]">
                            {item.time}
                          </span>

                        </div>

                        <p className="text-[0.9rem] font-bold text-[var(--wa-text)]">
                          {item.title}
                        </p>

                        <p className="text-[0.8rem] text-[var(--wa-text-muted)]">
                          {item.detail}
                        </p>

                      </div>
                    ))}

                  </div>

                </aside>

              </div>

            </>
          )}


          {/* =========================================================
              CRUD PEDIDOS
          ========================================================== */}

          {activeItem === 'Pedidos' && (
            <section className="m-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6">

              <div className="mb-5 flex items-center justify-between">

                <h3 className="text-[1rem] font-bold">
                  Gestión de Pedidos
                </h3>

                <button
                  className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
                  onClick={abrirCrearPedido}
                >
                  + Nuevo Pedido
                </button>

              </div>


              {cargandoPedidos ? (
                <p className="text-[0.85rem] text-[var(--texto-muted)]">
                  Cargando...
                </p>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full border-collapse text-[0.875rem]">

                    <thead>

                      <tr className="border-b border-[var(--borde)]">

                        {[
                          '#',
                          'Cliente',
                          'Mesero',
                          'Tipo',
                          'Mesa',
                          'Estado',
                          'Notas',
                          'Acciones',
                        ].map(h => (
                          <th
                            key={h}
                            className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-[var(--texto-muted)]"
                          >
                            {h}
                          </th>
                        ))}

                      </tr>

                    </thead>

                    <tbody>

                      {pedidos.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-8 text-center text-[var(--texto-muted)]"
                          >
                            Sin pedidos registrados
                          </td>
                        </tr>
                      ) : (
                        pedidos.map(p => (
                          <tr
                            key={p.id_pedido}
                            className="border-b border-[var(--borde)]"
                          >

                            <td className="px-3 py-2.5 font-semibold">
                              {p.id_pedido}
                            </td>

                            <td className="px-3 py-2.5">
                              {p.nombre_cliente ?? p.id_cliente ?? '—'}
                            </td>

                            <td className="px-3 py-2.5">
                              {p.nombre_mesero ?? p.id_mesero ?? '—'}
                            </td>

                            <td className="px-3 py-2.5">
                              {p.Tipo_pedido}
                            </td>

                            <td className="px-3 py-2.5">
                              {p.Mesa_num ?? '—'}
                            </td>

                            <td
                              className={`px-3 py-2.5 ${
                                p.estado === 'ABIERTO'
                                  ? 'text-[var(--verde)]'
                                  : p.estado === 'CANCELADO'
                                  ? 'text-[var(--rojo)]'
                                  : 'text-[var(--texto-muted)]'
                              }`}
                            >
                              {p.estado}
                            </td>

                            <td className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2.5">
                              {p.notas || '—'}
                            </td>

                            <td className="px-3 py-2.5">

                              <div className="flex gap-2">

                                <button
                                  className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3.5 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]"
                                  onClick={() => abrirEditarPedido(p)}
                                >
                                  Editar
                                </button>

                                <button
                                  className="w-auto rounded-[10px] border border-[var(--rojo)] bg-transparent px-3.5 py-1.5 text-[0.8rem] font-semibold text-[var(--rojo)] disabled:opacity-50"
                                  onClick={() => cancelarPedido(p.id_pedido)}
                                  disabled={p.estado === 'CANCELADO'}
                                >
                                  Cancelar
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


              <Modal
                isOpen={modalPedido}
                onClose={() => setModalPedido(false)}
              >

                <div className="px-6 pb-6">

                  <h3 className="mb-5 font-bold">
                    {modoEdicionPedido
                      ? 'Editar Pedido'
                      : 'Nuevo Pedido'}
                  </h3>

                  <div className="flex flex-col gap-3.5">

                    <div>
                      <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">
                        ID Cliente
                      </label>

                      <input
                        type="number"
                        placeholder="Opcional"
                        value={pedidoActual.id_cliente}
                        onChange={e =>
                          setPedidoActual(prev => ({
                            ...prev,
                            id_cliente: e.target.value,
                          }))
                        }
                        className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
                      />
                    </div>


                    <div>
                      <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">
                        ID Mesero
                      </label>

                      <input
                        type="number"
                        placeholder="Opcional"
                        value={pedidoActual.id_mesero}
                        onChange={e =>
                          setPedidoActual(prev => ({
                            ...prev,
                            id_mesero: e.target.value,
                          }))
                        }
                        className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
                      />
                    </div>


                    <div>
                      <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">
                        Tipo de Pedido *
                      </label>

                      <select
                        value={pedidoActual.Tipo_pedido}
                        onChange={e =>
                          setPedidoActual(prev => ({
                            ...prev,
                            Tipo_pedido: e.target.value,
                          }))
                        }
                        className="w-full cursor-pointer rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
                      >
                        <option value="MESA">MESA</option>
                        <option value="DOMICILIO">DOMICILIO</option>
                        <option value="LLEVAR">LLEVAR</option>
                      </select>
                    </div>


                    <div>
                      <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">
                        Número de Mesa
                      </label>

                      <input
                        type="number"
                        placeholder="Opcional"
                        value={pedidoActual.Mesa_num}
                        onChange={e =>
                          setPedidoActual(prev => ({
                            ...prev,
                            Mesa_num: e.target.value,
                          }))
                        }
                        className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
                      />
                    </div>


                    <div>
                      <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">
                        Estado
                      </label>

                      <select
                        value={pedidoActual.estado}
                        onChange={e =>
                          setPedidoActual(prev => ({
                            ...prev,
                            estado: e.target.value,
                          }))
                        }
                        className="w-full cursor-pointer rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
                      >
                        <option value="ABIERTO">ABIERTO</option>
                        <option value="EN_PROCESO">EN_PROCESO</option>
                        <option value="LISTO">LISTO</option>
                        <option value="ENTREGADO">ENTREGADO</option>
                        <option value="CANCELADO">CANCELADO</option>
                      </select>
                    </div>


                    <div>
                      <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">
                        Notas
                      </label>

                      <textarea
                        placeholder="Indicaciones especiales..."
                        value={pedidoActual.notas}
                        onChange={e =>
                          setPedidoActual(prev => ({
                            ...prev,
                            notas: e.target.value,
                          }))
                        }
                        className="min-h-[80px] w-full resize-y rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
                      />
                    </div>


                    {errorPedido && (
                      <p className="rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">
                        {errorPedido}
                      </p>
                    )}


                    <div className="mt-2 flex justify-end gap-3">

                      <button
                        className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
                        onClick={() => setModalPedido(false)}
                      >
                        Cancelar
                      </button>

                      <button
                        className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 text-[0.875rem] font-semibold text-white"
                        onClick={guardarPedido}
                        disabled={guardandoPedido}
                      >
                        {guardandoPedido
                          ? 'Guardando...'
                          : modoEdicionPedido
                          ? 'Actualizar'
                          : 'Crear Pedido'}
                      </button>

                    </div>

                  </div>

                </div>

              </Modal>

            </section>
          )}


          {/* =========================================================
              CAJA
          ========================================================== */}

          {activeItem === 'Caja' && (
            <>

              {/* =====================================================
                  RESUMEN DE CAJA
              ====================================================== */}

              {cajaVista === 'resumen' && (
                <section className="m-6">

                  {/* Encabezado */}

                  <div className="mb-6">

                    <h1 className="text-[1.5rem] font-bold text-[var(--texto)]">
                      Caja
                    </h1>

                    <p className="mt-1 text-[0.9rem] text-[var(--texto-muted)]">
                      Gestión y control de movimientos de caja
                    </p>

                  </div>


                  {/* Resumen de caja */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                    <div className="rounded-[14px] border border-[var(--borde)] bg-[var(--surface)] p-5 shadow-sm">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[0.82rem] font-semibold text-[var(--texto-muted)]">
                          Saldo actual
                        </span>

                        <span className="material-symbols-outlined text-[1.4rem]">
                          account_balance_wallet
                        </span>

                      </div>

                      <p className="text-[1.5rem] font-bold text-[var(--texto)]">
                        $1.482.500
                      </p>

                      <p className="mt-1 text-[0.78rem] text-[var(--texto-muted)]">
                        Saldo disponible en caja
                      </p>

                    </div>


                    <div className="rounded-[14px] border border-[var(--borde)] bg-[var(--surface)] p-5 shadow-sm">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[0.82rem] font-semibold text-[var(--texto-muted)]">
                          Ingresos de hoy
                        </span>

                        <span className="material-symbols-outlined text-[1.4rem]">
                          trending_up
                        </span>

                      </div>

                      <p className="text-[1.5rem] font-bold text-[var(--texto)]">
                        $2.350.000
                      </p>

                      <p className="mt-1 text-[0.78rem] text-[var(--texto-muted)]">
                        Total de ingresos registrados
                      </p>

                    </div>


                    <div className="rounded-[14px] border border-[var(--borde)] bg-[var(--surface)] p-5 shadow-sm">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[0.82rem] font-semibold text-[var(--texto-muted)]">
                          Egresos de hoy
                        </span>

                        <span className="material-symbols-outlined text-[1.4rem]">
                          trending_down
                        </span>

                      </div>

                      <p className="text-[1.5rem] font-bold text-[var(--texto)]">
                        $867.500
                      </p>

                      <p className="mt-1 text-[0.78rem] text-[var(--texto-muted)]">
                        Total de egresos registrados
                      </p>

                    </div>


                    <div className="rounded-[14px] border border-[var(--borde)] bg-[var(--surface)] p-5 shadow-sm">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[0.82rem] font-semibold text-[var(--texto-muted)]">
                          Estado de caja
                        </span>

                        <span className="material-symbols-outlined text-[1.4rem]">
                          point_of_sale
                        </span>

                      </div>

                      <p className="text-[1.5rem] font-bold text-[var(--texto)]">
                        Abierta
                      </p>

                      <p className="mt-1 text-[0.78rem] text-[var(--texto-muted)]">
                        Turno activo
                      </p>

                    </div>

                  </div>


                  {/* Acciones de caja */}

                  <div className="mt-6">

                    <div className="mb-4">
                      <h2 className="text-[1.1rem] font-bold text-[var(--wa-text)]">
                        Acciones de caja
                      </h2>
                      <p className="mt-1 text-[0.85rem] text-[var(--wa-text-muted)]">
                        Gestiona las operaciones principales de la caja
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>


                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                      {/* Aperturas de caja */}
                      <button
                        type="button"
                        onClick={() => setCajaVista('aperturas')}
                        className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-tertiary-light)]">
                          <span className="material-symbols-outlined text-[1.5rem] text-[var(--wa-tertiary)]">
                            lock_open
                          </span>
                        </div>
                        <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">
                          Aperturas de caja
                        </h3>
                        <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
                          Registra y consulta las aperturas de caja.
                        </p>
                      </button>


                      {/* Cierres de turno */}
                      <button
                        type="button"
                        onClick={() => setCajaVista('cierres')}
                        className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-secondary-light)]">
                          <span className="material-symbols-outlined text-[1.5rem] text-[var(--wa-secondary)]">
                            lock
                          </span>
                        </div>
                        <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">
                          Cierres de turno
                        </h3>
                        <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
                          Consulta los cierres realizados durante los turnos.
                        </p>
                      </button>


                      {/* Reportes de ventas */}
                      <button
                        type="button"
                        onClick={() => setCajaVista('reportes')}
                        className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-primary-light)]">
                          <span className="material-symbols-outlined text-[1.5rem] text-[var(--wa-primary)]">
                            bar_chart
                          </span>
                        </div>
                        <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">
                          Reportes de ventas del día
                        </h3>
                        <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
                          Visualiza un resumen de las ventas realizadas.
                        </p>
                      </button>


                       {/* Arqueos de caja */}
                      <button
                        type="button"
                        onClick={() => setCajaVista('arqueos')}
                        className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-tertiary-light)]">
                          <span className="material-symbols-outlined text-[1.5rem] text-[var(--wa-tertiary)]">
                            calculate
                          </span>
                        </div>
                        <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">
                          Arqueos de caja
                        </h3>
                        <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
                          Revisa y controla los arqueos de caja.
                        </p>
                      </button>


                      {/* Gastos menores */}
                      <button
                        type="button"
                        onClick={() => setCajaVista('gastos')}
                        className="group rounded-[14px] border border-[var(--wa-border)] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[10px] bg-[var(--wa-primary-light)]">
                          <span className="material-symbols-outlined text-[1.5rem] text-[var(--wa-primary)]">
                            payments
                          </span>
                        </div>
                        <h3 className="text-[0.95rem] font-bold text-[var(--wa-text)]">
                          Gastos menores
                        </h3>
                        <p className="mt-1 text-[0.8rem] leading-5 text-[var(--wa-text-muted)]">
                          Registra y consulta los gastos menores de caja.
                        </p>
                      </button>

                    </div>

                  </div>
                </section>
              )}


              {/* =====================================================
                  APERTURAS DE CAJA
              ====================================================== */}

              {cajaVista === 'aperturas' && (
                <section className="m-6">

                  {/* ENCABEZADO */}

                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() => setCajaVista('resumen')}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--wa-border)] bg-white transition hover:bg-[var(--wa-surface-low)]"
                        title="Volver"
                      >

                        <span className="material-symbols-outlined">
                          arrow_back
                        </span>

                      </button>

                      <div>

                        <h1 className="text-[1.5rem] font-bold">
                          Aperturas de caja
                        </h1>

                        <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
                          Registra y consulta las aperturas realizadas.
                        </p>

                      </div>

                    </div>


                    {/* ACCIÓN PRINCIPAL */}

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--wa-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--wa-primary-dark)]"
                    >

                      <span className="material-symbols-outlined text-[1.2rem]">
                        add
                      </span>

                      Registrar apertura

                    </button>

                  </div>


                  {/* ESTADO ACTUAL */}

                  <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

                    <div className="mb-4 flex items-center justify-between">

                      <div>

                        <h2 className="text-[1.05rem] font-bold">
                          Estado actual de la caja
                        </h2>

                        <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
                          Información de la apertura activa
                        </p>

                      </div>

                      <span className="flex items-center gap-2 rounded-full bg-[#dcfce7] px-3 py-1.5 text-sm font-semibold text-[#166534]">

                        <span className="h-2 w-2 rounded-full bg-[#22c55e]" />

                        Abierta

                      </span>

                    </div>


                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                      {/* MONTO */}

                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">

                          <span className="material-symbols-outlined text-[1.2rem]">
                            payments
                          </span>

                          <span className="text-sm">
                            Monto inicial
                          </span>

                        </div>

                        <p className="text-[1.3rem] font-bold">
                          $100.000
                        </p>

                      </div>


                      {/* RESPONSABLE */}

                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">

                          <span className="material-symbols-outlined text-[1.2rem]">
                            person
                          </span>

                          <span className="text-sm">
                            Responsable
                          </span>

                        </div>

                        <p className="font-bold">
                          Juan Pérez
                        </p>

                      </div>


                      {/* FECHA */}

                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">

                          <span className="material-symbols-outlined text-[1.2rem]">
                            calendar_today
                          </span>

                          <span className="text-sm">
                            Fecha
                          </span>

                        </div>

                        <p className="font-bold">
                          02/09/2026
                        </p>

                      </div>


                      {/* HORA */}

                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">

                          <span className="material-symbols-outlined text-[1.2rem]">
                            schedule
                          </span>

                          <span className="text-sm">
                            Hora de apertura
                          </span>

                        </div>

                        <p className="font-bold">
                          08:02 AM
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* HISTORIAL */}

                  <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">

                    <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <h2 className="text-[1.05rem] font-bold">
                          Historial de aperturas
                        </h2>

                        <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
                          Consulta las aperturas realizadas anteriormente.
                        </p>

                      </div>


                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--wa-surface-low)]"
                      >

                        <span className="material-symbols-outlined text-[1.1rem]">
                          filter_list
                        </span>

                        Filtrar

                      </button>

                    </div>


                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[700px]">

                        <thead>

                          <tr className="bg-[var(--wa-surface-low)] text-left text-sm">

                            <th className="px-5 py-3 font-semibold">
                              Fecha
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Hora
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Responsable
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Monto inicial
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Estado
                            </th>

                            <th className="px-5 py-3 text-right font-semibold">
                              Acción
                            </th>

                          </tr>

                        </thead>


                        <tbody>

                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              02/09/2026
                            </td>

                            <td className="px-5 py-4 text-sm">
                              08:02 AM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              Juan Pérez
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $100.000
                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">
                                Abierta
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right">

                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                                title="Ver apertura"
                              >

                                <span className="material-symbols-outlined text-[1.2rem]">
                                  visibility
                                </span>

                              </button>

                            </td>

                          </tr>


                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              01/09/2026
                            </td>

                            <td className="px-5 py-4 text-sm">
                              07:58 AM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              María Gómez
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $150.000
                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-full bg-[var(--wa-surface-high)] px-3 py-1 text-xs font-semibold text-[var(--wa-text-muted)]">
                                Cerrada
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right">

                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                                title="Ver apertura"
                              >

                                <span className="material-symbols-outlined text-[1.2rem]">
                                  visibility
                                </span>

                              </button>

                            </td>

                          </tr>


                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              31/08/2026
                            </td>

                            <td className="px-5 py-4 text-sm">
                              08:05 AM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              Carlos Rodríguez
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $120.000
                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-full bg-[var(--wa-surface-high)] px-3 py-1 text-xs font-semibold text-[var(--wa-text-muted)]">
                                Cerrada
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right">

                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                                title="Ver apertura"
                              >

                                <span className="material-symbols-outlined text-[1.2rem]">
                                  visibility
                                </span>

                              </button>

                            </td>

                          </tr>

                        </tbody>

                      </table>

                    </div>

                  </div>

                </section>
              )}


              {/* =====================================================
                  CIERRES DE TURNO
              ====================================================== */}

              {cajaVista === 'cierres' && (
                <section className="m-6">

                  {/* ENCABEZADO */}

                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() => setCajaVista('resumen')}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--wa-border)] bg-white transition hover:bg-[var(--wa-surface-low)]"
                        title="Volver"
                      >

                        <span className="material-symbols-outlined">
                          arrow_back
                        </span>

                      </button>


                      <div>

                        <h1 className="text-[1.5rem] font-bold text-[var(--texto)]">
                          Cierre de turno
                        </h1>

                        <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
                          Consulta los cierres realizados durante los turnos.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* RESUMEN DEL ÚLTIMO CIERRE */}

                  <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

                    <div className="mb-4">

                      <h2 className="text-[1.05rem] font-bold">
                        Último turno cerrado
                      </h2>

                      <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
                        Resumen del cierre más reciente.
                      </p>

                    </div>


                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">

                          <span className="material-symbols-outlined text-[1.2rem]">
                            person
                          </span>

                          <span className="text-sm">
                            Responsable
                          </span>

                        </div>

                        <p className="font-bold">
                          María Gómez
                        </p>

                      </div>


                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">

                          <span className="material-symbols-outlined text-[1.2rem]">
                            calendar_today
                          </span>

                          <span className="text-sm">
                            Fecha
                          </span>

                        </div>

                        <p className="font-bold">
                          01/09/2026
                        </p>

                      </div>


                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">

                          <span className="material-symbols-outlined text-[1.2rem]">
                            point_of_sale
                          </span>

                          <span className="text-sm">
                            Total de ventas
                          </span>

                        </div>

                        <p className="text-[1.3rem] font-bold">
                          $850.000
                        </p>

                      </div>


                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">

                          <span className="material-symbols-outlined text-[1.2rem]">
                            payments
                          </span>

                          <span className="text-sm">
                            Monto final
                          </span>

                        </div>

                        <p className="text-[1.3rem] font-bold">
                          $980.000
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* HISTORIAL DE CIERRES */}

                  <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">

                    <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <h2 className="text-[1.05rem] font-bold">
                          Historial de cierres
                        </h2>

                        <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
                          Consulta los cierres realizados durante turnos anteriores.
                        </p>

                      </div>


                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--wa-surface-low)]"
                      >

                        <span className="material-symbols-outlined text-[1.1rem]">
                          filter_list
                        </span>

                        Filtrar

                      </button>

                    </div>


                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[950px]">

                        <thead>

                          <tr className="bg-[var(--wa-surface-low)] text-left text-sm">

                            <th className="px-5 py-3 font-semibold">
                              Fecha
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Turno
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Responsable
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Monto inicial
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Ventas
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Monto final
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Estado
                            </th>

                            <th className="px-5 py-3 text-right font-semibold">
                              Acción
                            </th>

                          </tr>

                        </thead>


                        <tbody>

                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              01/09/2026
                            </td>

                            <td className="px-5 py-4 text-sm">
                              08:00 AM - 06:00 PM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              María Gómez
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $150.000
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $850.000
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $980.000
                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-full bg-[var(--wa-surface-high)] px-3 py-1 text-xs font-semibold text-[var(--wa-text-muted)]">
                                Cerrado
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right">

                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                                title="Ver cierre"
                              >

                                <span className="material-symbols-outlined text-[1.2rem]">
                                  visibility
                                </span>

                              </button>

                            </td>

                          </tr>


                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              31/08/2026
                            </td>

                            <td className="px-5 py-4 text-sm">
                              08:05 AM - 05:45 PM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              Carlos Rodríguez
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $120.000
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $720.000
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $840.000
                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-full bg-[var(--wa-surface-high)] px-3 py-1 text-xs font-semibold text-[var(--wa-text-muted)]">
                                Cerrado
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right">

                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                                title="Ver cierre"
                              >

                                <span className="material-symbols-outlined text-[1.2rem]">
                                  visibility
                                </span>

                              </button>

                            </td>

                          </tr>


                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              30/08/2026
                            </td>

                            <td className="px-5 py-4 text-sm">
                              08:00 AM - 06:10 PM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              Juan Pérez
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $100.000
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $690.000
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold">
                              $790.000
                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-full bg-[var(--wa-surface-high)] px-3 py-1 text-xs font-semibold text-[var(--wa-text-muted)]">
                                Cerrado
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right">

                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--wa-surface-low)]"
                                title="Ver cierre"
                              >

                                <span className="material-symbols-outlined text-[1.2rem]">
                                  visibility
                                </span>

                              </button>

                            </td>

                          </tr>

                        </tbody>

                      </table>

                    </div>

                  </div>

                </section>
              )}


              {/* =====================================================
                  REPORTES DE VENTAS DEL DÍA
              ====================================================== */}

              {cajaVista === 'reportes' && (
                <section className="m-6">

                  {/* ENCABEZADO */}

                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-3">

                      <button
                        type="button"
                        onClick={() => setCajaVista('resumen')}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--wa-border)] bg-white transition hover:bg-[var(--wa-surface-low)]"
                        title="Volver"
                      >

                        <span className="material-symbols-outlined">
                          arrow_back
                        </span>

                      </button>


                      <div>

                        <h1 className="text-[1.5rem] font-bold text-[var(--texto)]">
                          Reportes de ventas del día
                        </h1>

                        <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
                          Visualiza un resumen de las ventas realizadas durante el día.
                        </p>

                      </div>

                    </div>


                    {/* FECHA */}

                    <div className="rounded-[9px] border border-[var(--wa-border)] bg-white px-4 py-2">

                      <div className="flex items-center gap-2">

                        <span className="material-symbols-outlined text-[1.1rem]">
                          calendar_today
                        </span>

                        <span className="text-sm font-semibold">
                          02/09/2026
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* RESUMEN DE VENTAS */}

                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                    {/* TOTAL VENTAS */}

                    <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">
                          Ventas del día
                        </span>

                        <span className="material-symbols-outlined text-[1.4rem]">
                          point_of_sale
                        </span>

                      </div>

                      <p className="text-[1.5rem] font-bold">
                        $1.245.000
                      </p>

                      <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">
                        Total vendido durante el día
                      </p>

                    </div>


                    {/* PEDIDOS */}

                    <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">
                          Pedidos realizados
                        </span>

                        <span className="material-symbols-outlined text-[1.4rem]">
                          receipt_long
                        </span>

                      </div>

                      <p className="text-[1.5rem] font-bold">
                        48
                      </p>

                      <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">
                        Pedidos completados hoy
                      </p>

                    </div>


                    {/* TICKET PROMEDIO */}

                    <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">
                          Ticket promedio
                        </span>

                        <span className="material-symbols-outlined text-[1.4rem]">
                          trending_up
                        </span>

                      </div>

                      <p className="text-[1.5rem] font-bold">
                        $25.938
                      </p>

                      <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">
                        Promedio por pedido
                      </p>

                    </div>


                    {/* TRANSACCIONES */}

                    <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

                      <div className="mb-3 flex items-center justify-between">

                        <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">
                          Transacciones
                        </span>

                        <span className="material-symbols-outlined text-[1.4rem]">
                          check_circle
                        </span>

                      </div>

                      <p className="text-[1.5rem] font-bold">
                        48
                      </p>

                      <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">
                        Ventas contabilizadas
                      </p>

                    </div>

                  </div>


                  {/* FORMAS DE PAGO */}

                  <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

                    <div className="mb-5">

                      <h2 className="text-[1.05rem] font-bold">
                        Ventas por forma de pago
                      </h2>

                      <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
                        Distribución de las ventas realizadas según el medio de pago.
                      </p>

                    </div>


                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                      {/* EFECTIVO */}

                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-3 flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-white">

                            <span className="material-symbols-outlined">
                              payments
                            </span>

                          </div>

                          <div>

                            <p className="text-sm text-[var(--wa-text-muted)]">
                              Efectivo
                            </p>

                            <p className="font-bold">
                              $520.000
                            </p>

                          </div>

                        </div>


                        <div className="h-2 overflow-hidden rounded-full bg-white">

                          <div
                            className="h-full rounded-full bg-[var(--wa-primary)]"
                            style={{ width: '42%' }}
                          />

                        </div>


                        <p className="mt-2 text-xs text-[var(--wa-text-muted)]">
                          42% de las ventas
                        </p>

                      </div>


                      {/* TARJETA */}

                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-3 flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-white">

                            <span className="material-symbols-outlined">
                              credit_card
                            </span>

                          </div>

                          <div>

                            <p className="text-sm text-[var(--wa-text-muted)]">
                              Tarjeta
                            </p>

                            <p className="font-bold">
                              $475.000
                            </p>

                          </div>

                        </div>


                        <div className="h-2 overflow-hidden rounded-full bg-white">

                          <div
                            className="h-full rounded-full bg-[var(--wa-secondary)]"
                            style={{ width: '38%' }}
                          />

                        </div>


                        <p className="mt-2 text-xs text-[var(--wa-text-muted)]">
                          38% de las ventas
                        </p>

                      </div>


                      {/* OTROS */}

                      <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

                        <div className="mb-3 flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-white">

                            <span className="material-symbols-outlined">
                              account_balance
                            </span>

                          </div>

                          <div>

                            <p className="text-sm text-[var(--wa-text-muted)]">
                              Otros medios
                            </p>

                            <p className="font-bold">
                              $250.000
                            </p>

                          </div>

                        </div>


                        <div className="h-2 overflow-hidden rounded-full bg-white">

                          <div
                            className="h-full rounded-full bg-[var(--wa-tertiary)]"
                            style={{ width: '20%' }}
                          />

                        </div>


                        <p className="mt-2 text-xs text-[var(--wa-text-muted)]">
                          20% de las ventas
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* HISTORIAL DE VENTAS */}

                  <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">

                    {/* ENCABEZADO */}

                    <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <h2 className="text-[1.05rem] font-bold">
                          Ventas realizadas
                        </h2>

                        <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
                          Resumen de las ventas registradas durante el día.
                        </p>

                      </div>


                      {/* FILTRO */}

                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--wa-surface-low)]"
                      >

                        <span className="material-symbols-outlined text-[1.1rem]">
                          filter_list
                        </span>

                        Filtrar

                      </button>

                    </div>


                    {/* TABLA */}

                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[900px]">

                        <thead>

                          <tr className="bg-[var(--wa-surface-low)] text-left text-sm">

                            <th className="px-5 py-3 font-semibold">
                              Hora
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Pedido
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Mesa
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Responsable
                            </th>

                            <th className="px-5 py-3 font-semibold">
                              Forma de pago
                            </th>

                            <th className="px-5 py-3 text-right font-semibold">
                              Total
                            </th>

                          </tr>

                        </thead>


                        <tbody>

                          {/* VENTA 1 */}

                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              12:45 PM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              #1048
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Mesa 12
                            </td>

                            <td className="px-5 py-4 text-sm">
                              María Gómez
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Efectivo
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-bold">
                              $142.500
                            </td>

                          </tr>


                          {/* VENTA 2 */}

                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              01:20 PM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              #1049
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Mesa 04
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Carlos Rodríguez
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Tarjeta
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-bold">
                              $86.000
                            </td>

                          </tr>


                          {/* VENTA 3 */}

                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              02:05 PM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              #1050
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Mesa 08
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Juan Pérez
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Efectivo
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-bold">
                              $215.000
                            </td>

                          </tr>


                          {/* VENTA 4 */}

                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              03:15 PM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              #1051
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Mesa 15
                            </td>

                            <td className="px-5 py-4 text-sm">
                              María Gómez
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Tarjeta
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-bold">
                              $178.500
                            </td>

                          </tr>


                          {/* VENTA 5 */}

                          <tr className="border-t border-[var(--wa-border)]">

                            <td className="px-5 py-4 text-sm">
                              04:40 PM
                            </td>

                            <td className="px-5 py-4 text-sm font-medium">
                              #1052
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Mesa 22
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Carlos Rodríguez
                            </td>

                            <td className="px-5 py-4 text-sm">
                              Otros
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-bold">
                              $310.000
                            </td>

                          </tr>

                        </tbody>

                      </table>

                    </div>

                  </div>

                </section>
              )}


              {/* =====================================================
    ARQUEOS DE CAJA
====================================================== */}

{cajaVista === 'arqueos' && (
  <section className="m-6">

    {/* ENCABEZADO */}
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() => setCajaVista('resumen')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--wa-border)] bg-white transition hover:bg-[var(--wa-surface-low)]"
          title="Volver"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>

        <div>
          <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            Arqueos de caja
          </h1>

          <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
            Revisa y controla los arqueos realizados.
          </p>
        </div>

      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--wa-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--wa-primary-dark)]"
      >
        <span className="material-symbols-outlined text-[1.2rem]">
          calculate
        </span>

        Realizar arqueo
      </button>

    </div>


    {/* RESUMEN DEL ARQUEO ACTUAL */}
    <div className="mb-6 rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">
            Arqueo actual
          </h2>

          <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
            Comparación entre el dinero esperado y el dinero contado.
          </p>
        </div>

        <span className="flex w-fit items-center gap-2 rounded-full bg-[#dcfce7] px-3 py-1.5 text-sm font-semibold text-[#166534]">
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
          Cuadrado
        </span>

      </div>


      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* MONTO ESPERADO */}
        <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

          <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
            <span className="material-symbols-outlined text-[1.2rem]">
              payments
            </span>

            <span className="text-sm">
              Monto esperado
            </span>
          </div>

          <p className="text-[1.3rem] font-bold text-[var(--wa-text)]">
            $1.482.500
          </p>

        </div>


        {/* MONTO CONTADO */}
        <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

          <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
            <span className="material-symbols-outlined text-[1.2rem]">
              account_balance_wallet
            </span>

            <span className="text-sm">
              Monto contado
            </span>
          </div>

          <p className="text-[1.3rem] font-bold text-[var(--wa-text)]">
            $1.482.500
          </p>

        </div>


        {/* DIFERENCIA */}
        <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

          <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
            <span className="material-symbols-outlined text-[1.2rem]">
              compare_arrows
            </span>

            <span className="text-sm">
              Diferencia
            </span>
          </div>

          <p className="text-[1.3rem] font-bold text-[var(--wa-tertiary)]">
            $0
          </p>

        </div>


        {/* RESPONSABLE */}
        <div className="rounded-[12px] bg-[var(--wa-surface-low)] p-4">

          <div className="mb-2 flex items-center gap-2 text-[var(--wa-text-muted)]">
            <span className="material-symbols-outlined text-[1.2rem]">
              person
            </span>

            <span className="text-sm">
              Responsable
            </span>
          </div>

          <p className="font-bold text-[var(--wa-text)]">
            Juan Pérez
          </p>

        </div>

      </div>

    </div>


    {/* HISTORIAL DE ARQUEOS */}
    <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">

      {/* CABECERA */}
      <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">
            Historial de arqueos
          </h2>

          <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
            Consulta y verifica los arqueos realizados anteriormente.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--wa-surface-low)]"
        >
          <span className="material-symbols-outlined text-[1.1rem]">
            filter_list
          </span>

          Filtrar
        </button>

      </div>


      {/* TABLA */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[1100px]">

          <thead>
            <tr className="bg-[var(--wa-surface-low)] text-left text-sm">

              <th className="px-5 py-3 font-semibold">
                Fecha
              </th>

              <th className="px-5 py-3 font-semibold">
                Hora
              </th>

              <th className="px-5 py-3 font-semibold">
                Responsable
              </th>

              <th className="px-5 py-3 font-semibold">
                Caja
              </th>

              <th className="px-5 py-3 font-semibold">
                Esperado
              </th>

              <th className="px-5 py-3 font-semibold">
                Contado
              </th>

              <th className="px-5 py-3 font-semibold">
                Diferencia
              </th>

              <th className="px-5 py-3 font-semibold">
                Estado
              </th>

              <th className="px-5 py-3 text-right font-semibold">
                Acción
              </th>

            </tr>
          </thead>


          <tbody>

            {/* ARQUEO 1 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                02/09/2026
              </td>

              <td className="px-5 py-4 text-sm">
                03:45 PM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                Juan Pérez
              </td>

              <td className="px-5 py-4 text-sm">
                Caja principal
              </td>

              <td className="px-5 py-4 text-sm font-semibold">
                $1.482.500
              </td>

              <td className="px-5 py-4 text-sm font-semibold">
                $1.482.500
              </td>

              <td className="px-5 py-4 text-sm font-semibold text-[var(--wa-tertiary)]">
                $0
              </td>

              <td className="px-5 py-4">

                <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">
                  Cuadrado
                </span>

              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver arqueo"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>


            {/* ARQUEO 2 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                01/09/2026
              </td>

              <td className="px-5 py-4 text-sm">
                05:50 PM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                María Gómez
              </td>

              <td className="px-5 py-4 text-sm">
                Caja principal
              </td>

              <td className="px-5 py-4 text-sm font-semibold">
                $980.000
              </td>

              <td className="px-5 py-4 text-sm font-semibold">
                $990.000
              </td>

              <td className="px-5 py-4 text-sm font-semibold text-[var(--wa-secondary)]">
                +$10.000
              </td>

              <td className="px-5 py-4">

                <span className="rounded-full bg-[var(--wa-secondary-light)] px-3 py-1 text-xs font-semibold text-[var(--wa-secondary)]">
                  Sobrante
                </span>

              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver arqueo"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>


            {/* ARQUEO 3 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                31/08/2026
              </td>

              <td className="px-5 py-4 text-sm">
                05:40 PM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                Carlos Rodríguez
              </td>

              <td className="px-5 py-4 text-sm">
                Caja principal
              </td>

              <td className="px-5 py-4 text-sm font-semibold">
                $840.000
              </td>

              <td className="px-5 py-4 text-sm font-semibold">
                $830.000
              </td>

              <td className="px-5 py-4 text-sm font-semibold text-[var(--wa-primary)]">
                -$10.000
              </td>

              <td className="px-5 py-4">

                <span className="rounded-full bg-[var(--wa-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--wa-primary)]">
                  Faltante
                </span>

              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver arqueo"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>


            {/* ARQUEO 4 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                30/08/2026
              </td>

              <td className="px-5 py-4 text-sm">
                05:35 PM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                Juan Pérez
              </td>

              <td className="px-5 py-4 text-sm">
                Caja principal
              </td>

              <td className="px-5 py-4 text-sm font-semibold">
                $760.000
              </td>

              <td className="px-5 py-4 text-sm font-semibold">
                $760.000
              </td>

              <td className="px-5 py-4 text-sm font-semibold text-[var(--wa-tertiary)]">
                $0
              </td>

              <td className="px-5 py-4">

                <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">
                  Cuadrado
                </span>

              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver arqueo"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </section>
)}


{/* =====================================================
    GASTOS MENORES DE CAJA
====================================================== */}

{cajaVista === 'gastos' && (
  <section className="m-6">

    {/* ENCABEZADO */}
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() => setCajaVista('resumen')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--wa-border)] bg-white transition hover:bg-[var(--wa-surface-low)]"
          title="Volver"
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>

        <div>
          <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            Gastos menores
          </h1>

          <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
            Registra y consulta los gastos menores realizados desde caja.
          </p>
        </div>

      </div>


      {/* BOTÓN REGISTRAR */}
      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--wa-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--wa-primary-dark)]"
      >
        <span className="material-symbols-outlined text-[1.2rem]">
          add
        </span>

        Registrar gasto
      </button>

    </div>


    {/* RESUMEN DE GASTOS */}
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

      {/* GASTOS DEL DÍA */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">
            Gastos de hoy
          </span>

          <span className="material-symbols-outlined text-[var(--wa-primary)]">
            receipt_long
          </span>

        </div>

        <p className="text-[1.5rem] font-black text-[var(--wa-text)]">
          $87.500
        </p>

        <p className="mt-1 text-xs text-[var(--wa-text-muted)]">
          5 gastos registrados
        </p>

      </div>


      {/* GASTOS DEL MES */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">
            Gastos del mes
          </span>

          <span className="material-symbols-outlined text-[var(--wa-secondary)]">
            calendar_month
          </span>

        </div>

        <p className="text-[1.5rem] font-black text-[var(--wa-text)]">
          $425.000
        </p>

        <p className="mt-1 text-xs text-[var(--wa-text-muted)]">
          Agosto - Septiembre 2026
        </p>

      </div>


      {/* ÚLTIMO GASTO */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">
            Último gasto
          </span>

          <span className="material-symbols-outlined text-[var(--wa-primary)]">
            payments
          </span>

        </div>

        <p className="text-[1.5rem] font-black text-[var(--wa-text)]">
          $25.000
        </p>

        <p className="mt-1 text-xs text-[var(--wa-text-muted)]">
          Compra de suministros
        </p>

      </div>


      {/* SALDO DISPONIBLE */}
      <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">
            Saldo disponible
          </span>

          <span className="material-symbols-outlined text-[var(--wa-tertiary)]">
            account_balance_wallet
          </span>

        </div>

        <p className="text-[1.5rem] font-black text-[var(--wa-tertiary)]">
          $1.395.000
        </p>

        <p className="mt-1 text-xs text-[var(--wa-text-muted)]">
          Disponible en caja
        </p>

      </div>

    </div>


    {/* HISTORIAL */}
    <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">

      {/* CABECERA DEL HISTORIAL */}
      <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">
            Historial de gastos
          </h2>

          <p className="mt-1 text-sm text-[var(--wa-text-muted)]">
            Consulta los gastos menores registrados en caja.
          </p>
        </div>


        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--wa-surface-low)]"
        >
          <span className="material-symbols-outlined text-[1.1rem]">
            filter_list
          </span>

          Filtrar
        </button>

      </div>


      {/* TABLA */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[1050px]">

          <thead>

            <tr className="bg-[var(--wa-surface-low)] text-left text-sm">

              <th className="px-5 py-3 font-semibold">
                Fecha
              </th>

              <th className="px-5 py-3 font-semibold">
                Hora
              </th>

              <th className="px-5 py-3 font-semibold">
                Concepto
              </th>

              <th className="px-5 py-3 font-semibold">
                Categoría
              </th>

              <th className="px-5 py-3 font-semibold">
                Responsable
              </th>

              <th className="px-5 py-3 font-semibold">
                Método
              </th>

              <th className="px-5 py-3 font-semibold">
                Monto
              </th>

              <th className="px-5 py-3 text-right font-semibold">
                Acción
              </th>

            </tr>

          </thead>


          <tbody>

            {/* GASTO 1 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                02/09/2026
              </td>

              <td className="px-5 py-4 text-sm">
                10:15 AM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                Compra de suministros
              </td>

              <td className="px-5 py-4 text-sm">
                Suministros
              </td>

              <td className="px-5 py-4 text-sm">
                Juan Pérez
              </td>

              <td className="px-5 py-4 text-sm">
                Efectivo
              </td>

              <td className="px-5 py-4 text-sm font-bold">
                $25.000
              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver gasto"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>


            {/* GASTO 2 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                02/09/2026
              </td>

              <td className="px-5 py-4 text-sm">
                09:20 AM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                Compra de hielo
              </td>

              <td className="px-5 py-4 text-sm">
                Insumos
              </td>

              <td className="px-5 py-4 text-sm">
                María Gómez
              </td>

              <td className="px-5 py-4 text-sm">
                Efectivo
              </td>

              <td className="px-5 py-4 text-sm font-bold">
                $18.000
              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver gasto"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>


            {/* GASTO 3 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                01/09/2026
              </td>

              <td className="px-5 py-4 text-sm">
                03:40 PM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                Transporte
              </td>

              <td className="px-5 py-4 text-sm">
                Transporte
              </td>

              <td className="px-5 py-4 text-sm">
                Carlos Rodríguez
              </td>

              <td className="px-5 py-4 text-sm">
                Efectivo
              </td>

              <td className="px-5 py-4 text-sm font-bold">
                $15.000
              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver gasto"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>


            {/* GASTO 4 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                01/09/2026
              </td>

              <td className="px-5 py-4 text-sm">
                11:30 AM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                Material de limpieza
              </td>

              <td className="px-5 py-4 text-sm">
                Limpieza
              </td>

              <td className="px-5 py-4 text-sm">
                Juan Pérez
              </td>

              <td className="px-5 py-4 text-sm">
                Efectivo
              </td>

              <td className="px-5 py-4 text-sm font-bold">
                $12.500
              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver gasto"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>


            {/* GASTO 5 */}
            <tr className="border-t border-[var(--wa-border)]">

              <td className="px-5 py-4 text-sm">
                31/08/2026
              </td>

              <td className="px-5 py-4 text-sm">
                04:10 PM
              </td>

              <td className="px-5 py-4 text-sm font-medium">
                Papelería
              </td>

              <td className="px-5 py-4 text-sm">
                Oficina
              </td>

              <td className="px-5 py-4 text-sm">
                María Gómez
              </td>

              <td className="px-5 py-4 text-sm">
                Efectivo
              </td>

              <td className="px-5 py-4 text-sm font-bold">
                $17.000
              </td>

              <td className="px-5 py-4 text-right">

                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--wa-border)] transition hover:bg-[var(--wa-surface-low)]"
                  title="Ver gasto"
                >
                  <span className="material-symbols-outlined text-[1.1rem]">
                    visibility
                  </span>
                </button>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </section>
)}

            </>
          )}


          {/* =========================================================
              FACTURAS
          ========================================================== */}

          {activeItem === 'Facturas' && (
            <section className="m-6">

              {/* ENCABEZADO */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-[1.5rem] font-bold text-[var(--wa-text)]">Facturas</h1>
                  <p className="mt-1 text-[0.9rem] text-[var(--wa-text-muted)]">
                    Consulta, emite y gestiona las facturas del restaurante.
                  </p>
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--wa-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--wa-primary-dark)]"
                >
                  <span className="material-symbols-outlined text-[1.2rem]">add</span>
                  Nueva factura
                </button>
              </div>

              {/* RESUMEN */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Total facturado</span>
                    <span className="material-symbols-outlined text-[1.4rem]">receipt_long</span>
                  </div>
                  <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">$3.245.000</p>
                  <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Este mes</p>
                </div>

                <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Pagadas</span>
                    <span className="material-symbols-outlined text-[1.4rem] text-[var(--wa-tertiary)]">check_circle</span>
                  </div>
                  <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">142</p>
                  <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Facturas cobradas</p>
                </div>

                <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Pendientes</span>
                    <span className="material-symbols-outlined text-[1.4rem] text-[var(--wa-secondary)]">schedule</span>
                  </div>
                  <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">6</p>
                  <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Por cobrar</p>
                </div>

                <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Anuladas</span>
                    <span className="material-symbols-outlined text-[1.4rem] text-[var(--wa-primary)]">cancel</span>
                  </div>
                  <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">2</p>
                  <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Este mes</p>
                </div>
              </div>

              {/* TABLA */}
              <div className="rounded-[14px] border border-[var(--wa-border)] bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-[var(--wa-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-[1.05rem] font-bold text-[var(--wa-text)]">Facturas emitidas</h2>
                    <p className="mt-1 text-sm text-[var(--wa-text-muted)]">Historial completo de facturación.</p>
                  </div>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--wa-surface-low)]"
                  >
                    <span className="material-symbols-outlined text-[1.1rem]">filter_list</span>
                    Filtrar
                  </button>
                </div>

                {cargandoFacturas ? (
                  <p className="p-5 text-[0.85rem] text-[var(--wa-text-muted)]">Cargando...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead>
                        <tr className="bg-[var(--wa-surface-low)] text-left text-sm">
                          <th className="px-5 py-3 font-semibold">#</th>
                          <th className="px-5 py-3 font-semibold">Cliente</th>
                          <th className="px-5 py-3 font-semibold">Mesero</th>
                          <th className="px-5 py-3 font-semibold">Mesa</th>
                          <th className="px-5 py-3 font-semibold">Fecha</th>
                          <th className="px-5 py-3 font-semibold">Total</th>
                          <th className="px-5 py-3 font-semibold">Estado</th>
                          <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facturas.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-[var(--wa-text-muted)]">
                              Sin facturas registradas
                            </td>
                          </tr>
                        ) : (
                          facturas.map(f => (
                            <tr key={f.id_factura} className="border-t border-[var(--wa-border)]">
                              <td className="px-5 py-4 font-medium">{f.numero}</td>
                              <td className="px-5 py-4">{f.nombre_cliente ?? f.id_cliente ?? '—'}</td>
                              <td className="px-5 py-4">{f.nombre_mesero ?? f.id_mesero ?? '—'}</td>
                              <td className="px-5 py-4">{f.Mesa_num ?? '—'}</td>
                              <td className="px-5 py-4">{f.fecha}</td>
                              <td className="px-5 py-4 font-semibold">
                                ${f.total.toLocaleString('es-CO')}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    f.estado === 'PAGADA'
                                      ? 'bg-[#dcfce7] text-[#166534]'
                                      : f.estado === 'PENDIENTE'
                                      ? 'bg-[var(--wa-secondary-light)] text-[var(--wa-secondary)]'
                                      : 'bg-[var(--wa-surface-high)] text-[var(--wa-text-muted)]'
                                  }`}
                                >
                                  {f.estado}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    className="rounded-[10px] border border-[var(--wa-border)] bg-[var(--wa-surface-low)] px-3.5 py-1.5 text-[0.8rem] font-semibold text-[var(--wa-text-muted)] transition hover:bg-[var(--wa-surface-high)]"
                                  >
                                    Ver
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-[10px] border border-[var(--wa-primary)] bg-transparent px-3.5 py-1.5 text-[0.8rem] font-semibold text-[var(--wa-primary)] disabled:opacity-50"
                                    disabled={f.estado === 'ANULADA'}
                                  >
                                    Anular
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
              </div>

            </section>
          )}

        </div>

      </main>

    </div>
  )
}

export default Mesero