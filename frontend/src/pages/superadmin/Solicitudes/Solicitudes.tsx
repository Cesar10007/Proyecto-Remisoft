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
  fecha_solicitud: string
  rol?: { nombre?: string | null }
}

interface ApiResponse {
  success: boolean
  data: Solicitud[]
  message?: string
}

function obtenerMensajeError(error: any) {
  return error?.response?.data?.message || 'No fue posible completar la operación.'
}

function iconoSolicitud(idRol: number) {
  if (idRol === 2) return 'supervisor_account'
  if (idRol === 3) return 'point_of_sale'
  if (idRol === 4) return 'person'
  if (idRol === 5) return 'delivery_dining'
  return 'person_search'
}

function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState<number | null>(null)
  const [error, setError] = useState('')

  const cargarSolicitudes = useCallback(async () => {
    try {
      setError('')
      const response = await api.get<ApiResponse>('/solicitudes')
      setSolicitudes(response.data.data || [])
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarSolicitudes()
  }, [cargarSolicitudes])

  const aprobar = async (id: number) => {
    if (!window.confirm('¿Aprobar esta solicitud y crear el usuario?')) return

    try {
      setProcesando(id)
      setError('')
      await api.patch(`/solicitudes/${id}/aprobar`)
      await cargarSolicitudes()
      window.alert('Solicitud aprobada y usuario creado correctamente.')
    } catch (err) {
      setError(obtenerMensajeError(err))
    } finally {
      setProcesando(null)
    }
  }

  const rechazar = async (id: number) => {
    const motivo = window.prompt('Escribe el motivo del rechazo:')?.trim()
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

  return (
    <section className="sa-requests-card">
      <div className="sa-requests-header">
        <h2 className="sa-panel-title">Solicitudes Pendientes</h2>
        <span className="sa-urgent-badge">
          {solicitudes.length > 0 ? `${solicitudes.length} pendientes` : 'Al día'}
        </span>
      </div>

      {error && <p role="alert" className="sa-request-error">{error}</p>}

      {cargando ? (
        <p className="sa-request-status">Cargando solicitudes...</p>
      ) : solicitudes.length === 0 ? (
        <p className="sa-request-status">No hay solicitudes pendientes.</p>
      ) : (
        <div className="sa-requests-list">
          {solicitudes.map((solicitud) => {
            const nombreCompleto = `${solicitud.nombre} ${solicitud.apellido}`
            const rol = solicitud.rol?.nombre || `Rol ${solicitud.id_rol_solicitado}`
            const bloqueado = procesando === solicitud.id_solicitud

            return (
              <article key={solicitud.id_solicitud} className="sa-request-item">
                <div className="sa-request-item__top">
                  <div className="sa-request-icon sa-request-icon--primary">
                    <span className="material-symbols-outlined">
                      {iconoSolicitud(solicitud.id_rol_solicitado)}
                    </span>
                  </div>

                  <div>
                    <p className="sa-request-title">{nombreCompleto}</p>
                    <p className="sa-request-sub">{rol} · {solicitud.email}</p>
                    {solicitud.id_restaurante && (
                      <p className="sa-request-sub">Restaurante {solicitud.id_restaurante}</p>
                    )}
                  </div>
                </div>

                <div className="sa-request-actions">
                  <button
                    type="button"
                    className="sa-request-btn sa-request-btn--approve"
                    onClick={() => void aprobar(solicitud.id_solicitud)}
                    disabled={bloqueado}
                  >
                    {bloqueado ? 'Procesando...' : 'Aprobar'}
                  </button>

                  <button
                    type="button"
                    className="sa-request-btn sa-request-btn--reject"
                    onClick={() => void rechazar(solicitud.id_solicitud)}
                    disabled={bloqueado}
                  >
                    Rechazar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Solicitudes
