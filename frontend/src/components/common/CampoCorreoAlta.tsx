import { useEffect, useId, useRef, useState, type ChangeEventHandler } from 'react'
import { CircleAlert } from 'lucide-react'
import { CORREO_INVALIDO } from '../../utils/correoAlta'
import { InputField } from './InputField'
import './CampoCorreoAlta.css'

export function AvisoCorreoInvalido({ id }: { id?: string }) {
  return (
    <p id={id} role="alert" className="aviso-correo-invalido">
      <CircleAlert aria-hidden="true" size={20} strokeWidth={2.5} />
      {CORREO_INVALIDO}
    </p>
  )
}

interface Props {
  label: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
  rechazado: boolean
  disabled?: boolean
  placeholder?: string
}

export function CampoCorreoAlta({ rechazado, value, onChange, ...props }: Props) {
  const idAviso = useId()
  const input = useRef<HTMLInputElement>(null)
  const bloque = useRef<HTMLDivElement>(null)
  const [formatoRechazado, setFormatoRechazado] = useState<string | null>(null)
  const invalido = rechazado || formatoRechazado === value

  useEffect(() => {
    if (invalido) {
      input.current?.focus({ preventScroll: true })
      bloque.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    }
  }, [invalido])

  return (
    <div ref={bloque} className="campo-correo-alta">
      <InputField {...props} ref={input} value={value} type="email" required
        aria-invalid={invalido} aria-describedby={invalido ? idAviso : undefined}
        onInvalid={event => {
          if (event.currentTarget.validity.typeMismatch) {
            event.preventDefault()
            setFormatoRechazado(event.currentTarget.value)
            event.currentTarget.focus()
          }
        }}
        onChange={event => { setFormatoRechazado(null); onChange(event) }}
      />
      {invalido && <AvisoCorreoInvalido id={idAviso} />}
    </div>
  )
}
