import { createContext, useContext, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [rol, setRol] = useState(() => localStorage.getItem('rol'))

  const login = (newToken, newRol) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('rol', newRol)
    setToken(newToken)
    setRol(newRol)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    setToken(null)
    setRol(null)
  }

  return (
    <AuthContext.Provider value={{ token, rol, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)