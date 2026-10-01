import { Navigate, type ReactNode } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

type PrivateRouteProps = {
  children: ReactNode
  rolRequerido?: string
}

export default function PrivateRoute({ children, rolRequerido }: PrivateRouteProps) {
  const { token, rol } = useAuth()

  if (!token) return <Navigate to="/" replace />
  if (rolRequerido && rol !== rolRequerido) return <Navigate to="/" replace />

  return <>{children}</>
}
