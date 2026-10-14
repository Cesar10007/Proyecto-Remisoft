import type { Proveedor } from '../types'
import { DataTable, Column } from '../../../components/common/DataTable'
import { Badge } from '../../../components/common/Badge'

interface ProveedoresSectionProps {
  proveedores: Proveedor[]
  onCreate: () => void
  onEdit: (proveedor: Proveedor) => void
  onToggle: (id: number, estado: string) => void
}

function ProveedoresSection({ proveedores, onCreate, onEdit, onToggle }: ProveedoresSectionProps) {
  const columns: Column<Proveedor>[] = [
    {
      header: 'Nombre',
      render: (p) => <strong>{p.nombre}</strong>,
    },
    {
      header: 'Contacto',
      accessor: 'nombre_contacto',
    },
    {
      header: 'Teléfono',
      accessor: 'telefono',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Tipo',
      accessor: 'tipo_proveedor',
    },
    {
      header: 'Estado',
      render: (p) => (
        <Badge
          status={p.estado === 'ACTIVO' ? 'active' : 'inactive'}
          label={p.estado}
        />
      ),
    },
    {
      header: 'Acciones',
      render: (p) => (
        <div className="flex gap-2">
          <button
            className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)] hover:bg-[#ede5dc]"
            onClick={() => onEdit(p)}
          >
            Editar
          </button>
          <button
            className="rounded-[10px] px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--texto-muted)] hover:bg-[#f2ece6]"
            onClick={() => onToggle(p.id_proveedor, p.estado)}
          >
            {p.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="mt-6">
      <DataTable
        title="Gestión de Proveedores"
        columns={columns}
        data={proveedores}
        emptyMessage="No hay proveedores disponibles"
        keyExtractor={(p) => p.id_proveedor}
        actionButton={
          <button
            className="rounded-[10px] bg-[var(--rojo)] px-4 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white transition-opacity hover:opacity-90"
            onClick={onCreate}
          >
            + Nuevo Proveedor
          </button>
        }
      />
    </div>
  )
}

export default ProveedoresSection