import { useCallback, useEffect, useState } from 'react'
import api from '../../../api/axios'
import './Solicitudes.css'

interface Solicitud {
  id_solicitud: number
  nombre: string
  apellido: string
  email: string
  telefono?: string | null
  id_rol_solicitado: number
  id_restaurante?: number | null
  estado: string
  motivo_rechazo?: string | null
  fecha_solicitud: string
  fecha_revision?: string | null
  revisado_por?: number | null
  rol?: {
    nombre?: string | null
  }
  revisor?: {
    nombre?: string | null
    apellido?: string | null
    email?: string | null
  } | null
}

interface ApiResponse {
  success: boolean
  data: Solicitud[]
  message?: string
}

type Pestana = 'pendientes' | 'historial'
type FiltroEstado = 'TODAS' | 'APROBADA' | 'RECHAZADA'

function obtenerMensajeError(error: any) {
  return (
    error?.response?.data?.message ||
    'No fue posible completar la operación.'
  )
}

function iconoSolicitud(idRol: number) {
  if (idRol === 2) return 'supervisor_account'
  if (idRol === 3) return 'point_of_sale'
  if (idRol === 4) return 'person'
  if (idRol === 5) return 'delivery_dining'
  return 'person_search'
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) return '—'

  const fechaFormateada = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fecha))

  return fechaFormateada
}

function obtenerNombreRevisor(
  revisor?: Solicitud['revisor'] | null,
) {
  if (!revisor) return '—'

  const nombre = `${revisor.nombre || ''} ${
    revisor.apellido || ''
  }`.trim()

  return nombre || revisor.email || '—'
}

function Solicitudes() {
  const [pestana, setPestana] = useState<Pestana>('pendientes')
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>('TODAS')

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState<number | null>(null)
  const [error, setError] = useState('')

  const cargarSolicitudes = useCallback(async () => {
    try {
      setCargando(true)
      setError('')

      if (pestana === 'pendientes') {
        const response = await api.get<ApiResponse>('/solicitudes')
        setSolicitudes(response.data.data || [])
        return
      }

      const params =
        filtroEstado === 'TODAS'
          ? {}
          : { estado: filtroEstado }

      const response = await api.get<ApiResponse>(
        '/solicitudes/historial',
        { params },
      )

      setSolicitudes(response.data.data || [])
    } catch (err) {
      setSolicitudes([])
      setError(obtenerMensajeError(err))
    } finally {
      setCargando(false)
    }
  }, [pestana, filtroEstado])

  useEffect(() => {
    void cargarSolicitudes()
  }, [cargarSolicitudes])

  const aprobar = async (id: number) => {
    if (!window.confirm('¿Aprobar esta solicitud y crear el usuario?')) {
      return
    }

    try {
      setProcesando(id)
      setError('')

      await api.patch(`/solicitudes/${id}/aprobar`)
      await cargarSolicitudes()

      window.alert(
        'Solicitud aprobada y usuario creado correctamente.',
      )
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setProcesando(null)
    }
  }

  const rechazar = async (id: number) => {
    const motivo = window
      .prompt('Escribe el motivo del rechazo:')
      ?.trim()

    if (!motivo) return

    try {
      setProcesando(id)
      setError('')

      await api.patch(`/solicitudes/${id}/rechazar`, {
        motivo_rechazo: motivo,
      })

      await cargarSolicitudes()

      window.alert('Solicitud rechazada correctamente.')
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setProcesando(null)
    }
  }

  const cambiarPestana = (nuevaPestana: Pestana) => {
    setPestana(nuevaPestana)
    setError('')
  }

  return (
    <section className="sa-requests-card">
      <div className="sa-requests-header">
        <div>
          <h2 className="sa-panel-title">Solicitudes</h2>

          <div className="sa-request-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={pestana === 'pendientes'}
              className={`sa-request-tab ${
                pestana === 'pendientes'
                  ? 'sa-request-tab--active'
                  : ''
              }`}
              onClick={() => cambiarPestana('pendientes')}
            >
              Pendientes
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={pestana === 'historial'}
              className={`sa-request-tab ${
                pestana === 'historial'
                  ? 'sa-request-tab--active'
                  : ''
              }`}
              onClick={() => cambiarPestana('historial')}
            >
              Historial
            </button>
          </div>
        </div>

        <span className="sa-urgent-badge">
          {pestana === 'pendientes'
            ? solicitudes.length > 0
              ? `${solicitudes.length} pendientes`
              : 'Al día'
            : `${solicitudes.length} registros`}
        </span>
      </div>

      {pestana === 'historial' && (
        <div className="sa-request-filter">
          <label htmlFor="filtro-estado">
            Filtrar por estado:
          </label>

          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(event) =>
              setFiltroEstado(
                event.target.value as FiltroEstado,
              )
            }
          >
            <option value="TODAS">Todas</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>
        </div>
      )}

      {error && (
        <p role="alert" className="sa-request-error">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="sa-request-status">
          Cargando solicitudes...
        </p>
      ) : solicitudes.length === 0 ? (
        <p className="sa-request-status">
          {pestana === 'pendientes'
            ? 'No hay solicitudes pendientes.'
            : 'No hay solicitudes en el historial.'}
        </p>
      ) : (
        <div className="sa-requests-list">
          {solicitudes.map((solicitud) => {
            const nombreCompleto = `${solicitud.nombre} ${
              solicitud.apellido
            }`

            const rol =
              solicitud.rol?.nombre ||
              `Rol ${solicitud.id_rol_solicitado}`

            const bloqueado =
              procesando === solicitud.id_solicitud

            return (
              <article
                key={solicitud.id_solicitud}
                className="sa-request-item"
              >
                <div className="sa-request-item__top">
                  <div className="sa-request-icon sa-request-icon--primary">
                    <span className="material-symbols-outlined">
                      {iconoSolicitud(
                        solicitud.id_rol_solicitado,
                      )}
                    </span>
                  </div>

                  <div className="sa-request-content">
                    <p className="sa-request-title">
                      {nombreCompleto}
                    </p>

                    <p className="sa-request-sub">
                      {rol} · {solicitud.email}
                    </p>

                    {solicitud.telefono && (
                      <p className="sa-request-sub">
                        Teléfono: {solicitud.telefono}
                      </p>
                    )}

                    {solicitud.id_restaurante && (
                      <p className="sa-request-sub">
                        Restaurante {solicitud.id_restaurante}
                      </p>
                    )}

                    {pestana === 'pendientes' ? (
                      <p className="sa-request-sub">
                        Enviada:{' '}
                        {formatearFecha(
                          solicitud.fecha_solicitud,
                        )}
                      </p>
                    ) : (
                      <div className="sa-request-history">
                        <p className="sa-request-sub">
                          Estado:{' '}
                          <span
                            className={`sa-request-status-badge sa-request-status-badge--${solicitud.estado.toLowerCase()}`}
                          >
                            {solicitud.estado}
                          </span>
                        </p>

                        <p className="sa-request-sub">
                          Solicitud:{' '}
                          {formatearFecha(
                            solicitud.fecha_solicitud,
                          )}
                        </p>

                        <p className="sa-request-sub">
                          Revisada:{' '}
                          {formatearFecha(
                            solicitud.fecha_revision,
                          )}
                        </p>

                        {solicitud.revisor && (
                          <p className="sa-request-sub">
                            Revisada por:{' '}
                            {obtenerNombreRevisor(
                              solicitud.revisor,
                            )}
                          </p>
                        )}

                        {solicitud.motivo_rechazo && (
                          <p className="sa-request-sub sa-request-rejection-reason">
                            Motivo: {solicitud.motivo_rechazo}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {pestana === 'pendientes' && (
                  <div className="sa-request-actions">
                    <button
                      type="button"
                      className="sa-request-btn sa-request-btn--approve"
                      onClick={() =>
                        void aprobar(
                          solicitud.id_solicitud,
                        )
                      }
                      disabled={bloqueado}
                    >
                      {bloqueado ? 'Procesando...' : 'Aprobar'}
                    </button>

                    <button
                      type="button"
                      className="sa-request-btn sa-request-btn--reject"
                      onClick={() =>
                        void rechazar(
                          solicitud.id_solicitud,
                        )
                      }
                      disabled={bloqueado}
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Solicitudes