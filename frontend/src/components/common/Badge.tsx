// src/components/common/Badge.tsx
interface BadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'warning'
  label: string
}

const styles = {
  active: 'bg-[var(--verde-light)] text-[var(--t-txt-0f6e56,#0f6e56)] border-[var(--t-brd-bbf0dc,#bbf0dc)]',
  inactive: 'bg-[var(--rojo-light)] text-[var(--texto-acento)] border-[var(--t-brd-f7c2b5,#f7c2b5)]',
  pending: 'bg-[var(--amarillo-light)] text-[var(--t-txt-854f0b,#854f0b)] border-[var(--t-brd-fde5bc,#fde5bc)]',
  warning: 'bg-[var(--amarillo-light)] text-[var(--t-txt-854f0b,#854f0b)] border-[var(--t-brd-fde5bc,#fde5bc)]',
}

export function Badge({ status, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}