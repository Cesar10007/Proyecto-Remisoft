import { useState } from 'react'
import Button from '../../../components/common/Button'
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
          <Button size="small" variant="outline" onClick={() => onEdit(i)}>Editar</Button>
          <button
            className="rounded-[10px] bg-transparent px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--rojo-dark)] hover:bg-[var(--rojo-light)]"
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
        actionButton={<Button onClick={onCreate}>+ Nuevo Ingrediente</Button>}
      />
      {seleccion && <MovimientosIngrediente ingrediente={seleccion} actualizar={actualizar} cerrar={() => setSeleccion(null)} />}
    </div>
  )
}

export default IngredientesSection
