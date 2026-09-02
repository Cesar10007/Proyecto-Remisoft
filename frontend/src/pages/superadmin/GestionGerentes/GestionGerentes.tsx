import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import './GestionGerentes.css'

interface Usuario {
  id_usuario: number
  identificacion?: string
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  activo: number
  rol?: string
  id_rol?: number
}

function GestionGerentes() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarGerentes = async () => {
    try {
      setCargando(true)
      setError(null)

      const response = await api.get('/usuarios')
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data ?? []

      const gerentes = data.filter(
        (usuario: Usuario) =>
          usuario.id_rol === 2 || usuario.rol?.toUpperCase() === 'GERENTE',
      )

      setUsuarios(gerentes)
    } catch (requestError) {
      console.error(requestError)
      setError('No fue posible cargar los gerentes.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarGerentes()
  }, [])

  return (
    <section className="sa-users-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Gestión de Gerentes</h2>
          <p className="sa-panel-subtitle">
            Consultar gerentes responsables de los restaurantes
          </p>
        </div>

        <button type="button" className="sa-btn-add-member">
          <span className="material-symbols-outlined">person_add</span>
          Agregar gerente
        </button>
      </div>

      <div className="sa-table-card">
        <div className="sa-table-scroll">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Identificación</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando && (
                <tr>
                  <td colSpan={6} className="sa-table-message">
                    Cargando gerentes...
                  </td>
                </tr>
              )}

              {!cargando && error && (
                <tr>
                  <td colSpan={6} className="sa-table-message sa-table-message--error">
                    {error}
                  </td>
                </tr>
              )}

              {!cargando && !error && usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="sa-table-message">
                    No hay gerentes registrados.
                  </td>
                </tr>
              )}

              {!cargando && !error && usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>
                    <div className="sa-user-cell">
                      <div className="sa-user-avatar-wrap">
                        {usuario.nombre?.[0]?.toUpperCase() ?? 'G'}
                      </div>
                      <div>
                        <p className="sa-user-name">
                          {usuario.nombre} {usuario.apellido ?? ''}
                        </p>
                        <p className="sa-user-email">{usuario.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{usuario.identificacion ?? '—'}</td>
                  <td><span className="sa-role-pill">GERENTE</span></td>
                  <td>{usuario.telefono ?? '—'}</td>
                  <td>
                    <div className="sa-status-wrap">
                      <span className={`sa-status-dot${usuario.activo ? ' sa-status-dot--active' : ''}`} />
                      <span className={`sa-status-text${usuario.activo ? ' sa-status-text--active' : ''}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </td>
                  <td><span className="sa-readonly-label">Solo lectura</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default GestionGerentes