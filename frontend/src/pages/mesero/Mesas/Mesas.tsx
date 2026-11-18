import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChefHat, ShoppingCart, Utensils } from 'lucide-react'
import { Vacio } from '../Elementos'
import { mesaN, normalizar, type Salon } from '../modelo'
import { type Consumo } from './lectura'
import TarjetaMesa from './TarjetaMesa'
import { formatCOP } from '../utils'
import { tiempoTranscurrido } from '../../../utils/tiempo'
import './Mesas.css'

type AbrirMesa = (numero: number, pedido?: number) => void

function Cocina({ pedidos, abrir }: { pedidos: Consumo[]; abrir: AbrirMesa }) {
  const orden = ['LISTO', 'PREPARANDO', 'PENDIENTE']
  const platos = pedidos
    .flatMap((p) => p.items.filter((i) => orden.includes(i.estado)).map((i) => ({ p, i })))
    .sort((a, b) => orden.indexOf(a.i.estado) - orden.indexOf(b.i.estado))
  return (
    <aside className="wa-comedor-cocina">
      <div className="wa-cocina-titulo">
        <h2>Cocina</h2>
        <Utensils size={21} aria-hidden="true" />
      </div>
      {!platos.length ? (
        <Vacio titulo="Sin platos en cocina">Aquí verás el avance de tus pedidos.</Vacio>
      ) : (
        <div className="wa-comedor-feed">
          {platos.map(({ p, i }) => (
            <button
              key={i.id_detalle}
              className={i.estado === 'LISTO' ? 'listo' : ''}
              onClick={() => abrir(p.mesa, p.id_pedido)}
            >
              <span>
                <b>
                  Mesa {mesaN(p.mesa)} ·{' '}
                  {i.estado === 'LISTO' ? 'Lista' : i.estado === 'PREPARANDO' ? 'Preparando' : 'Nueva orden'}
                </b>
                <small>{tiempoTranscurrido(p.fecha_hora)}</small>
              </span>
              <strong>
                {i.cantidad} × {i.nombre}
              </strong>
              <small>Pedido #{p.id_pedido}</small>
            </button>
          ))}
        </div>
      )}
      <Link className="sl-btn" to="/cocina" aria-label="Cocina">
        <ChefHat size={16} /> Tablero de cocina <ArrowRight size={14} />
      </Link>
    </aside>
  )
}

export default function Mesas({
  salon,
  buscar,
  abrir,
  venta,
  permiteVenta,
}: {
  salon: Salon
  buscar: string
  abrir: AbrirMesa
  venta: () => void
  permiteVenta: boolean
}) {
  const [filtro, setFiltro] = useState('Todas')
  const ocupadas = salon.mesas.filter((m) => m.ocupada).length
  const cuentas = salon.mesas.flatMap((m) => m.cuentas)
  const consulta = normalizar(buscar)
  const visibles = salon.mesas.filter(
    (m) =>
      (filtro === 'Todas' || (filtro === 'Disponibles' ? !m.ocupada : m.ocupada)) &&
      normalizar(
        `Mesa ${mesaN(m.numero)} Mesa ${m.numero} ${m.cuentas.map((p) => `#${p.id_pedido} ${p.items.map((i) => i.nombre).join(' ')}`).join(' ')}`,
      ).includes(consulta),
  )
  return (
    <div className="wa-comedor">
      <section className="wa-comedor-stats" aria-label="Resumen del comedor">
        <article>
          <h2>Mesas activas</h2>
          <div>
            <strong>{mesaN(ocupadas)}</strong>
            <small>/ {salon.mesas.length} total</small>
          </div>
        </article>
        <article className="wa-stat-pedidos">
          <h2>Pedidos en curso</h2>
          <strong>{cuentas.length}</strong>
        </article>
        <article title="Subtotal de los pedidos abiertos del comedor, antes de IVA">
          <h2>En mesas</h2>
          <strong>{formatCOP(cuentas.reduce((n, p) => n + p.subtotal, 0))}</strong>
        </article>
        <button className="wa-registrar" disabled={!permiteVenta} onClick={venta}>
          <ShoppingCart size={26} />
          Registrar Venta
        </button>
      </section>
      <div className="wa-comedor-layout">
        <section aria-labelledby="sala-comedor">
          <header className="wa-comedor-herramientas">
            <div>
              <h2 id="sala-comedor">Sala de Comedor Principal</h2>
              <p className="wa-comedor-ayuda">Haz clic en una mesa para ver su estado y sus pedidos.</p>
            </div>
            <div className="wa-leyenda" role="group" aria-label="Filtrar mesas">
              {['Disponibles', 'Ocupadas'].map((f) => (
                <button
                  key={f}
                  aria-pressed={filtro === f}
                  onClick={() => setFiltro(filtro === f ? 'Todas' : f)}
                >
                  <i />
                  {f === 'Disponibles' ? 'Disponible' : 'Ocupada'}
                </button>
              ))}
            </div>
          </header>
          {visibles.length ? (
            <div className="wa-table-grid">
              {visibles.map((m) => (
                <TarjetaMesa key={m.numero} mesa={m} abrir={abrir} />
              ))}
            </div>
          ) : (
            <Vacio titulo={salon.mesas.length ? 'Sin coincidencias' : 'No hay mesas registradas'}>
              {salon.mesas.length
                ? 'Cambia la búsqueda o el filtro.'
                : 'Solicita a administración que registre las mesas del salón.'}
            </Vacio>
          )}
        </section>
        <Cocina pedidos={cuentas} abrir={abrir} />
      </div>
    </div>
  )
}
