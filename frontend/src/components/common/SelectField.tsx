import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  children: ReactNode
  containerClassName?: string
}

export function SelectField({
  label,
  error,
  className = '',
  children,
  containerClassName = '',
  ...props
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = props.id ?? generatedId
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      <label htmlFor={selectId} className="text-xs font-semibold text-[var(--texto-muted)]">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--texto)] outline-none focus:border-[var(--rojo)] ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span id={errorId} className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
