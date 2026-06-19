import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
/**
 * Protege una ruta verificando que exista un token en localStorage.
 * Si no hay token, redirige a "/" (landing con modal de login).
 */
function PrivateRoute({ children, rolRequerido }) {
  const { token, rol } = useAuth()

  if (!token) return <Navigate to="/" replace />
  if (rolRequerido && rol !== rolRequerido) return <Navigate to="/" replace />

  return children
}

export default PrivateRoute