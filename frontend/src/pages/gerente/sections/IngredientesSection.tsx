import type { Ingrediente } from '../types'

interface IngredientesSectionProps {
  ingredientes: Ingrediente[]
  onCreate: () => void
  onEdit: (ingrediente: Ingrediente) => void
  onDelete: (id: number) => void
}

function IngredientesSection({ ingredientes, onCreate, onEdit, onDelete }: IngredientesSectionProps) {
  return (
    <section className="mt-6 rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] px-7 py-6 shadow-[var(--sombra)]">
      <div className="mb-5 flex items-center justify-between"><h3 className="font-['Syne'] text-[1rem] font-bold text-[var(--texto)]">Gestión de Ingredientes</h3><button className="rounded-[10px] bg-[var(--rojo)] px-4 py-3 font-['DM_Sans'] text-[0.875rem] font-semibold text-white" onClick={onCreate}>+ Nuevo Ingrediente</button></div>
      <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr>{['Nombre', 'Descripción', 'Unidad', 'Costo ref.', 'Stock mínimo', 'Acciones'].map(titulo => <th key={titulo} className="border-b border-[var(--borde)] px-3 py-2 text-left text-[0.78rem] font-semibold text-[var(--texto-muted)]">{titulo}</th>)}</tr></thead><tbody>
        {ingredientes.length === 0 ? <tr><td colSpan={6} className="py-4 text-center text-[var(--texto-muted)]">Cargando...</td></tr> : ingredientes.map(ingrediente => <tr key={ingrediente.id_ingrediente}>
          <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]"><strong>{ingrediente.nombre}</strong></td><td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{ingrediente.descripcion}</td><td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{ingrediente.unidad_medida}</td><td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">${Number(ingrediente.costo_unitario_ref).toLocaleString('es-CO')}</td><td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem] text-[var(--texto)]">{ingrediente.stock_minimo}</td>
          <td className="border-b border-[var(--borde)] px-3 py-2.5 text-[0.85rem]"><div className="flex gap-2"><button className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]" onClick={() => onEdit(ingrediente)}>Editar</button><button className="rounded-[10px] bg-transparent px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)]" onClick={() => onDelete(ingrediente.id_ingrediente)}>Eliminar</button></div></td>
        </tr>)}</tbody></table></div>
    </section>
  )
}

export default IngredientesSection