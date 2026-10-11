import { useEffect, useState } from 'react'
import { cambiarTema, escucharTema, temaGuardado, type Tema } from '../../utils/tema'
import './ThemeToggle.css'

interface ThemeToggleProps {
  // flotante: se fija arriba a la izquierda (paginas sin barra lateral)
  flotante?: boolean
}

function ThemeToggle({ flotante = false }: ThemeToggleProps) {
  const [tema, setTema] = useState<Tema>(temaGuardado)

  useEffect(() => escucharTema(setTema), [])

  const oscuro = tema === 'dark'
  const etiqueta = oscuro ? 'Modo claro' : 'Modo oscuro'

  return (
    <button
      type="button"
      className={`tema-toggle${flotante ? ' tema-toggle--flotante' : ''}`}
      onClick={() => cambiarTema(oscuro ? 'light' : 'dark')}
      aria-pressed={oscuro}
      aria-label={etiqueta}
      title={etiqueta}
    >
      <span className="material-symbols-outlined tema-toggle__icono" aria-hidden="true">
        {oscuro ? 'light_mode' : 'dark_mode'}
      </span>
      <span className="tema-toggle__texto">{etiqueta}</span>
    </button>
  )
}

export default ThemeToggle
