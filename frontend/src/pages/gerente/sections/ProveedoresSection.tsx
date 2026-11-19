import Button from '../../../components/common/Button'
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
          <Button aria-description={`Abre la ficha de ${p.nombre} para modificarla.`} size="small" variant="outline" onClick={() => onEdit(p)}>Editar</Button>
          <Button aria-description={p.estado === 'ACTIVO' ? 'Marca al proveedor como inactivo.' : 'Vuelve a activar al proveedor.'} size="small" variant="ghost" onClick={() => onToggle(p.id_proveedor, p.estado)}>{p.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</Button>
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
        actionButton={<Button aria-description="Abre el formulario para registrar un proveedor." onClick={onCreate}>+ Nuevo Proveedor</Button>}
      />
    </div>
  )
}

export default ProveedoresSection
