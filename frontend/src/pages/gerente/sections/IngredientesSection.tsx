import { useState } from 'react'
import MovimientosIngrediente from '../components/MovimientosIngrediente'
import type { Ingrediente, IngredienteConStock } from '../types'
import { DataTable, Column } from '../../../components/common/DataTable'

interface IngredientesSectionProps {
  ingredientes: IngredienteConStock[]
  actualizar: () => Promise<void>
  onCreate: () => void
  onEdit: (ingrediente: Ingrediente) => void
  onDelete: (id: number) => void
}

function IngredientesSection({ ingredientes, actualizar, onCreate, onEdit, onDelete }: IngredientesSectionProps) {
  const [seleccion, setSeleccion] = useState<Ingrediente | null>(null)
  const columns: Column<IngredienteConStock>[] = [
    {
      header: 'Nombre',
      render: (i) => <strong>{i.nombre}</strong>,
    },
    {
      header: 'Descripción',
      accessor: 'descripcion',
    },
    {
      header: 'Unidad',
      accessor: 'unidad_medida',
    },
    {
      header: 'Costo ref.',
      render: (i) => i.costo_unitario_ref == null ? '—' : `$${Number(i.costo_unitario_ref).toLocaleString('es-CO')}`,
    },
    {
      header: 'Stock mínimo',
      accessor: 'stock_minimo',
    },
    { header: 'Stock actual', accessor: 'stock_actual' },
    {
      header: 'Acciones',
      render: (i) => (
        <div className="flex gap-2">
          <button className="font-semibold text-[var(--rojo-dark)]" onClick={() => setSeleccion(i)}>Movimientos</button>
          <button
            className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)] hover:bg-[#ede5dc]"
            onClick={() => onEdit(i)}
          >
            Editar
          </button>
          <button
            className="rounded-[10px] bg-transparent px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--rojo)] hover:bg-[var(--rojo-light)]"
            onClick={() => onDelete(i.id_ingrediente)}
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="mt-6">
      <DataTable
        title="Gestión de Ingredientes"
        columns={columns}
        data={ingredientes}
        emptyMessage="No hay ingredientes disponibles"
        keyExtractor={(i) => i.id_ingrediente}
        actionButton={
          <button
            className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
            onClick={onCreate}
          >
            + Nuevo Ingrediente
          </button>
        }
      />
      {seleccion && <MovimientosIngrediente ingrediente={seleccion} actualizar={actualizar} cerrar={() => setSeleccion(null)} />}
    </div>
  )
}

export default IngredientesSection