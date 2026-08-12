import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'   // ← nuevo: reset + variables, va PRIMERO
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)