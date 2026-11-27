import { MetricCard } from '../../../components/common/MetricCard'
import { DataTable, Column } from '../../../components/common/DataTable'
import Button from '../../../components/common/Button'
import { Download } from 'lucide-react'
import { descargarExcel } from '../../../utils/excel'

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

// "$ 391.750" o "334.250" -> numero. El signo sale del texto o del campo positivo.
function aNumero(texto: string, positivo = true): number {
  const digitos = Number(String(texto).replace(/[^0-9]/g, ''))
  const valor = Number.isFinite(digitos) ? digitos : 0
  const limpio = String(texto).trim()
  const negativo = !positivo || limpio.startsWith('-') || limpio.charCodeAt(0) === 0x2212
  return negativo ? -valor : valor
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

  // Arma el libro de Excel con lo mismo que se ve en pantalla.
  function exportar() {
    const ahora = new Date()
    const filas: (string | number)[][] = []
    const negrita: number[] = []

    const agregar = (fila: (string | number)[], fuerte = false) => {
      if (fuerte) negrita.push(filas.length)
      filas.push(fila)
    }

    agregar(['RemiSoft - Finanzas'], true)
    agregar([`Generado el ${ahora.toLocaleDateString('es-CO')} ${ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`])
    agregar([])
    agregar(['Resumen del mes'], true)
    agregar(['Concepto', 'Valor', 'Detalle'], true)
    stats.forEach((s) => agregar([s.label, aNumero(s.valor), s.badge]))
    agregar([])
    agregar(['Transacciones recientes'], true)
    agregar(columns.map((c) => c.header), true)
    transacciones.forEach((t) => agregar([t.fecha, t.concepto, t.categoria, aNumero(t.monto, t.positivo)]))
    agregar([])
    agregar(
      [
        'Total transacciones',
        transacciones.length,
        '',
        transacciones.reduce((suma, t) => suma + aNumero(t.monto, t.positivo), 0),
      ],
      true,
    )

    descargarExcel(`finanzas-${ahora.toISOString().slice(0, 10)}.xlsx`, [
      { nombre: 'Finanzas', filas, anchos: [30, 52, 20, 16], negrita },
    ])
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
          actionButton={
            <Button
              variant="outline"
              size="small"
              onClick={exportar}
              aria-description="Descarga el resumen y las transacciones en un archivo de Excel."
            >
              <span className="inline-flex items-center gap-2"><Download size={15} /> Descargar Excel</span>
            </Button>
          }
          columns={columns}
          data={transacciones}
          emptyMessage="No hay transacciones recientes"
        />
      </div>
    </>
  )
}

export default FinanzasSection