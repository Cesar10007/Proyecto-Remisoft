// src/components/common/InputField.tsx
import { useId, type InputHTMLAttributes } from 'react'

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function InputField({ label, error, className = '', ...props }: InputFieldProps) {
  const generatedId = useId()
  const inputId = props.id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-xs font-semibold text-[var(--texto-muted)]">{label}</label>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`w-full rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--texto)] outline-none transition-colors focus:border-[var(--rojo)] ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span id={errorId} className="text-xs text-red-500">{error}</span>}
    </div>
  )
}