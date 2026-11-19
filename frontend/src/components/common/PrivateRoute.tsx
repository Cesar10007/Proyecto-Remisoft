import EstadoSistema from './EstadoSistema'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
/**
 * Protege una ruta verificando que exista un token en el store de Redux.
 * Si no hay token, redirige a "/" (landing con modal de login).
 */
import type { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
  rolRequerido?: string
  rolesPermitidos?: string[]
}

function PrivateRoute({ children, rolRequerido, rolesPermitidos }: PrivateRouteProps) {
  const { token, rol, user } = useAuth()

  if (!token) return <Navigate to="/" replace />
  if (rolRequerido && rol !== rolRequerido) return <Navigate to="/" replace />
  if (rolesPermitidos && (!rol || !rolesPermitidos.includes(rol))) {
    return <Navigate to="/" replace />
  }

  return rol === 'SUPERADMIN' && !user?.id_restaurante ? children : <EstadoSistema key={token}>{children}</EstadoSistema>
}

export default PrivateRoute
