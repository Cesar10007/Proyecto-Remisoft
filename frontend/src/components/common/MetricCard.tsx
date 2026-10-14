// src/components/common/MetricCard.tsx
interface MetricCardProps {
  label: string
  value: string | number
  detail?: string
  icon?: string
  color?: 'green' | 'amber' | 'red' | 'default'
}

const colorMap = {
  green: 'text-[var(--verde)] bg-[var(--verde-light)]',
  amber: 'text-[var(--amarillo)] bg-[var(--amarillo-light)]',
  red: 'text-[var(--rojo)] bg-[var(--rojo-light)]',
  default: 'text-[var(--texto)] bg-transparent',
}

export function MetricCard({ label, value, detail, icon, color = 'default' }: MetricCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] p-6 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--texto-muted)]">{label}</span>
      <div className="my-2 flex items-baseline gap-2">
        <span className="font-['Syne'] text-3xl font-extrabold text-[var(--texto)]">{value}</span>
      </div>
      {detail && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--texto-muted)]">
          {icon && <span className={`material-symbols-outlined text-[16px] rounded p-0.5 ${colorMap[color]}`}>{icon}</span>}
          <span>{detail}</span>
        </div>
      )}
    </article>
  )
}