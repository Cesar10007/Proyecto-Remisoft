import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { actualizarSede } from '../../store/authSlice'
import { useAppDispatch, useAuth } from '../../store/hooks'
import { mensajeError } from '../../utils/mensajeError'

type Sede = { id_restaurante: number; nombre: string }

// Selector de sede del gerente multisede. Solo aparece si el usuario pertenece a
// más de un establecimiento: para un gerente de una sola sede la interfaz no cambia.
// El cambio es persistente (PATCH /usuarios/me/sede) y luego se recarga la página
// para que todas las consultas se rehagan con la sede nueva.
export default function SelectorSede() {
  const { rol, user } = useAuth()
  const dispatch = useAppDispatch()
  const [sedes, setSedes] = useState<Sede[]>([])
  const [cambiando, setCambiando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (rol !== 'GERENTE') return
    let vigente = true
    api
      .get('/usuarios/mis-sedes')
      .then(({ data }) => {
        if (vigente) setSedes(Array.isArray(data?.data) ? data.data : [])
      })
      .catch(() => {
        if (vigente) setSedes([])
      })
    return () => {
      vigente = false
    }
  }, [rol])

  if (rol !== 'GERENTE' || sedes.length < 2) return null

  async function cambiar(idRestaurante: number) {
    if (cambiando || idRestaurante === user?.id_restaurante) return
    setCambiando(true)
    setError('')
    try {
      const { data } = await api.patch('/usuarios/me/sede', { id_restaurante: idRestaurante })
      dispatch(
        actualizarSede({
          id_restaurante: data.id_restaurante,
          nombre_establecimiento: data.nombre_establecimiento ?? null,
        }),
      )
      window.location.reload()
    } catch (err) {
      setError(mensajeError(err))
      setCambiando(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="selector-sede" className="sr-only">
        Establecimiento activo
      </label>
      <select
        id="selector-sede"
        value={user?.id_restaurante ?? ''}
        disabled={cambiando}
        onChange={(evento) => void cambiar(Number(evento.target.value))}
        title="Cambia el establecimiento con el que estás trabajando."
        className="h-[38px] max-w-[200px] rounded-full border border-[var(--borde)] bg-[var(--bg-card)] px-3 text-[0.82rem] font-medium text-[var(--texto)]"
      >
        {sedes.map((sede) => (
          <option key={sede.id_restaurante} value={sede.id_restaurante}>
            {sede.nombre}
          </option>
        ))}
      </select>
      {cambiando && <span className="text-[0.75rem] text-[var(--texto-muted)]">Cambiando…</span>}
      {error && (
        <p role="alert" className="max-w-[220px] text-[0.75rem] text-[var(--rojo)]">
          {error}
        </p>
      )}
    </div>
  )
}
