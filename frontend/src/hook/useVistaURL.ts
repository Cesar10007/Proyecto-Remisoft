import { useSearchParams } from 'react-router-dom'

// Cada cambio de módulo crea una entrada de historial, sin perder los parámetros del padre.
export function useVistaURL(clave: string, inicial: string, vistas: string[]) {
  const [params, setParams] = useSearchParams()
  const leida = params.get(clave), vista = leida && vistas.includes(leida) ? leida : inicial
  function cambiar(valor: string) {
    if (valor === vista || !vistas.includes(valor)) return
    setParams(antes => {
      const p = new URLSearchParams(antes)
      if (valor === inicial) p.delete(clave); else p.set(clave, valor)
      return p
    })
  }
  return [vista, cambiar] as const
}
