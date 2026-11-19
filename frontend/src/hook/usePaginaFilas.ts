import { useState } from 'react'

export const FILAS_POR_PAGINA = 25
export function usePaginaFilas<T>(datos: T[]) {
  const [solicitada, cambiar] = useState(1)
  const paginas = Math.max(1, Math.ceil(datos.length / FILAS_POR_PAGINA))
  const pagina = Math.min(solicitada, paginas), inicio = (pagina - 1) * FILAS_POR_PAGINA
  return { filas: datos.slice(inicio, inicio + FILAS_POR_PAGINA), inicio, pagina, paginas, cambiar }
}
