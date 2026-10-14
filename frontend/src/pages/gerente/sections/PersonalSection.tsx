import type { FormEvent } from 'react'
import type { Personal } from '../types'
import { DataTable, Column } from '../../../components/common/DataTable'
import { Badge } from '../../../components/common/Badge'
import { InputField } from '../../../components/common/InputField'
import { SelectField } from '../../../components/common/SelectField'
export type { Personal } from '../types'

interface FormData {
  nombre: string
  apellido: string
  email: string
  id_rol: number | ''
  contrasena: string
}

interface PersonalSectionProps {
  personal: Personal[]
  formData: FormData
  usuarioEditando: Personal | null
  errorPersonal: string | null
  guardandoPersonal: boolean
  cargandoPersonal: boolean
  mostrarContrasena: boolean
  onFormSubmit: (event: FormEvent<HTMLFormElement>) => void
  onFormChange: (field: keyof FormData, value: string | number) => void
  onEdit: (usuario: Personal) => void
  onDelete: (id: number) => void
  onCancelEdit: () => void
  onTogglePassword: () => void
}

function PersonalSection({
  personal, formData, usuarioEditando, errorPersonal, guardandoPersonal,
  cargandoPersonal, mostrarContrasena, onFormSubmit, onFormChange, onEdit,
  onDelete, onCancelEdit, onTogglePassword,
}: PersonalSectionProps) {
  const columns: Column<Personal>[] = [
    {
      header: 'Nombre',
      render: (usuario) => `${usuario.nombre} ${usuario.apellido}`,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Rol',
      render: (usuario) => usuario.rol ?? 'Sin rol',
    },
    {
      header: 'Estado',
      render: (usuario) => (
        <Badge
          status={usuario.activo ? 'active' : 'inactive'}
          label={usuario.estado ?? (usuario.activo ? 'Activo' : 'Inactivo')}
        />
      ),
    },
    {
      header: 'Acciones',
      render: (usuario) => (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(usuario)}
            title="Editar usuario"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--borde)] bg-[var(--bg)] px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--rojo-dark)] transition-colors hover:border-[var(--rojo)] hover:bg-[var(--rojo-light)] focus:outline-none focus:ring-2 focus:ring-[var(--rojo-light)]"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(usuario.id_usuario)}
            title="Eliminar usuario"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#efc4c0] bg-[#fff8f7] px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--rojo)] transition-colors hover:border-[var(--rojo)] hover:bg-[var(--rojo-light)] focus:outline-none focus:ring-2 focus:ring-[var(--rojo-light)]"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <section className="mt-6 flex flex-col gap-6">
      {errorPersonal && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-[0.85rem] text-[var(--rojo)]">
          {errorPersonal}
        </p>
      )}

      <DataTable
        title="Personal del Restaurante"
        columns={columns}
        data={personal}
        isLoading={cargandoPersonal}
        emptyMessage="No hay personal registrado"
        keyExtractor={(u) => u.id_usuario}
      />

      <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
        <h3 className="mb-5 font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">
          {usuarioEditando ? 'Editar Personal' : 'Crear Nuevo Personal'}
        </h3>
        <form onSubmit={onFormSubmit} className="grid gap-3 md:grid-cols-2">
          <InputField
            label="Nombre"
            type="text"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(event) => onFormChange('nombre', event.target.value)}
            required
          />
          <InputField
            label="Apellido"
            type="text"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={(event) => onFormChange('apellido', event.target.value)}
            required
          />
          <InputField
            label="Email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(event) => onFormChange('email', event.target.value)}
            required
          />
          <SelectField
            label="Rol"
            value={formData.id_rol}
            onChange={(event) => onFormChange('id_rol', Number(event.target.value))}
            required
          >
            <option value="">Seleccionar rol</option>
            <option value="3">CAJERO</option>
            <option value="4">MESERO</option>
            <option value="5">REPARTIDOR</option>
          </SelectField>
          {!usuarioEditando && (
            <div className="relative">
              <InputField
                label="Contraseña"
                type={mostrarContrasena ? 'text' : 'password'}
                placeholder="Contraseña"
                value={formData.contrasena}
                onChange={(event) => onFormChange('contrasena', event.target.value)}
                minLength={8}
                required
                className="pr-11"
              />
              <button
                type="button"
                onClick={onTogglePassword}
                aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-8 text-[var(--texto-muted)]"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {mostrarContrasena ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          )}
          <div className="flex gap-2 md:col-span-2 mt-2">
            {usuarioEditando && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-[10px] border border-[var(--borde)] px-4 py-2.5 text-[0.875rem] font-semibold text-[var(--texto-muted)]"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={guardandoPersonal}
              className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 text-[0.875rem] font-semibold text-white"
            >
              {guardandoPersonal ? 'Guardando...' : usuarioEditando ? 'Actualizar' : 'Crear Personal'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default PersonalSection