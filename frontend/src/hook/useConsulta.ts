import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import { mensajeError } from '../utils/mensajeError'

// La última respuesta gana, también al cambiar de vista, volver de cocina o guardar.
export function useConsulta<T>(url: string | null, intervalo?: number) {
  const actual = useRef<AbortController | null>(null)
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [hora, setHora] = useState<Date | null>(null)
  const cargar = useCallback(async () => {
    actual.current?.abort()
    if (!url) return
    const ctl = new AbortController()
    actual.current = ctl
    setCargando(true)
    try {
      const r = await api.get<T>(url, { signal: ctl.signal, timeout: 20000 })
      if (!ctl.signal.aborted) {
        setData(r.data)
        setError('')
        setHora(new Date())
      }
    } catch (e) {
      if (!ctl.signal.aborted) setError(mensajeError(e))
    } finally {
      if (!ctl.signal.aborted) {
        setCargando(false)
        actual.current = null
      }
    }
  }, [url])
  useEffect(() => {
    setData(null)
    setError('')
    if (!url) return
    void cargar()
    const visible = () => {
      if (!document.hidden && !actual.current) void cargar()
    }
    const timer = intervalo ? window.setInterval(visible, intervalo) : undefined
    if (intervalo) document.addEventListener('visibilitychange', visible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', visible)
      actual.current?.abort()
    }
  }, [url, cargar, intervalo])
  return { data, error, cargando, hora, cargar }
}
