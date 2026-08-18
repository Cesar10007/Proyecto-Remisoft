import './Cajero.css'

function Cajero() {
  return (
    <div className="cajero-page">

      {/* SIDEBAR */}
      <aside className="cajero-sidebar">
        <div className="cajero-logo">
          Remi<span>Soft</span>
        </div>

        <nav className="cajero-nav">
          <button className="cajero-nav-item active">
            <span>▦</span>
            Inicio
          </button>

          <button className="cajero-nav-item">
            <span>🧾</span>
            Cuentas
          </button>

          <button className="cajero-nav-item">
            <span>💳</span>
            Pagos
          </button>

          <button className="cajero-nav-item">
            <span>📄</span>
            Facturas
          </button>
        </nav>

        <div className="cajero-user">
          <div className="cajero-user-avatar">
            C
          </div>

          <div>
            <strong>Cajero</strong>
            <span>Usuario</span>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="cajero-main">

        {/* HEADER */}
        <header className="cajero-header">
          <div>
            <span className="cajero-tag">
              PANEL DE CAJERO
            </span>

            <h1>
              Buenos días, Cajero
            </h1>

            <p>
              Gestiona los pagos y las cuentas del restaurante.
            </p>
          </div>

          <div className="cajero-header-actions">
            <button className="cajero-button secondary">
              🔔
            </button>

            <button className="cajero-button primary">
              Nueva venta
            </button>
          </div>
        </header>

        {/* RESUMEN */}
        <section className="cajero-summary">

          <div className="cajero-card">
            <span className="cajero-card-label">
              Cuentas pendientes
            </span>

            <strong>
              8
            </strong>

            <small>
              Pendientes de pago
            </small>
          </div>

          <div className="cajero-card">
            <span className="cajero-card-label">
              Pagos realizados
            </span>

            <strong>
              24
            </strong>

            <small>
              Durante el turno
            </small>
          </div>

          <div className="cajero-card">
            <span className="cajero-card-label">
              Total recaudado
            </span>

            <strong>
              $842.000
            </strong>

            <small>
              Durante el turno
            </small>
          </div>

        </section>

        {/* CUENTAS */}
        <section className="cajero-section">

          <div className="cajero-section-header">
            <div>
              <span className="cajero-section-tag">
                COBROS
              </span>

              <h2>
                Cuentas pendientes
              </h2>
            </div>

            <button className="cajero-link-button">
              Ver todas
            </button>
          </div>

          <div className="cajero-table-wrapper">

            <table className="cajero-table">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Mesa</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>#001</td>
                  <td>Mesa 3</td>
                  <td>Cliente</td>
                  <td>$85.000</td>

                  <td>
                    <span className="cajero-status pending">
                      Pendiente
                    </span>
                  </td>

                  <td>
                    <button className="cajero-action-button">
                      Cobrar
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>#002</td>
                  <td>Mesa 7</td>
                  <td>Cliente</td>
                  <td>$52.000</td>

                  <td>
                    <span className="cajero-status pending">
                      Pendiente
                    </span>
                  </td>

                  <td>
                    <button className="cajero-action-button">
                      Cobrar
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>#003</td>
                  <td>Mesa 2</td>
                  <td>Cliente</td>
                  <td>$120.000</td>

                  <td>
                    <span className="cajero-status pending">
                      Pendiente
                    </span>
                  </td>

                  <td>
                    <button className="cajero-action-button">
                      Cobrar
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>

          </div>

        </section>

        {/* ÚLTIMOS PAGOS */}
        <section className="cajero-section">

          <div className="cajero-section-header">
            <div>
              <span className="cajero-section-tag">
                HISTORIAL
              </span>

              <h2>
                Últimos pagos
              </h2>
            </div>
          </div>

          <div className="cajero-payments">

            <div className="cajero-payment">
              <div>
                <strong>
                  Cuenta #004
                </strong>

                <span>
                  Efectivo
                </span>
              </div>

              <strong>
                $65.000
              </strong>
            </div>

            <div className="cajero-payment">
              <div>
                <strong>
                  Cuenta #005
                </strong>

                <span>
                  Tarjeta
                </span>
              </div>

              <strong>
                $92.000
              </strong>
            </div>

          </div>

        </section>

      </main>

    </div>
  )
}

export default Cajero