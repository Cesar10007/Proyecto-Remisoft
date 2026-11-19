import { useState } from 'react'
import api from '../../../api/axios'
import Button from '../../../components/common/Button'
import Modal from '../../../components/common/Modal'
import { notificarEstado, type Sistema } from '../../../api/sistema'
import { useConsulta } from '../../../hook/useConsulta'
import { mensajeError } from '../../../utils/mensajeError'

type Pendiente = { tipo: string; total: number; ejemplo: number }
const etiquetas: Record<string, string> = { pedidos: 'Pedidos sin finalizar', mesas: 'Mesas con atención abierta', turnos: 'Turnos sin arqueo de cierre', domicilios: 'Domicilios por completar', facturas: 'Facturas pendientes de cobro', pagos: 'Pagos en proceso', asientos: 'Pagos sin asiento de caja conciliado' }

export default function CierreTotal({ cerrar }: { cerrar: () => void }) {
  const revision = useConsulta<Sistema & { pendientes: Pendiente[] }>('/sistema/revision', 15000)
  const [enviando, setEnviando] = useState(false), [error, setError] = useState('')
  async function confirmar() {
    if (enviando || !revision.data || revision.data.pendientes.length) return
    setEnviando(true); setError('')
    try {
      await api.post('/sistema/cerrar', { version_sistema: revision.data.version_sistema })
      notificarEstado(); cerrar()
    } catch (e) { setError(mensajeError(e)); await revision.cargar() }
    finally { setEnviando(false) }
  }
  const datos = revision.data
  return <Modal title="Hacer cierre total" onClose={cerrar} busy={enviando}>
    <p>Se revisarán los pedidos, mesas, domicilios, cobros y turnos de esta sede. El cierre suspende la operación de todo su personal; no cierra turnos automáticamente.</p>
    <div className="my-4" aria-live="polite">
      {revision.error ? <p role="alert">{revision.error}</p> : !datos ? <p>Revisando pendientes…</p> : datos.pendientes.length ? <>
        <h3 className="font-bold">Pendientes que impiden el cierre</h3>
        <ul className="my-2 grid gap-2">{datos.pendientes.map(p => <li key={p.tipo}>{etiquetas[p.tipo]}: <strong>{p.total}</strong> · {p.total > 1 ? 'Primer registro' : 'Registro'} #{p.ejemplo}</li>)}</ul>
        <p>Completa estos registros y vuelve a revisar.</p>
      </> : <p>No hay pendientes. Puedes confirmar el cierre total.</p>}
      {error && <p role="alert">{error}</p>}
    </div>
    <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={enviando} onClick={revision.cargar}>Volver a revisar</Button>
      <Button disabled={enviando || revision.cargando || !!revision.error || !datos?.sistema_abierto || !!datos.pendientes.length} onClick={confirmar}>{enviando ? 'Cerrando…' : 'Confirmar cierre total'}</Button></div>
  </Modal>
}
