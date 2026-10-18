import { useId, type TextareaHTMLAttributes } from 'react'

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function TextAreaField({
  label,
  error,
  className = '',
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const textareaId = props.id ?? generatedId
  const errorId = error ? `${textareaId}-error` : undefined

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={textareaId} className="text-xs font-semibold text-[var(--texto-muted)]">
        {label}
      </label>
      <textarea
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`w-full resize-y rounded-[10px] border-[1.5px] border-[var(--borde)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--texto)] outline-none focus:border-[var(--rojo)] ${className}`}
        {...props}
      />
      {error && <span id={errorId} className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
