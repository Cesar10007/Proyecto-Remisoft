import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import './Dashboard.css'

interface Usuario {
  id_usuario: number
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  activo: number
  rol?: string
  id_rol?: number
}

// Uptime y latencia no existen en la base: se muestran como dato de ejemplo y etiquetados Demo.
const metricasBase = [
  {
    label: 'Gerentes activos',
    detail: 'Datos obtenidos del sistema',
    icon: 'group',
    color: 'green',
    demo: false,
  },
  {
    label: 'Solicitudes pendientes',
    detail: 'Pendientes de revisión',
    icon: null,
    color: 'amber',
    demo: false,
  },
  {
    label: 'Tiempo de actividad del sistema',
    detail: 'Estado del servicio (Demo)',
    icon: 'check_circle',
    color: 'green',
    demo: true,
    valorDemo: '99,9 %',
  },
  {
    label: 'Respuesta de API',
    detail: 'Latencia de ejemplo (Demo)',
    icon: null,
    color: 'default',
    demo: true,
    valorDemo: '142 ms',
  },
]

function Dashboard() {
  const [gerentes, setGerentes] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<number | null>(null)

  useEffect(() => {
    const cargarGerentes = async () => {
      try {
        setCargando(true)
        const response = await api.get('/usuarios')
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.data ?? []

        setGerentes(
          data.filter(
            (usuario: Usuario) =>
              usuario.activo &&
              (usuario.id_rol === 2 || usuario.rol?.toUpperCase() === 'GERENTE'),
          ),
        )
      } catch (requestError) {
        console.error(requestError)
        setError('No fue posible cargar los gerentes activos.')
      } finally {
        setCargando(false)
      }
    }

    const cargarSolicitudes = async () => {
      try {
        const response = await api.get('/solicitudes')
        const data = Array.isArray(response.data?.data) ? response.data.data : []
        setSolicitudesPendientes(data.length)
      } catch (requestError) {
        console.error(requestError)
        setSolicitudesPendientes(null)
      }
    }

    cargarGerentes()
    cargarSolicitudes()
  }, [])

  const valorPorIndice = (index: number) => {
    if (index === 0) return cargando ? '—' : gerentes.length
    if (index === 1) return solicitudesPendientes ?? '—'
    return '—'
  }

  const metricas = metricasBase.map((metrica, index) => ({
    ...metrica,
    value: metrica.demo ? metrica.valorDemo : valorPorIndice(index),
  }))

  return (
    <section className="sa-dashboard">
      <div className="sa-metrics-grid">
        {metricas.map((metric) => (
          <article key={metric.label} className="sa-metric-card">
            <p className="sa-metric-card__label">
              {metric.label}
              {metric.demo && (
                <span style={{ marginLeft: '0.5rem', padding: '0.1rem 0.45rem', borderRadius: 999, background: 'rgba(127,127,127,0.18)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', verticalAlign: 'middle' }}>
                  Demo
                </span>
              )}
            </p>
            <h2 className={`sa-metric-card__value sa-metric-card__value--${metric.color}`}>
              {metric.value}
            </h2>

            {metric.icon ? (
              <div className={`sa-metric-card__detail sa-metric-card__detail--${metric.color}`}>
                <span className="material-symbols-outlined">{metric.icon}</span>
                <span>{metric.detail}</span>
              </div>
            ) : (
              <p className="sa-metric-card__text-detail">{metric.detail}</p>
            )}
          </article>
        ))}
      </div>

      <section className="sa-dashboard-panel">
        <h2 className="sa-panel-title">Gerentes activos</h2>
        <p className="sa-panel-subtitle">
          Gerentes activos registrados en el sistema.
        </p>

        <div className="sa-table-card">
          <div className="sa-table-scroll">
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={4} className="sa-table-message">
                      Cargando gerentes...
                    </td>
                  </tr>
                )}

                {!cargando && error && (
                  <tr>
                    <td colSpan={4} className="sa-table-message sa-table-message--error">
                      {error}
                    </td>
                  </tr>
                )}

                {!cargando && !error && gerentes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="sa-table-message">
                      No hay gerentes activos registrados.
                    </td>
                  </tr>
                )}

                {!cargando && !error && gerentes.map((gerente) => (
                  <tr key={gerente.id_usuario}>
                    <td>
                      <div className="sa-user-cell">
                        <div className="sa-user-avatar-wrap">
                          {gerente.nombre?.[0]?.toUpperCase() ?? 'G'}
                        </div>
                        <div>
                          <p className="sa-user-name">
                            {gerente.nombre} {gerente.apellido ?? ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{gerente.email}</td>
                    <td>{gerente.telefono ?? '—'}</td>
                    <td>
                      <div className="sa-status-wrap">
                        <span className="sa-status-dot sa-status-dot--active" />
                        <span className="sa-status-text sa-status-text--active">
                          Activo
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </section>
  )
}

export default Dashboard