import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Datos del usuario que devuelve /api/auth/login. Los campos extra son los que usan las páginas.
export type AuthUser = {
  id_usuario?: number
  id_rol?: number
  id_restaurante?: number | null
  nombre_establecimiento?: string | null
  nombre: string
  apellido?: string
  email: string
  [campo: string]: unknown
} | null

interface AuthState {
  token: string | null
  rol: string | null
  user: AuthUser
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  rol: localStorage.getItem('rol'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; rol: string; user: AuthState['user'] }>) {
      state.token = action.payload.token
      state.rol = action.payload.rol
      state.user = action.payload.user
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('rol', action.payload.rol)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    // Cambio de sede activa (gerente multisede). El backend ya lo persistió;
    // aquí solo se refleja para que la interfaz y el estado local coincidan.
    actualizarSede(
      state,
      action: PayloadAction<{ id_restaurante: number; nombre_establecimiento: string | null }>,
    ) {
      if (!state.user) return
      state.user = {
        ...state.user,
        id_restaurante: action.payload.id_restaurante,
        nombre_establecimiento: action.payload.nombre_establecimiento,
      }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    clearCredentials(state) {
      state.token = null
      state.rol = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('rol')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, clearCredentials, actualizarSede } = authSlice.actions
export default authSlice.reducer
