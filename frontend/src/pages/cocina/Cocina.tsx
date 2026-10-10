import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import type { RootState } from '../../store/store'
import './Cocina.css'

type EstadoItem = 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO'

interface ItemComanda {
  id_detalle: number
  nombre: string
  cantidad: number
  estado: EstadoItem
}

interface Comanda {
  id_pedido: number
  mesa: number | null
  tipo_pedido: string
  notas: string
  fecha_hora: string
  nombre_mesero: string | null
  items: ItemComanda[]
}

interface TarjetaItem {
  comanda: Comanda
  item: ItemComanda
}

const COLUMNAS: { estado: EstadoItem; titulo: string; accion: string | null; siguiente: EstadoItem | null }[] = [
  { estado: 'PENDIENTE', titulo: 'Pendientes', accion: 'Empezar', siguiente: 'PREPARANDO' },
  { estado: 'PREPARANDO', titulo: 'En preparación', accion: 'Marcar listo', siguiente: 'LISTO' },
  { estado: 'LISTO', titulo: 'Listos para servir', accion: 'Entregado', siguiente: 'ENTREGADO' },
]

const INTERVALO_ACTUALIZACION_MS = 8000

function minutosDesde(fecha: string) {
  const diff = Date.now() - new Date(fecha).getTime()
  return Math.max(0, Math.floor(diff / 60000))
}

function mensajeError(err: unknown, fallback: string) {
  const respuesta = (err as { response?: { data?: { message?: string } } })?.response?.data
  return respuesta?.message ?? fallback
}

export default function Cocina() {
  const rol = useSelector((state: RootState) => state.auth.rol)

  const [comandas, setComandas] = useState<Comanda[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<number | null>(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)

  const cargarComandas = useCallback(async () => {
    try {
      const { data } = await api.get<Comanda[]>('/cocina/comandas')
      setComandas(data)
      setUltimaActualizacion(new Date())
      setError(null)
    } catch (err) {
      setError(mensajeError(err, 'No fue posible cargar las comandas.'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarComandas()
    const intervalo = setInterval(cargarComandas, INTERVALO_ACTUALIZACION_MS)
    return () => clearInterval(intervalo)
  }, [cargarComandas])

  // Aplana las comandas en tarjetas por ítem, para mostrarlas en columnas por estado.
  const tarjetas: TarjetaItem[] = comandas.flatMap((comanda) =>
    comanda.items.map((item) => ({ comanda, item })),
  )

  async function avanzar(item: ItemComanda, siguiente: EstadoItem) {
    setOcupado(item.id_detalle)
    try {
      await api.patch(`/cocina/items/${item.id_detalle}/avanzar`, { estado_item: siguiente })
      await cargarComandas()
    } catch (err) {
      setError(mensajeError(err, 'No fue posible actualizar el ítem.'))
    } finally {
      setOcupado(null)
    }
  }

  return (
    <div className="cocina">
      <header className="cocina__header">
        <div>
          <h1>Tablero Cocina</h1>
          <p>
            {tarjetas.length} ítem{tarjetas.length === 1 ? '' : 's'} en curso
            {ultimaActualizacion &&
              ` · actualizado ${ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
          </p>
        </div>
        <div className="cocina__header-acciones">
          <button type="button" className="cocina__btn cocina__btn--ghost" onClick={cargarComandas}>
            <span className="material-symbols-outlined">refresh</span> Actualizar
          </button>
          {(rol === 'GERENTE' || rol === 'SUPERADMIN') && (
            <Link className="cocina__btn cocina__btn--ghost" to="/gerente">Volver al panel</Link>
          )}
        </div>
      </header>

      {error && <div className="cocina__alerta">{error}</div>}

      {cargando && <p className="cocina__vacio">Cargando comandas…</p>}

      {!cargando && tarjetas.length === 0 && (
        <div className="cocina__vacio cocina__vacio--grande">
          <span className="material-symbols-outlined">soup_kitchen</span>
          <p>No hay comandas en curso.</p>
        </div>
      )}

      {!cargando && tarjetas.length > 0 && (
        <div className="cocina__columnas">
          {COLUMNAS.map((col) => {
            const enColumna = tarjetas.filter((t) => t.item.estado === col.estado)
            return (
              <section key={col.estado} className="cocina__columna" aria-label={col.titulo}>
                <h2>
                  {col.titulo} <span className="cocina__contador">{enColumna.length}</span>
                </h2>

                {enColumna.length === 0 && <p className="cocina__vacio">Sin ítems.</p>}

                {enColumna.map(({ comanda, item }) => (
                  <article
                    key={item.id_detalle}
                    className={`cocina__tarjeta cocina__tarjeta--${col.estado.toLowerCase()}`}
                  >
                    <div className="cocina__tarjeta-top">
                      <strong>{comanda.mesa ? `Mesa ${comanda.mesa}` : comanda.tipo_pedido || 'Pedido'}</strong>
                      <span className="cocina__tiempo">{minutosDesde(comanda.fecha_hora)} min</span>
                    </div>
                    <div className="cocina__item">
                      <span className="cocina__cantidad">{item.cantidad}×</span> {item.nombre}
                    </div>
                    <div className="cocina__meta">
                      Pedido #{comanda.id_pedido}
                      {comanda.nombre_mesero ? ` · ${comanda.nombre_mesero}` : ''}
                    </div>
                    {comanda.notas && <div className="cocina__notas">Nota: {comanda.notas}</div>}
                    {col.siguiente && col.accion && (
                      <button
                        type="button"
                        className="cocina__btn cocina__btn--primario"
                        disabled={ocupado === item.id_detalle}
                        onClick={() => avanzar(item, col.siguiente as EstadoItem)}
                      >
                        {col.accion}
                      </button>
                    )}
                  </article>
                ))}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
