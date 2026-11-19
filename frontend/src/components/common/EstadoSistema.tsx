import { useEffect, useState, type ReactNode } from 'react'
import api from '../../api/axios'
import { useConsulta } from '../../hook/useConsulta'
import { useAuth } from '../../store/hooks'
import { mensajeError } from '../../utils/mensajeError'
import Button from './Button'

import { EVENTO_SISTEMA, type Sistema } from '../../api/sistema'

export default function EstadoSistema({ children }: { children: ReactNode }) {
  const { rol, user, logout } = useAuth()
  const { data, error, cargar } = useConsulta<Sistema>('/sistema', 5000)
  const [abriendo, setAbriendo] = useState(false), [aviso, setAviso] = useState('')
  useEffect(() => {
    window.addEventListener(EVENTO_SISTEMA, cargar)
    return () => window.removeEventListener(EVENTO_SISTEMA, cargar)
  }, [cargar])
  async function abrir() {
    if (!data || abriendo) return
    setAbriendo(true); setAviso('')
    try { await api.post('/sistema/abrir', { version_sistema: data.version_sistema }) }
    catch (e) { setAviso(mensajeError(e)) }
    finally { await cargar(); setAbriendo(false) }
  }
  if (data?.sistema_abierto && !error) return children
  return <main className="mx-auto grid min-h-screen max-w-xl content-center gap-4 p-6">
    <p className="text-sm font-semibold text-[var(--texto-muted)]">{user?.nombre_establecimiento || 'RemiSoft'}</p>
    {!data || error ? <>
      <h1 className="text-2xl font-bold">Estado del sistema</h1>
      {error ? <p role="alert">{error}</p> : <p role="status">Consultando el establecimiento…</p>}
    </> : <>
      <h1 className="text-2xl font-bold">Sistema cerrado</h1>
      {rol === 'GERENTE' && <p role="status">cierre de sistema exitoso</p>}
      <p>Las operaciones de este establecimiento están suspendidas hasta que el gerente abra el sistema.</p>
      {rol === 'GERENTE' && <Button disabled={abriendo} onClick={abrir}>{abriendo ? 'Abriendo…' : 'Abrir sistema'}</Button>}
    </>}
    {aviso && <p role="alert">{aviso}</p>}
    <div className="flex flex-wrap gap-3"><Button variant="outline" onClick={cargar}>Actualizar estado</Button><Button variant="ghost" onClick={logout}>Cerrar sesión</Button></div>
  </main>
}
