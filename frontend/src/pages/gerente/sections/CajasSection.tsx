import LibroCaja from '../components/LibroCaja'
import Button from '../../../components/common/Button'
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
          <Button size="small" variant="outline" onClick={() => onEdit(c)}>Editar</Button>
          <Button size="small" variant="ghost" onClick={() => onToggle(c.id_caja, c.estado)}>{c.estado === 'ACTIVA' ? 'Desactivar' : 'Activar'}</Button>
        </div>
      ),
    },
  ]

  return (
    <div className="mt-6">
      <LibroCaja />
      <DataTable
        title="Gestión de Cajas"
        columns={columns}
        data={cajas}
        emptyMessage="No hay cajas disponibles"
        keyExtractor={(c) => c.id_caja}
        actionButton={<Button onClick={onCreate}>+ Nueva Caja</Button>}
      />
    </div>
  )
}

export default CajasSection
