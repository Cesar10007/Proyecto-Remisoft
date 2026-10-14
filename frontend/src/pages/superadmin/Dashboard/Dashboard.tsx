import { useFetch } from '../../../hook/useFetch'
import { MetricCard } from '../../../components/common/MetricCard'
import { DataTable, Column } from '../../../components/common/DataTable'
import { Badge } from '../../../components/common/Badge'
import './Dashboard.css'

interface Usuario {
  id_usuario: number
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  activo: number
  rol?: string
  id_rol?: number
}

const metricasBase = [
  {
    label: 'Gerentes activos',
    detail: 'Datos obtenidos del sistema',
    icon: 'group',
    color: 'green' as const,
  },
  {
    label: 'Solicitudes pendientes',
    detail: 'Pendientes de revisión',
    icon: undefined,
    color: 'amber' as const,
  },
  {
    label: 'Tiempo de actividad del sistema',
    detail: 'Estado del servicio',
    icon: 'check_circle',
    color: 'green' as const,
  },
  {
    label: 'Respuesta de API',
    detail: 'Latencia no disponible',
    icon: undefined,
    color: 'default' as const,
  },
]

function Dashboard() {
  const { data: usuarios, isLoading: cargando, error } = useFetch<Usuario>('/usuarios')

  const gerentes = usuarios.filter(
    (usuario) =>
      usuario.activo &&
      (usuario.id_rol === 2 || usuario.rol?.toUpperCase() === 'GERENTE'),
  )

  const metricas = metricasBase.map((metrica, index) => ({
    ...metrica,
    value: index === 0 ? (cargando ? '—' : gerentes.length) : '—',
  }))

  const columns: Column<Usuario>[] = [
    {
      header: 'Usuario',
      render: (gerente) => (
        <div className="sa-user-cell">
          <div className="sa-user-avatar-wrap">
            {gerente.nombre?.[0]?.toUpperCase() ?? 'G'}
          </div>
          <div>
            <p className="sa-user-name">
              {gerente.nombre} {gerente.apellido ?? ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Teléfono',
      render: (gerente) => gerente.telefono ?? '—',
    },
    {
      header: 'Estado',
      render: () => <Badge status="active" label="Activo" />,
    },
  ]

  return (
    <section className="sa-dashboard flex flex-col gap-8">
      <div className="sa-metrics-grid">
        {metricas.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 text-sm text-red-500">
          {error}
        </div>
      ) : (
        <DataTable
          title="Gerentes activos"
          columns={columns}
          data={gerentes}
          isLoading={cargando}
          emptyMessage="No hay gerentes activos registrados."
          keyExtractor={(row) => row.id_usuario}
        />
      )}
    </section>
  )
}

export default Dashboard