import type { FormEvent } from 'react'
import type { Personal } from '../types'
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
  return (
    <section className="mt-6 flex flex-col gap-6">
      <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
        <h2 className="mb-5 font-['Syne'] text-[1.2rem] font-bold text-[var(--texto)]">Personal del Restaurante</h2>
        {errorPersonal && <p className="mb-4 text-[0.85rem] text-[var(--rojo)]">{errorPersonal}</p>}
        <div className="overflow-x-auto">
          {cargandoPersonal ? <p className="text-[0.85rem] text-[var(--texto-muted)]">Cargando personal...</p> : personal.length === 0 ? <p className="text-[0.85rem] text-[var(--texto-muted)]">No hay personal registrado</p> : (
            <table className="w-full border-collapse">
              <thead><tr>{['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map(titulo => <th key={titulo} className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">{titulo}</th>)}</tr></thead>
              <tbody>{personal.map(usuario => (
                <tr key={usuario.id_usuario}>
                  <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{usuario.nombre} {usuario.apellido}</td>
                  <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto-muted)]">{usuario.email}</td>
                  <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto-muted)]">{usuario.rol ?? 'Sin rol'}</td>
                  <td className={`border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] font-semibold ${usuario.activo ? 'text-[var(--verde)]' : 'text-[var(--rojo)]'}`}>{usuario.estado}</td>
                  <td className="border-b border-[var(--borde)] px-3 py-2.5"><div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onEdit(usuario)} title="Editar usuario" className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--borde)] bg-[var(--bg)] px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--rojo-dark)] transition-colors hover:border-[var(--rojo)] hover:bg-[var(--rojo-light)] focus:outline-none focus:ring-2 focus:ring-[var(--rojo-light)]"><span className="material-symbols-outlined text-[16px]">edit</span>Editar</button>
                    <button type="button" onClick={() => onDelete(usuario.id_usuario)} title="Eliminar usuario" className="inline-flex items-center gap-1.5 rounded-lg border border-[#efc4c0] bg-[#fff8f7] px-3 py-1.5 text-[0.78rem] font-semibold text-[var(--rojo)] transition-colors hover:border-[var(--rojo)] hover:bg-[var(--rojo-light)] focus:outline-none focus:ring-2 focus:ring-[var(--rojo-light)]"><span className="material-symbols-outlined text-[16px]">delete</span>Eliminar</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
        <h3 className="mb-5 font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">{usuarioEditando ? 'Editar Personal' : 'Crear Nuevo Personal'}</h3>
        <form onSubmit={onFormSubmit} className="grid gap-3 md:grid-cols-2">
          <input type="text" placeholder="Nombre" value={formData.nombre} onChange={event => onFormChange('nombre', event.target.value)} required className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none" />
          <input type="text" placeholder="Apellido" value={formData.apellido} onChange={event => onFormChange('apellido', event.target.value)} required className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none" />
          <input type="email" placeholder="Email" value={formData.email} onChange={event => onFormChange('email', event.target.value)} required className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none" />
          <select value={formData.id_rol} onChange={event => onFormChange('id_rol', Number(event.target.value))} required className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-[0.95rem] text-[var(--texto)] outline-none"><option value="">Seleccionar rol</option><option value="3">CAJERO</option><option value="4">MESERO</option><option value="5">REPARTIDOR</option></select>
          {!usuarioEditando && <div className="relative"><input type={mostrarContrasena ? 'text' : 'password'} placeholder="Contraseña" value={formData.contrasena} onChange={event => onFormChange('contrasena', event.target.value)} minLength={8} required className="w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 pr-11 text-[0.95rem] text-[var(--texto)] outline-none" /><button type="button" onClick={onTogglePassword} aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} title={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--texto-muted)]"><span className="material-symbols-outlined text-[20px]">{mostrarContrasena ? 'visibility_off' : 'visibility'}</span></button></div>}
          <div className="flex gap-2 md:col-span-2">{usuarioEditando && <button type="button" onClick={onCancelEdit} className="rounded-[10px] border border-[var(--borde)] px-4 py-2.5 text-[0.875rem] font-semibold text-[var(--texto-muted)]">Cancelar</button>}<button type="submit" disabled={guardandoPersonal} className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 text-[0.875rem] font-semibold text-white">{guardandoPersonal ? 'Guardando...' : usuarioEditando ? 'Actualizar' : 'Crear Personal'}</button></div>
        </form>
      </div>
    </section>
  )
}

export default PersonalSection