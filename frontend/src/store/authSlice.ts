import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  rol: string | null
  user: { nombre: string; email: string } | null
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

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
