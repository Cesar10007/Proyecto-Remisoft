import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  fullWidth?: boolean
  children: ReactNode
}

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border-[1.5px] px-5 py-2 font-['DM_Sans'] text-sm font-medium no-underline transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"

const variantClasses = {
  primary:
    'border-[var(--rojo)] bg-[var(--rojo)] text-white hover:-translate-y-px hover:border-[var(--rojo-dark)] hover:bg-[var(--rojo-dark)]',
  outline:
    'border-[var(--borde)] bg-transparent text-[var(--texto-muted)] hover:border-[#c0b8b0] hover:bg-[#f0ebe5] hover:text-[var(--texto)]',
}

function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
