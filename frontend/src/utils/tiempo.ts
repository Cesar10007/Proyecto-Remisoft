/**
 * Texto con el tiempo transcurrido desde una fecha ISO:
 * "12 min" si es menos de una hora, "3 h" si es menos de un día,
 * y "28 días" en otro caso.
 */
export function tiempoTranscurrido(fecha: string): string {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(fecha).getTime()) / 60000))

  if (minutos < 60) return `${minutos} min`

  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `${horas} h`

  const dias = Math.floor(horas / 24)
  return `${dias} ${dias === 1 ? 'día' : 'días'}`
}
