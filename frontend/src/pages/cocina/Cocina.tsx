import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, ChefHat, ClipboardList, Clock, History, RefreshCw } from 'lucide-react'
import api from '../../api/axios'
import Button from '../../components/common/Button'
import type { RootState } from '../../store/store'
import { useAuth } from '../../store/hooks'
import { tiempoTranscurrido } from '../../utils/tiempo'
import { mensajeError } from '../../utils/mensajeError'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import './Cocina.css'

type EstadoItem = 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO'
type Vista = 'comandas' | 'historial'

interface ItemComanda {
  id_detalle: number
  nombre: string
  nota: string
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

const COLUMNAS: { estado: EstadoItem; titulo: string; accion: string; siguiente: EstadoItem; clase: string }[] = [
  { estado: 'PENDIENTE', titulo: 'Pendientes', accion: 'Empezar', siguiente: 'PREPARANDO', clase: 'pendiente' },
  { estado: 'PREPARANDO', titulo: 'En preparación', accion: 'Marcar listo', siguiente: 'LISTO', clase: 'preparando' },
  { estado: 'LISTO', titulo: 'Listos para servir', accion: 'Entregado', siguiente: 'ENTREGADO', clase: 'listo' },
]

const INTERVALO_MS = 8000

function fechaCorta(fecha: string) {
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function Cocina() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const pedidoSenalado = (ubicacion.state as { pedido?: number } | null)?.pedido ?? null
  const [resaltado, setResaltado] = useState<number | null>(pedidoSenalado)
  const rol = useSelector((state: RootState) => state.auth.rol)
  const nombreCompleto = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Cocina'

  const [vista, setVista] = useState<Vista>('comandas')
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState<number | null>(null)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)
  const [historial, setHistorial] = useState<Comanda[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [errorHistorial, setErrorHistorial] = useState('')

  const cargarComandas = useCallback(async () => {
    try {
      const { data } = await api.get<Comanda[]>('/cocina/comandas')
      setComandas(Array.isArray(data) ? data : [])
      setUltimaActualizacion(new Date())
      setError('')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }, [])

  const cargarHistorial = useCallback(async () => {
    setCargandoHistorial(true)
    try {
      const { data } = await api.get<Comanda[]>('/cocina/historial')
      setHistorial(Array.isArray(data) ? data : [])
      setErrorHistorial('')
    } catch (err) {
      setErrorHistorial(mensajeError(err))
    } finally {
      setCargandoHistorial(false)
    }
  }, [])

  // El tablero se refresca solo, pero únicamente mientras se está viendo.
  useEffect(() => {
    if (vista !== 'comandas') return
    cargarComandas()
    const intervalo = setInterval(cargarComandas, INTERVALO_MS)
    return () => clearInterval(intervalo)
  }, [vista, cargarComandas])

  useEffect(() => {
    if (vista === 'historial') cargarHistorial()
  }, [vista, cargarHistorial])

  // Cuando se llega desde una notificación: trae el pedido a la vista y lo deja señalado.
  useEffect(() => {
    if (pedidoSenalado === null) return
    setResaltado(pedidoSenalado)
    const desplazar = setTimeout(() => {
      document
        .querySelector(`[data-pedido="${pedidoSenalado}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 250)
    const limpiar = setTimeout(() => setResaltado(null), 6000)
    return () => {
      clearTimeout(desplazar)
      clearTimeout(limpiar)
    }
  }, [pedidoSenalado, ubicacion.key])

  // Aplana las comandas en tarjetas por ítem, para mostrarlas en columnas por estado.
  const tarjetas: TarjetaItem[] = comandas.flatMap((comanda) =>
    comanda.items
      .filter((item) => item.estado !== 'ENTREGADO')
      .map((item) => ({ comanda, item })),
  )

  async function avanzar(item: ItemComanda, siguiente: EstadoItem) {
    if (ocupado !== null) return
    setOcupado(item.id_detalle)
    try {
      await api.patch(`/cocina/items/${item.id_detalle}/avanzar`, { estado_item: siguiente })
      await cargarComandas()
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setOcupado(null)
    }
  }

  const actualizar = () => (vista === 'comandas' ? cargarComandas() : cargarHistorial())

  const enCurso = tarjetas.length
  const subtitulo =
    vista === 'comandas'
      ? `${enCurso} ítem${enCurso === 1 ? '' : 's'} en curso${
          ultimaActualizacion
            ? ` · actualizado ${ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
            : ''
        }`
      : `${historial.length} pedido${historial.length === 1 ? '' : 's'} con platos entregados`

  return (
    <div className="ck-app">
      <Sidebar
        subtitulo="Cocina"
        colapsable
        menuItems={[
          { icon: <ClipboardList size={20} />, label: 'Comandas' },
          { icon: <History size={20} />, label: 'Historial' },
        ]}
        vistaActual={vista}
        onNavigate={(v) => {
          if (v === 'comandas' || v === 'historial') setVista(v)
        }}
        onLogout={() => {
          logout()
          navigate('/', { replace: true })
        }}
        footer={
          rol === 'GERENTE' || rol === 'SUPERADMIN' ? (
            <Link
              className="ck-btn"
              aria-description="Regresa a tu panel de administración."
              to={rol === 'SUPERADMIN' ? '/superadmin' : '/gerente'}
            >
              Volver al panel
            </Link>
          ) : undefined
        }
      />

      <main className="ck-main">
        <div className="ck-head">
          <Header
            seccionActiva={vista === 'comandas' ? 'Tablero Cocina' : 'Historial de cocina'}
            nombreUsuario={nombreCompleto}
            subtitulo={subtitulo}
            acciones={
              <>
                {rol === 'MESERO' && (
                  <Link className="ck-btn" aria-description="Vuelve a la vista de mesas del salón." to="/mesero">
                    Volver al salón
                  </Link>
                )}
                <button
                  type="button"
                  className="ck-btn"
                  aria-description="Vuelve a consultar la información de cocina."
                  onClick={actualizar}
                >
                  <RefreshCw size={15} /> Actualizar
                </button>
              </>
            }
          />
        </div>

        <div className="ck-content">
          {vista === 'comandas' ? (
            <>
              {error && (
                <div className="ck-error" role="alert">
                  <span>{error}</span>
                  <button type="button" className="ck-btn" onClick={cargarComandas}>
                    Reintentar
                  </button>
                </div>
              )}

              {cargando ? (
                <div className="ck-panel">
                  <p className="ck-vacio">Cargando comandas…</p>
                </div>
              ) : tarjetas.length === 0 ? (
                <div className="ck-panel">
                  <div className="ck-vacio">
                    <ChefHat size={40} />
                    <strong>No hay comandas en curso</strong>
                    <p>Los pedidos nuevos aparecen aquí automáticamente.</p>
                  </div>
                </div>
              ) : (
                <div className="ck-cols">
                  {COLUMNAS.map((col) => {
                    const enColumna = tarjetas.filter((t) => t.item.estado === col.estado)
                    return (
                      <section className="ck-col" key={col.estado} aria-label={col.titulo}>
                        <div className="ck-col-head">
                          <h2>{col.titulo}</h2>
                          <span className="ck-count">{enColumna.length}</span>
                        </div>

                        <div className="ck-col-body">
                          {enColumna.length === 0 && <p className="ck-vacio">Sin platos.</p>}

                          {enColumna.map(({ comanda, item }) => (
                            <article
                              key={item.id_detalle}
                              data-pedido={comanda.id_pedido}
                              className={`ck-tarjeta ck-tarjeta--${col.clase}${
                                resaltado === comanda.id_pedido ? ' ck-tarjeta--senalada' : ''
                              }`}
                            >
                              <div className="ck-top">
                                <strong>{comanda.mesa ? `Mesa ${comanda.mesa}` : comanda.tipo_pedido || 'Pedido'}</strong>
                                <span className="ck-tiempo">
                                  <Clock size={12} /> {tiempoTranscurrido(comanda.fecha_hora)}
                                </span>
                              </div>

                              <div className="ck-plato">
                                <span className="ck-cant">{item.cantidad}×</span> {item.nombre}
                              </div>

                              <div className="ck-meta">
                                Pedido #{comanda.id_pedido}
                                {comanda.nombre_mesero ? ` · ${comanda.nombre_mesero}` : ''}
                              </div>

                              {item.nota && <div className="ck-nota">Plato: {item.nota}</div>}
                              {comanda.notas && <div className="ck-nota">Nota: {comanda.notas}</div>}

                              <Button
                                size="small"
                                fullWidth
                                disabled={ocupado === item.id_detalle}
                                onClick={() => avanzar(item, col.siguiente)}
                              >
                                {col.accion}
                              </Button>
                            </article>
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {errorHistorial && (
                <div className="ck-error" role="alert">
                  <span>{errorHistorial}</span>
                  <button type="button" className="ck-btn" onClick={cargarHistorial}>
                    Reintentar
                  </button>
                </div>
              )}

              <section className="ck-panel">
                <div className="ck-panel-head">
                  <h2>
                    <History size={18} /> Platos entregados
                  </h2>
                  <span className="ck-fine">{historial.length} pedido{historial.length === 1 ? '' : 's'}</span>
                </div>

                {cargandoHistorial ? (
                  <p className="ck-vacio">Cargando historial…</p>
                ) : historial.length === 0 ? (
                  <div className="ck-vacio">
                    <CheckCircle2 size={40} />
                    <strong>Todavía no hay platos entregados</strong>
                    <p>Cuando marques un plato como entregado aparecerá en esta lista.</p>
                  </div>
                ) : (
                  <div className="ck-hist">
                    {historial.map((comanda) => (
                      <div className="ck-hist-grupo" key={comanda.id_pedido}>
                        <div className="ck-hist-top">
                          <strong>
                            {comanda.mesa ? `Mesa ${comanda.mesa}` : comanda.tipo_pedido || 'Pedido'} · #
                            {comanda.id_pedido}
                          </strong>
                          <span className="ck-fine">{fechaCorta(comanda.fecha_hora)}</span>
                        </div>
                        <div className="ck-hist-items">
                          {comanda.items.map((item) => (
                            <div className="ck-hist-item" key={item.id_detalle}>
                              <CheckCircle2 size={14} /> {item.cantidad}× {item.nombre}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
