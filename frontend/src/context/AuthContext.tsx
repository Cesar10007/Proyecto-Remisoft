/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [rol, setRol] = useState(() => localStorage.getItem('rol'))
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (newToken, newRol, newUser) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('rol', newRol)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setRol(newRol)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('user')
    setToken(null)
    setRol(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, rol, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)