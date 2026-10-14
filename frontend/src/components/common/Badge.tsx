// src/components/common/Badge.tsx
interface BadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'warning'
  label: string
}

const styles = {
  active: 'bg-[var(--verde-light)] text-[var(--verde)] border-[#bbf0dc]',
  inactive: 'bg-[var(--rojo-light)] text-[var(--rojo)] border-[#f7c2b5]',
  pending: 'bg-[var(--amarillo-light)] text-[var(--amarillo)] border-[#fde5bc]',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
}

export function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}