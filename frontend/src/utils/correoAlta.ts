import type { AxiosError } from 'axios'
import { mensajeError } from './mensajeError'

export const CORREO_INVALIDO = 'Correo inválido, ingrese otro.'

type ErrorApi = { message?: string; code?: string; errors?: Record<string, unknown> }

// Solo para guardar cuentas o aprobar su registro. Versiones anteriores respondían
// 409 con el motivo en texto o un código de duplicado. Nunca pintar ese detalle.
export function mensajeErrorAlta(err: unknown): string {
  const respuesta = (err as AxiosError<ErrorApi>)?.response
  if (!respuesta?.data) return mensajeError(err)
  const { data, status } = respuesta
  const mensaje = data.message ?? ''
  // El middleware anterior podía omitir el nombre de la clave. No confundir
  // una clave de otro campo ni una solicitud ya revisada con un error de correo.
  const claveSinCampo = status === 409 && data.code === 'DUPLICATE_ENTRY' &&
    (!mensaje || /^Ya existe un registro con ese campo\.?$/i.test(mensaje))
  if (data.code === 'DUPLICATE_EMAIL' || claveSinCampo || (
    [400, 409, 422].includes(status) && (data.errors?.email || data.errors?.Email || /correo|e-?mail/i.test(mensaje))
  )) return CORREO_INVALIDO
  return mensajeError(err)
}
