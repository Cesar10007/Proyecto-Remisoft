import axios from 'axios'
import { store } from '../store/store'
import { clearCredentials } from '../store/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

// Interceptor: agrega el token de Redux a cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta: si el backend responde 401, la sesión ya no es válida.
// Se cierra sesión y se vuelve a la landing. El login (credenciales incorrectas) no cuenta.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = String(error?.config?.url ?? '').includes('/auth/login')
    if (error?.response?.status === 401 && !esLogin) {
      store.dispatch(clearCredentials())
      if (window.location.pathname !== '/') window.location.assign('/')
    }
    return Promise.reject(error)
  },
)

export default api
