import { MetricCard } from '../../../components/common/MetricCard'
import { DataTable, Column } from '../../../components/common/DataTable'

interface Transaccion {
  fecha: string
  concepto: string
  categoria: string
  monto: string
  positivo: boolean
}

interface FinanzasSectionProps {
  stats: { icon: string; label: string; valor: string; badge: string; badgeColor: string }[]
  transacciones: Transaccion[]
}

function FinanzasSection({ stats, transacciones }: FinanzasSectionProps) {
  const columns: Column<Transaccion>[] = [
    {
      header: 'Fecha',
      render: (t) => <span className="text-[var(--texto-muted)]">{t.fecha}</span>,
    },
    {
      header: 'Concepto',
      accessor: 'concepto',
    },
    {
      header: 'Categoría',
      render: (t) => <span className="text-[var(--texto-muted)]">{t.categoria}</span>,
    },
    {
      header: 'Monto',
      render: (t) => (
        <span className={`font-semibold ${t.positivo ? 'text-[var(--verde)]' : 'text-[var(--rojo)]'}`}>
          {t.positivo ? '+' : '-'}{t.monto}
        </span>
      ),
    },
  ]

  const colorMap: Record<string, 'green' | 'red' | 'default'> = {
    verde: 'green',
    rojo: 'red',
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.valor}
            detail={m.badge}
            icon={m.icon}
            color={colorMap[m.badgeColor] || 'default'}
          />
        ))}
      </section>

      <div className="mt-6">
        <DataTable
          title="Transacciones recientes"
          columns={columns}
          data={transacciones}
          emptyMessage="No hay transacciones recientes"
        />
      </div>
    </>
  )
}

export default FinanzasSection