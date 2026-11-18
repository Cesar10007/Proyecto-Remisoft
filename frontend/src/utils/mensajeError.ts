export function mensajeError(err: unknown) {
  const data = (
    err as {
      response?: {
        data?: {
          message?: string
          detalles?: {
            id_ingrediente: number
            nombre?: string
            unidad_medida?: string
            requerido: number
            disponible: number
          }[]
        }
      }
    }
  )?.response?.data
  if (data?.detalles?.length)
    return (
      'Stock insuficiente. ' +
      data.detalles
        .map(
          (d) =>
            `${d.nombre || `Ingrediente ${d.id_ingrediente}`}: se necesitan ${d.requerido} ${d.unidad_medida ?? ''} y hay ${d.disponible}.`,
        )
        .join(' ')
    )
  return data?.message || 'No se pudo conectar con el servidor. Revisa la conexión e inténtalo de nuevo.'
}
