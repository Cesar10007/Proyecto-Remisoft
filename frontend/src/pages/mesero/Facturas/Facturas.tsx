import { useState, useEffect } from 'react'
import api from '../../../api/axios'
import Modal from '../../../components/common/Modal'
import './Facturas.css'
 
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
 
const facturaVacia = { id_cliente: '', Mesa_num: '', total: '' }
 
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
 
interface FacturasProps {
  nombreUsuario: string
}
 
function Facturas({ nombreUsuario }: FacturasProps) {
  const [facturas, setFacturas] = useState<Factura[]>([])
  const [cargando, setCargando] = useState(false)
 
  const [modalDetalle, setModalDetalle] = useState<{
    open: boolean
    title: string
    rows: { label: string; value: string }[]
  }>({ open: false, title: '', rows: [] })
 
  const [modalFactura, setModalFactura] = useState(false)
  const [nuevaFactura, setNuevaFactura] = useState(facturaVacia)
  const [errorFactura, setErrorFactura] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
 
  const [openFiltro, setOpenFiltro] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('')
 
  const cargarFacturas = () => {
    setCargando(true)
    api
      .get('/facturas')
      .then(r => setFacturas(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }
 
  useEffect(() => {
    cargarFacturas()
  }, [])
 
  const facturasFiltradas = facturas.filter(f =>
    filtroEstado ? f.estado === filtroEstado : true
  )
 
  const abrirDetalle = (title: string, rows: { label: string; value: string }[]) => {
    setModalDetalle({ open: true, title, rows })
  }
 
  const abrirCrearFactura = () => {
    setNuevaFactura(facturaVacia)
    setErrorFactura(null)
    setModalFactura(true)
  }
 
  const guardarFactura = async () => {
    if (!nuevaFactura.total) {
      setErrorFactura('El total es obligatorio')
      return
    }
 
    setGuardando(true)
    setErrorFactura(null)
 
    try {
      const payload = {
        id_cliente: nuevaFactura.id_cliente ? Number(nuevaFactura.id_cliente) : null,
        Mesa_num: nuevaFactura.Mesa_num ? Number(nuevaFactura.Mesa_num) : null,
        total: Number(nuevaFactura.total),
        estado: 'PENDIENTE',
      }
 
      await api.post('/facturas', payload)
      setModalFactura(false)
      cargarFacturas()
    } catch (err: any) {
      setErrorFactura(err.response?.data?.message ?? 'Error al guardar la factura')
    } finally {
      setGuardando(false)
    }
  }
 
  const anularFactura = async (f: Factura) => {
    if (!confirm(`¿Deseas anular la factura ${f.numero}?`)) return
 
    try {
      await api.put(`/facturas/${f.id_factura}`, { ...f, estado: 'ANULADA' })
      cargarFacturas()
    } catch {
      alert('Error al anular la factura')
    }
  }
 
  return (
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
          onClick={abrirCrearFactura}
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
          <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            ${facturas.reduce((acc, f) => acc + f.total, 0).toLocaleString('es-CO')}
          </p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Este mes</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Pagadas</span>
            <span className="material-symbols-outlined text-[1.4rem] text-[var(--wa-tertiary)]">check_circle</span>
          </div>
          <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            {facturas.filter(f => f.estado === 'PAGADA').length}
          </p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Facturas cobradas</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Pendientes</span>
            <span className="material-symbols-outlined text-[1.4rem] text-[var(--wa-secondary)]">schedule</span>
          </div>
          <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            {facturas.filter(f => f.estado === 'PENDIENTE').length}
          </p>
          <p className="mt-1 text-[0.78rem] text-[var(--wa-text-muted)]">Por cobrar</p>
        </div>
 
        <div className="rounded-[14px] border border-[var(--wa-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[0.82rem] font-semibold text-[var(--wa-text-muted)]">Anuladas</span>
            <span className="material-symbols-outlined text-[1.4rem] text-[var(--wa-primary)]">cancel</span>
          </div>
          <p className="text-[1.5rem] font-bold text-[var(--wa-text)]">
            {facturas.filter(f => f.estado === 'ANULADA').length}
          </p>
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
 
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenFiltro(!openFiltro)}
              className="flex items-center justify-center gap-2 rounded-[9px] border border-[var(--wa-border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--wa-surface-low)]"
            >
              <span className="material-symbols-outlined text-[1.1rem]">filter_list</span>
              Filtrar
            </button>
 
            {openFiltro && (
              <div className="absolute right-0 top-[calc(100%+4px)] z-10 w-44 rounded-[10px] border border-[var(--wa-border)] bg-white p-2 shadow-lg">
                {['Todos', 'PAGADA', 'PENDIENTE', 'ANULADA'].map(op => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => {
                      setFiltroEstado(op === 'Todos' ? '' : op)
                      setOpenFiltro(false)
                    }}
                    className={`block w-full rounded-[8px] px-3 py-2 text-left text-sm hover:bg-[var(--wa-surface-low)] ${
                      (filtroEstado || 'Todos') === op ? 'font-bold text-[var(--wa-primary)]' : ''
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
 
        {cargando ? (
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
                {facturasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[var(--wa-text-muted)]">
                      Sin facturas registradas
                    </td>
                  </tr>
                ) : (
                  facturasFiltradas.map(f => (
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
                            onClick={() =>
                              abrirDetalle(`Factura ${f.numero}`, [
                                { label: 'Cliente', value: String(f.nombre_cliente ?? f.id_cliente ?? '—') },
                                { label: 'Mesero', value: String(f.nombre_mesero ?? f.id_mesero ?? '—') },
                                { label: 'Mesa', value: String(f.Mesa_num ?? '—') },
                                { label: 'Fecha', value: f.fecha },
                                { label: 'Total', value: `$${f.total.toLocaleString('es-CO')}` },
                                { label: 'Estado', value: f.estado },
                              ])
                            }
                            className="rounded-[10px] border border-[var(--wa-border)] bg-[var(--wa-surface-low)] px-3.5 py-1.5 text-[0.8rem] font-semibold text-[var(--wa-text-muted)] transition hover:bg-[var(--wa-surface-high)]"
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={() => anularFactura(f)}
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
 
      {/* MODAL: DETALLE */}
      <Modal isOpen={modalDetalle.open} onClose={() => setModalDetalle(d => ({ ...d, open: false }))}>
        <div className="px-6 pb-6">
          <h3 className="mb-5 font-bold">{modalDetalle.title}</h3>
          <div className="flex flex-col gap-3">
            {modalDetalle.rows.map((r, i) => (
              <div key={i} className="flex items-center justify-between border-b border-[var(--borde)] pb-2">
                <span className="text-[0.85rem] font-semibold text-[var(--texto-muted)]">{r.label}</span>
                <span className="text-[0.9rem] font-bold text-[var(--texto)]">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <button
              className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
              onClick={() => setModalDetalle(d => ({ ...d, open: false }))}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
 
      {/* MODAL: NUEVA FACTURA */}
      <Modal isOpen={modalFactura} onClose={() => setModalFactura(false)}>
        <div className="px-6 pb-6">
          <h3 className="mb-5 font-bold">Nueva factura</h3>
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">ID Cliente</label>
              <input
                type="number"
                placeholder="Opcional"
                value={nuevaFactura.id_cliente}
                onChange={e => setNuevaFactura(prev => ({ ...prev, id_cliente: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Número de mesa</label>
              <input
                type="number"
                placeholder="Opcional"
                value={nuevaFactura.Mesa_num}
                onChange={e => setNuevaFactura(prev => ({ ...prev, Mesa_num: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Total *</label>
              <input
                type="number"
                placeholder="Ej: 142500"
                value={nuevaFactura.total}
                onChange={e => setNuevaFactura(prev => ({ ...prev, total: e.target.value }))}
                style={inputStyle}
              />
            </div>
            {errorFactura && (
              <p className="rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">
                {errorFactura}
              </p>
            )}
            <div className="mt-2 flex justify-end gap-3">
              <button
                className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
                onClick={() => setModalFactura(false)}
              >
                Cancelar
              </button>
              <button
                className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 text-[0.875rem] font-semibold text-white"
                onClick={guardarFactura}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Crear factura'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
 
    </section>
  )
}
 
export default Facturas