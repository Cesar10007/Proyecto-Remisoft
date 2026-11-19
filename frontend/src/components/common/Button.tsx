import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'success'
  size?: 'normal' | 'small'
  fullWidth?: boolean
  children: ReactNode
}

export default function Button({
  variant = 'primary', size = 'normal', fullWidth = false,
  className = '', children, type = 'button', ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`app-button app-button--${variant} ${size === 'small' ? 'app-button--small' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
