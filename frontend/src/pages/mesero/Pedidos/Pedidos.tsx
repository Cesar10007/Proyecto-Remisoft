import { useState, useEffect } from 'react'
import api from '../../../api/axios'
import Modal from '../../../components/common/Modal'
import './Pedidos.css'
 
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
 
const pedidoVacio = {
  id_cliente: '',
  id_mesero: '',
  estado: 'ABIERTO',
  Tipo_pedido: 'MESA',
  Mesa_num: '',
  notas: '',
}
 
function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(false)
  const [modal, setModal] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [pedidoActual, setPedidoActual] = useState(pedidoVacio)
  const [idEditando, setIdEditando] = useState<number | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
 
  const cargarPedidos = () => {
    setCargando(true)
    api
      .get('/pedidos')
      .then(r => setPedidos(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }
 
  useEffect(() => {
    cargarPedidos()
  }, [])
 
  const abrirCrear = () => {
    setModoEdicion(false)
    setPedidoActual(pedidoVacio)
    setIdEditando(null)
    setError(null)
    setModal(true)
  }
 
  const abrirEditar = (p: Pedido) => {
    setModoEdicion(true)
    setPedidoActual({
      id_cliente: p.id_cliente?.toString() ?? '',
      id_mesero: p.id_mesero?.toString() ?? '',
      estado: p.estado,
      Tipo_pedido: p.Tipo_pedido,
      Mesa_num: p.Mesa_num?.toString() ?? '',
      notas: p.notas ?? '',
    })
    setIdEditando(p.id_pedido)
    setError(null)
    setModal(true)
  }
 
  const guardar = async () => {
    if (!pedidoActual.Tipo_pedido.trim()) {
      setError('El tipo de pedido es obligatorio')
      return
    }
 
    setGuardando(true)
    setError(null)
 
    try {
      const payload = {
        ...pedidoActual,
        id_cliente: pedidoActual.id_cliente ? Number(pedidoActual.id_cliente) : null,
        id_mesero: pedidoActual.id_mesero ? Number(pedidoActual.id_mesero) : null,
        Mesa_num: pedidoActual.Mesa_num ? Number(pedidoActual.Mesa_num) : null,
      }
 
      modoEdicion && idEditando
        ? await api.put(`/pedidos/${idEditando}`, payload)
        : await api.post('/pedidos', payload)
 
      setModal(false)
      cargarPedidos()
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }
 
  const cancelar = async (id: number) => {
    if (!confirm('¿Deseas cancelar este pedido?')) return
    try {
      await api.delete(`/pedidos/${id}`)
      cargarPedidos()
    } catch {
      alert('Error al cancelar')
    }
  }
 
  return (
    <section className="m-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[1rem] font-bold">Gestión de Pedidos</h3>
        <button
          className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 font-['DM_Sans'] text-[0.875rem] font-semibold text-white"
          onClick={abrirCrear}
        >
          + Nuevo Pedido
        </button>
      </div>
 
      {cargando ? (
        <p className="text-[0.85rem] text-[var(--texto-muted)]">Cargando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.875rem]">
            <thead>
              <tr className="border-b border-[var(--borde)]">
                {['#', 'Cliente', 'Mesero', 'Tipo', 'Mesa', 'Estado', 'Notas', 'Acciones'].map(h => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left font-semibold text-[var(--texto-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[var(--texto-muted)]">
                    Sin pedidos registrados
                  </td>
                </tr>
              ) : (
                pedidos.map(p => (
                  <tr key={p.id_pedido} className="border-b border-[var(--borde)]">
                    <td className="px-3 py-2.5 font-semibold">{p.id_pedido}</td>
                    <td className="px-3 py-2.5">{p.nombre_cliente ?? p.id_cliente ?? '—'}</td>
                    <td className="px-3 py-2.5">{p.nombre_mesero ?? p.id_mesero ?? '—'}</td>
                    <td className="px-3 py-2.5">{p.Tipo_pedido}</td>
                    <td className="px-3 py-2.5">{p.Mesa_num ?? '—'}</td>
                    <td
                      className={`px-3 py-2.5 ${
                        p.estado === 'ABIERTO' ? 'text-[var(--verde)]' : p.estado === 'CANCELADO' ? 'text-[var(--rojo)]' : 'text-[var(--texto-muted)]'
                      }`}
                    >
                      {p.estado}
                    </td>
                    <td className="max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2.5">{p.notas || '—'}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2">
                        <button
                          className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3.5 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]"
                          onClick={() => abrirEditar(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="w-auto rounded-[10px] border border-[var(--rojo)] bg-transparent px-3.5 py-1.5 text-[0.8rem] font-semibold text-[var(--rojo)] disabled:opacity-50"
                          onClick={() => cancelar(p.id_pedido)}
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
 
      <Modal isOpen={modal} onClose={() => setModal(false)}>
        <div className="px-6 pb-6">
          <h3 className="mb-5 font-bold">{modoEdicion ? 'Editar Pedido' : 'Nuevo Pedido'}</h3>
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">ID Cliente</label>
              <input
                type="number"
                placeholder="Opcional"
                value={pedidoActual.id_cliente}
                onChange={e => setPedidoActual(prev => ({ ...prev, id_cliente: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
              />
            </div>
 
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">ID Mesero</label>
              <input
                type="number"
                placeholder="Opcional"
                value={pedidoActual.id_mesero}
                onChange={e => setPedidoActual(prev => ({ ...prev, id_mesero: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
              />
            </div>
 
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Tipo de Pedido *</label>
              <select
                value={pedidoActual.Tipo_pedido}
                onChange={e => setPedidoActual(prev => ({ ...prev, Tipo_pedido: e.target.value }))}
                className="w-full cursor-pointer rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
              >
                <option value="MESA">MESA</option>
                <option value="DOMICILIO">DOMICILIO</option>
                <option value="LLEVAR">LLEVAR</option>
              </select>
            </div>
 
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Número de Mesa</label>
              <input
                type="number"
                placeholder="Opcional"
                value={pedidoActual.Mesa_num}
                onChange={e => setPedidoActual(prev => ({ ...prev, Mesa_num: e.target.value }))}
                className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
              />
            </div>
 
            <div>
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Estado</label>
              <select
                value={pedidoActual.estado}
                onChange={e => setPedidoActual(prev => ({ ...prev, estado: e.target.value }))}
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
              <label className="mb-1 block text-[0.8rem] font-semibold text-[var(--texto-muted)]">Notas</label>
              <textarea
                placeholder="Indicaciones especiales..."
                value={pedidoActual.notas}
                onChange={e => setPedidoActual(prev => ({ ...prev, notas: e.target.value }))}
                className="min-h-[80px] w-full resize-y rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"
              />
            </div>
 
            {error && (
              <p className="rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-[0.82rem] text-[var(--rojo)]">{error}</p>
            )}
 
            <div className="mt-2 flex justify-end gap-3">
              <button
                className="w-auto rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-5 py-2 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
                onClick={() => setModal(false)}
              >
                Cancelar
              </button>
              <button
                className="w-auto rounded-[10px] bg-[var(--rojo)] px-5 py-2 text-[0.875rem] font-semibold text-white"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Crear Pedido'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </section>
  )
}
 
export default Pedidos