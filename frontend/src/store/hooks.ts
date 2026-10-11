import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'
import { clearCredentials, setCredentials, type AuthUser } from './authSlice'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// Misma forma que el antiguo AuthContext: { token, rol, user, login, logout }.
// La fuente de verdad es el slice auth de Redux.
export function useAuth() {
  const dispatch = useAppDispatch()
  const { token, rol, user } = useAppSelector((state) => state.auth)

  const login = (newToken: string, newRol: string, newUser: AuthUser) =>
    dispatch(setCredentials({ token: newToken, rol: newRol, user: newUser }))

  const logout = () => dispatch(clearCredentials())

  return { token, rol, user, login, logout }
}
