import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './index.css'
import './styles/tema-oscuro.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { aplicarTema, temaGuardado } from './utils/tema'

aplicarTema(temaGuardado())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)