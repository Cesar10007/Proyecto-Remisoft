import { useEffect } from 'react'
import api from '../api/axios'

// Una sola espera autenticada por panel. El servidor responde al confirmar una escritura.
// No mantenemos conexiones en segundo plano; useConsulta también resincroniza periódicamente.
export function useCambiosSede() {
  useEffect(() => {
    let version = '', timer: number, peticion: AbortController | undefined, cerrado = false
    async function escuchar() {
      if (cerrado || document.hidden || peticion) return
      const ctl = new AbortController(); peticion = ctl
      let pausa = 150
      try {
        const { data } = await api.get<{ version: string }>('/historial/cambios', { params: { version }, signal: ctl.signal, timeout: 27000 })
        if (!ctl.signal.aborted && data.version && data.version !== version) {
          version = data.version
          window.dispatchEvent(new Event('remisoft:actividad'))
        }
      } catch { pausa = 5000 }
      finally {
        peticion = undefined
        if (!cerrado && !document.hidden) timer = window.setTimeout(escuchar, pausa)
      }
    }
    const visibilidad = () => { window.clearTimeout(timer); if (document.hidden) peticion?.abort(); else void escuchar() }
    void escuchar(); document.addEventListener('visibilitychange', visibilidad)
    return () => { cerrado = true; window.clearTimeout(timer); peticion?.abort(); document.removeEventListener('visibilitychange', visibilidad) }
  }, [])
}
