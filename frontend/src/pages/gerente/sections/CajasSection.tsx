import type { Caja } from '../types'
import { DataTable, Column } from '../../../components/common/DataTable'
import { Badge } from '../../../components/common/Badge'

interface CajasSectionProps {
  cajas: Caja[]
  onCreate: () => void
  onEdit: (caja: Caja) => void
  onToggle: (id: number, estado: string) => void
}

function CajasSection({ cajas, onCreate, onEdit, onToggle }: CajasSectionProps) {
  const columns: Column<Caja>[] = [
    {
      header: 'Nombre',
      render: (c) => <strong>{c.nombre}</strong>,
    },
    {
      header: 'Estado',
      render: (c) => (
        <Badge
          status={c.estado === 'ACTIVA' ? 'active' : 'inactive'}
          label={c.estado}
        />
      ),
    },
    {
      header: 'Acciones',
      render: (c) => (
        <div className="flex gap-2">
          <button
            className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)] hover:bg-[#ede5dc]"
            onClick={() => onEdit(c)}
          >
            Editar
          </button>
          <button
            className="rounded-[10px] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)] hover:bg-[#f2ece6]"
            onClick={() => onToggle(c.id_caja, c.estado)}
          >
            {c.estado === 'ACTIVA' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="mt-6">
      <DataTable
        title="Gestión de Cajas"
        columns={columns}
        data={cajas}
        emptyMessage="No hay cajas disponibles"
        keyExtractor={(c) => c.id_caja}
        actionButton={
          <button
            className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
            onClick={onCreate}
          >
            + Nueva Caja
          </button>
        }
      />
    </div>
  )
}

export default CajasSection