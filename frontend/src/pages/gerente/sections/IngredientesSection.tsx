import { useState } from 'react'
import Button from '../../../components/common/Button'
import EditorIngrediente from '../components/EditorIngrediente'
import MovimientosIngrediente from '../components/MovimientosIngrediente'
import type { Ingrediente, IngredienteConStock } from '../types'
import { cantidadConUnidad, codigoUnidad, unidadConocida } from '../../../utils/unidadesInventario'
import { DataTable, Column } from '../../../components/common/DataTable'

interface IngredientesSectionProps {
  ingredientes: IngredienteConStock[]
  actualizar: () => Promise<void>
  onDelete: (id: number) => void
}

function IngredientesSection({ ingredientes, actualizar, onDelete }: IngredientesSectionProps) {
  const [editor, setEditor] = useState<IngredienteConStock | 'nuevo' | null>(null)
  const [aviso, setAviso] = useState('')
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
      render: (i) => unidadConocida(i.unidad_medida)?.nombre || codigoUnidad(i.unidad_medida) || 'Sin unidad',
    },
    {
      header: 'Costo por unidad',
      render: (i) => i.costo_unitario_ref == null ? '—' : `$${Number(i.costo_unitario_ref).toLocaleString('es-CO')}`,
    },
    {
      header: 'Stock mínimo',
      render: (i) => i.stock_minimo == null ? '—' : cantidadConUnidad(i.stock_minimo, i.unidad_medida),
    },
    { header: 'Stock actual', render: (i) => cantidadConUnidad(i.stock_actual, i.unidad_medida) },
    {
      header: 'Acciones',
      render: (i) => (
        <div className="flex gap-2">
          <button aria-description={`Consulta el saldo o registra una entrada o salida de ${i.nombre}.`} className="font-semibold text-[var(--rojo-dark)]" onClick={() => setSeleccion(i)}>Movimientos</button>
          <Button aria-description={`Abre la ficha de ${i.nombre} para modificarla.`} size="small" variant="outline" onClick={() => setEditor(i)}>Editar</Button>
          <button
            aria-description={`Solicita eliminar ${i.nombre} del inventario.`}
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
      {aviso && <p role="alert" className="mb-3 text-sm text-[var(--rojo-dark)]">{aviso}</p>}
      <DataTable
        title="Gestión de Ingredientes"
        columns={columns}
        data={ingredientes}
        emptyMessage="No hay ingredientes disponibles"
        keyExtractor={(i) => i.id_ingrediente}
        actionButton={<Button aria-description="Abre el formulario para registrar un ingrediente." onClick={() => setEditor('nuevo')}>+ Nuevo Ingrediente</Button>}
      />
      {editor && <EditorIngrediente ingrediente={editor === 'nuevo' ? null : editor} actualizar={actualizar}
        cerrar={mensaje => { setEditor(null); setAviso(mensaje ?? '') }} />}
      {seleccion && <MovimientosIngrediente ingrediente={seleccion} actualizar={actualizar} cerrar={() => setSeleccion(null)} />}
    </div>
  )
}

export default IngredientesSection
