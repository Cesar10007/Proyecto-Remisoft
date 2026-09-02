import './Solicitudes.css'

interface Solicitud {
  icon: string
  title: string
  sub: string
  color: 'primary' | 'secondary'
}

const solicitudes: Solicitud[] = [
  {
    icon: 'key',
    title: 'Omisión de Restablecimiento de Contraseña',
    sub: 'Solicitud pendiente',
    color: 'primary',
  },
  {
    icon: 'person_search',
    title: 'Verificación de Cuenta',
    sub: 'Se requiere verificación manual',
    color: 'secondary',
  },
]

function Solicitudes() {
  return (
    <section className="sa-requests-card">
      <div className="sa-requests-header">
        <h2 className="sa-panel-title">Solicitudes Pendientes</h2>
        <span className="sa-urgent-badge">Urgente</span>
      </div>

      <div className="sa-requests-list">
        {solicitudes.map((solicitud) => (
          <article key={solicitud.title} className="sa-request-item">
            <div className="sa-request-item__top">
              <div
                className={`sa-request-icon sa-request-icon--${solicitud.color}`}
              >
                <span className="material-symbols-outlined">
                  {solicitud.icon}
                </span>
              </div>

              <div>
                <p className="sa-request-title">{solicitud.title}</p>
                <p className="sa-request-sub">{solicitud.sub}</p>
              </div>
            </div>

            <div className="sa-request-actions">
              <button
                type="button"
                className="sa-request-btn sa-request-btn--approve"
              >
                Aprobar
              </button>

              <button
                type="button"
                className="sa-request-btn sa-request-btn--reject"
              >
                Rechazar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Solicitudes