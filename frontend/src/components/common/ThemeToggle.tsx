import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { cambiarTema, escucharTema, temaGuardado, type Tema } from '../../utils/tema'
import './ThemeToggle.css'

interface ThemeToggleProps {
  // flotante: se fija arriba a la izquierda (paginas sin barra lateral)
  flotante?: boolean
  // compacto: solo icono en escritorio (menu lateral plegado)
  compacto?: boolean
}

function ThemeToggle({ flotante = false, compacto = false }: ThemeToggleProps) {
  const [tema, setTema] = useState<Tema>(temaGuardado)

  useEffect(() => escucharTema(setTema), [])

  const oscuro = tema === 'dark'
  const etiqueta = oscuro ? 'Modo claro' : 'Modo oscuro'

  return (
    <button
      aria-description={oscuro ? 'Cambia al tema claro.' : 'Cambia al tema oscuro.'}
      type="button"
      className={`tema-toggle${flotante ? ' tema-toggle--flotante' : ''}${compacto ? ' tema-toggle--compacto' : ''}`}
      onClick={() => cambiarTema(oscuro ? 'light' : 'dark')}
      aria-pressed={oscuro}
      aria-label={etiqueta}
    >
      {oscuro ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
      <span className="tema-toggle__texto">{etiqueta}</span>
    </button>
  )
}

export default ThemeToggle
