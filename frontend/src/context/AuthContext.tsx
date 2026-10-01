/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

export interface AuthUser {
  id_usuario?: number
  nombre?: string
  apellido?: string
  email?: string
  [key: string]: unknown
}

export interface AuthContextValue {
  token: string | null
  rol: string | null
  user: AuthUser | null
  login: (newToken: string, newRol: string, newUser: AuthUser) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [rol, setRol] = useState<string | null>(() => localStorage.getItem('rol'))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('user')
    if (!saved) return null
    try {
      return JSON.parse(saved) as AuthUser
    } catch {
      return null
    }
  })

  const login = (newToken: string, newRol: string, newUser: AuthUser) => {
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

  return <AuthContext.Provider value={{ token, rol, user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
