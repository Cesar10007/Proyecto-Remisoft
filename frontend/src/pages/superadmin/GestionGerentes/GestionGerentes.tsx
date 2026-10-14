import { useEffect, useState } from 'react'
import api from '../../../api/axios'
import { DataTable, Column } from '../../../components/common/DataTable'
import { Badge } from '../../../components/common/Badge'
import { InputField } from '../../../components/common/InputField'
import './GestionGerentes.css'

interface Usuario {
  id_usuario: number
  identificacion?: string
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  activo?: number | boolean | null
  estado?: string | null
  rol?: string
  id_rol?: number
  id_restaurante?: number | null
  restaurante?: string | null
}

interface FormularioGerente {
  identificacion: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  contrasena: string
  nombre_establecimiento: string
}

function obtenerMensajeError(error: any) {
  return (
    error?.response?.data?.message ||
    'No fue posible completar la operación.'
  )
}

function estaActivo(usuario: Usuario) {
  return usuario.estado
    ? usuario.estado.toUpperCase() === 'ACTIVO'
    : Boolean(usuario.activo)
}

function GestionGerentes() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null)
  const [eliminando, setEliminando] = useState<number | null>(null)

  const [formulario, setFormulario] = useState<FormularioGerente>({
    identificacion: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    contrasena: '',
    nombre_establecimiento: '',
  })

  const cargarGerentes = async () => {
    try {
      setCargando(true)
      setError(null)

      const response = await api.get<Usuario[]>('/usuarios')
      const data = Array.isArray(response.data) ? response.data : []

      const gerentes = data.filter(
        (usuario) =>
          usuario.id_rol === 2 ||
          usuario.rol?.toUpperCase() === 'GERENTE',
      )

      setUsuarios(
        gerentes.filter(
          (usuario) => usuario.estado?.toUpperCase() !== 'ELIMINADO',
        ),
      )
    } catch (requestError) {
      console.error(requestError)
      setError('No fue posible cargar los gerentes.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargarGerentes()
  }, [])

  const cambiarCampo = (
    campo: keyof FormularioGerente,
    valor: string,
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  const limpiarFormulario = () => {
    setFormulario({
      identificacion: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      contrasena: '',
      nombre_establecimiento: '',
    })
    setMostrarContrasena(false)
  }

  const cerrarFormulario = () => {
    if (guardando) return
    limpiarFormulario()
    setMostrarFormulario(false)
  }

  const crearGerente = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!formulario.nombre_establecimiento.trim()) {
      setError('Debes escribir el nombre del establecimiento.')
      return
    }

    try {
      setGuardando(true)
      setError(null)

      await api.post('/usuarios', {
        id_rol: 2,
        identificacion: formulario.identificacion,
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        email: formulario.email,
        telefono: formulario.telefono,
        contrasena: formulario.contrasena,
        nombre_establecimiento: formulario.nombre_establecimiento.trim(),
        activo: true,
        estado: 'ACTIVO',
      })

      cerrarFormulario()
      await cargarGerentes()
      window.alert('Gerente y establecimiento creados correctamente.')
    } catch (requestError) {
      setError(obtenerMensajeError(requestError))
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async (usuario: Usuario) => {
    const activo = estaActivo(usuario)
    const accion = activo ? 'desactivar' : 'activar'

    if (
      !window.confirm(
        `¿Deseas ${accion} al gerente ${usuario.nombre} ${
          usuario.apellido || ''
        }?`,
      )
    ) {
      return
    }

    try {
      setCambiandoEstado(usuario.id_usuario)
      setError(null)

      await api.patch(`/usuarios/${usuario.id_usuario}/estado`)
      await cargarGerentes()
    } catch (requestError) {
      setError(obtenerMensajeError(requestError))
    } finally {
      setCambiandoEstado(null)
    }
  }

  const eliminarUsuario = async (usuario: Usuario) => {
    if (
      !window.confirm(
        `¿Deseas eliminar al gerente ${usuario.nombre} ${
          usuario.apellido || ''
        }? Esta acción lo ocultará del listado.`,
      )
    ) {
      return
    }

    try {
      setEliminando(usuario.id_usuario)
      setError(null)

      await api.delete(`/usuarios/${usuario.id_usuario}`)
      await cargarGerentes()
    } catch (requestError) {
      setError(obtenerMensajeError(requestError))
    } finally {
      setEliminando(null)
    }
  }

  const columns: Column<Usuario>[] = [
    {
      header: 'Usuario',
      render: (usuario) => (
        <div className="sa-user-cell">
          <div className="sa-user-avatar-wrap">
            {usuario.nombre?.[0]?.toUpperCase() || 'G'}
          </div>
          <div>
            <p className="sa-user-name">
              {usuario.nombre} {usuario.apellido || ''}
            </p>
            <p className="sa-user-email">{usuario.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Identificación',
      render: (usuario) => usuario.identificacion || '—',
    },
    {
      header: 'Rol',
      render: () => <span className="sa-role-pill">GERENTE</span>,
    },
    {
      header: 'Establecimiento',
      render: (usuario) => usuario.restaurante || '—',
    },
    {
      header: 'Teléfono',
      render: (usuario) => usuario.telefono || '—',
    },
    {
      header: 'Estado',
      render: (usuario) => {
        const activo = estaActivo(usuario)
        return (
          <Badge
            status={activo ? 'active' : 'inactive'}
            label={activo ? 'Activo' : 'Inactivo'}
          />
        )
      },
    },
    {
      header: 'Acciones',
      render: (usuario) => {
        const activo = estaActivo(usuario)
        const procesandoEstado = cambiandoEstado === usuario.id_usuario
        const procesandoEliminacion = eliminando === usuario.id_usuario

        return (
          <div className="sa-user-actions">
            <button
              type="button"
              className="sa-action-button sa-action-button--state"
              onClick={() => void cambiarEstado(usuario)}
              disabled={procesandoEstado || procesandoEliminacion}
              title={activo ? 'Desactivar gerente' : 'Activar gerente'}
            >
              <span className="material-symbols-outlined">
                {activo ? 'person_off' : 'person_check'}
              </span>
              {procesandoEstado
                ? 'Guardando...'
                : activo
                  ? 'Desactivar'
                  : 'Activar'}
            </button>

            <button
              type="button"
              className="sa-action-button sa-action-button--delete"
              onClick={() => void eliminarUsuario(usuario)}
              disabled={procesandoEstado || procesandoEliminacion}
              title="Eliminar gerente"
            >
              <span className="material-symbols-outlined">
                delete
              </span>
              {procesandoEliminacion
                ? 'Eliminando...'
                : 'Eliminar'}
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <section className="sa-users-panel">
      <div className="sa-panel-header">
        <div>
          <h2 className="sa-panel-title">Gestión de Gerentes</h2>
          <p className="sa-panel-subtitle">
            Consultar gerentes responsables de los restaurantes
          </p>
        </div>

        <button
          type="button"
          className="sa-btn-add-member"
          onClick={() => {
            setError(null)
            setMostrarFormulario(true)
          }}
        >
          <span className="material-symbols-outlined">person_add</span>
          Agregar gerente
        </button>
      </div>

      {error && (
        <p className="sa-table-message sa-table-message--error">
          {error}
        </p>
      )}

      {mostrarFormulario && (
        <div className="sa-manager-modal-backdrop">
          <div
            className="sa-manager-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-formulario-gerente"
          >
            <div className="sa-manager-modal__header">
              <div>
                <h3 id="titulo-formulario-gerente">Agregar gerente</h3>
                <p>Completa la información del nuevo gerente.</p>
              </div>

              <button
                type="button"
                className="sa-manager-modal__close"
                onClick={cerrarFormulario}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="sa-manager-form" onSubmit={crearGerente}>
              <div className="sa-manager-form__grid">
                <InputField
                  label="Identificación"
                  type="text"
                  value={formulario.identificacion}
                  onChange={(event) =>
                    cambiarCampo('identificacion', event.target.value)
                  }
                />

                <InputField
                  label="Nombre *"
                  type="text"
                  value={formulario.nombre}
                  onChange={(event) =>
                    cambiarCampo('nombre', event.target.value)
                  }
                  required
                />

                <InputField
                  label="Apellido"
                  type="text"
                  value={formulario.apellido}
                  onChange={(event) =>
                    cambiarCampo('apellido', event.target.value)
                  }
                />

                <InputField
                  label="Teléfono"
                  type="tel"
                  value={formulario.telefono}
                  onChange={(event) =>
                    cambiarCampo('telefono', event.target.value)
                  }
                />

                <div className="sa-manager-form__field--full">
                  <InputField
                    label="Correo electrónico *"
                    type="email"
                    value={formulario.email}
                    onChange={(event) =>
                      cambiarCampo('email', event.target.value)
                    }
                    required
                  />
                </div>

                <InputField
                  label="Nombre Establecimiento *"
                  type="text"
                  placeholder="Ej. Restaurante Central"
                  value={formulario.nombre_establecimiento}
                  onChange={(event) =>
                    cambiarCampo(
                      'nombre_establecimiento',
                      event.target.value,
                    )
                  }
                  required
                />

                <div className="sa-password-field">
                  <InputField
                    label="Contraseña *"
                    type={mostrarContrasena ? 'text' : 'password'}
                    value={formulario.contrasena}
                    onChange={(event) =>
                      cambiarCampo('contrasena', event.target.value)
                    }
                    minLength={8}
                    required
                    className="pr-12"
                  />

                  <button
                    type="button"
                    className="sa-password-toggle !top-8 !h-10"
                    onClick={() =>
                      setMostrarContrasena((actual) => !actual)
                    }
                    aria-label={
                      mostrarContrasena
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    <span className="material-symbols-outlined">
                      {mostrarContrasena
                        ? 'visibility_off'
                        : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <p className="sa-manager-form__hint">
                La contraseña debe tener mínimo 8 caracteres e incluir
                mayúscula, minúscula, número y carácter especial. El ID del
                establecimiento se genera automáticamente.
              </p>

              <div className="sa-manager-form__actions">
                <button
                  type="button"
                  className="sa-manager-btn sa-manager-btn--secondary"
                  onClick={cerrarFormulario}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="sa-manager-btn sa-manager-btn--primary"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Crear gerente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        title="Gerentes registrados"
        columns={columns}
        data={usuarios}
        isLoading={cargando}
        emptyMessage="No hay gerentes registrados."
        keyExtractor={(usuario) => usuario.id_usuario}
      />
    </section>
  )
}

export default GestionGerentes