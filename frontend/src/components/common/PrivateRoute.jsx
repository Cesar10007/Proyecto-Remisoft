import { Navigate } from 'react-router-dom'

/**
 * Protege una ruta verificando que exista un token en localStorage.
 * Si no hay token, redirige a "/" (landing con modal de login).
 */
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute