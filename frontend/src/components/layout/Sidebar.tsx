import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { ChevronLeft, LogOut, Menu, X } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'

export interface SidebarMenuItem {
  icon: ReactElement
  label: string
  badge?: number
}

interface SidebarProps {
  subtitulo: string
  menuItems: SidebarMenuItem[]
  vistaActual: string
  onNavigate: (vista: string) => void
  onLogout: () => void
  // Botones propios de cada panel (por ejemplo "Cerrar Caja" en Gerente).
  footer?: ReactNode
  // Permite plegar el menú a iconos (escritorio). Por defecto está activo en todos los paneles.
  colapsable?: boolean
}

// Menú lateral compartido por los paneles.
// Escritorio: columna fija a la izquierda del contenido (puede contraerse si es colapsable).
// Celular: barra superior con modo oscuro y menú, que abre un cajón.
const CLAVE_PLEGADO = 'remisoft-sidebar'
// El nombre con hash viene del JS que ejecuta esta pestaña, no del HEAD local.
const versionInterfaz = import.meta.env.DEV ? 'Vite (desarrollo)' : new URL(import.meta.url).pathname.split('/').pop()

function Sidebar({
  subtitulo,
  menuItems,
  vistaActual,
  onNavigate,
  onLogout,
  footer,
  colapsable = true,
}: SidebarProps) {
  const [abierto, setAbierto] = useState(false)
  const idMenu = useId()
  const cerrarMovil = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!abierto) return
    const origen = document.activeElement
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cerrarMovil.current?.focus()
    const pantalla = window.matchMedia('(min-width: 768px)')
    const cerrarEnEscritorio = () => {
      if (pantalla.matches) setAbierto(false)
    }
    pantalla.addEventListener('change', cerrarEnEscritorio)
    return () => {
      pantalla.removeEventListener('change', cerrarEnEscritorio)
      document.body.style.overflow = previo
      if (origen instanceof HTMLElement && origen.isConnected) origen.focus({ preventScroll: true })
    }
  }, [abierto])
  const [colapsado, setColapsado] = useState<boolean>(
    () => colapsable && localStorage.getItem(CLAVE_PLEGADO) === 'plegado',
  )

  useEffect(() => {
    if (colapsable) localStorage.setItem(CLAVE_PLEGADO, colapsado ? 'plegado' : 'desplegado')
  }, [colapsado, colapsable])
  const compacto = colapsable && colapsado

  const navegar = (vista: string) => {
    onNavigate(vista)
    setAbierto(false)
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[90] flex h-14 items-center justify-between border-b border-[var(--borde)] bg-[var(--bg-card)] px-3 md:hidden">
        <ThemeToggle />
        <span className="font-['Syne'] text-[1.1rem] font-extrabold text-[var(--rojo-dark)]">
          Remi<span className="text-[var(--amarillo)]">Soft</span>
        </span>
        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          aria-controls={idMenu}
          onClick={() => setAbierto(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-transparent text-[var(--texto)]"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-[99] bg-black/40 md:hidden" onClick={() => setAbierto(false)} />
      )}

      <aside
        id={idMenu}
        role={abierto ? 'dialog' : undefined}
        aria-modal={abierto || undefined}
        aria-label={`Menú de ${subtitulo}`}
        onKeyDown={(e) => {
          if (!abierto) return
          if (e.key === 'Escape') setAbierto(false)
          if (e.key !== 'Tab') return
          const controles = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'),
          ).filter((el) => el.getClientRects().length > 0)
          const primero = controles[0],
            ultimo = controles[controles.length - 1]
          if (e.shiftKey ? e.target === primero : e.target === ultimo) {
            e.preventDefault()
            const destino = e.shiftKey ? ultimo : primero
            destino?.focus()
          }
        }}
        className={`fixed left-0 top-0 z-[100] flex h-screen w-[240px] shrink-0 flex-col border-r border-[var(--borde)] bg-[var(--bg-card)] p-4 transition-[width,padding,translate] duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${
          compacto ? 'md:w-20 md:px-2' : 'md:w-[240px]'
        } md:visible ${abierto ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}
      >
        {colapsable && (
          <button
            type="button"
            onClick={() => setColapsado((v) => !v)}
            title={colapsado ? 'Desplegar menú' : 'Plegar menú'}
            className="absolute -right-3 top-[88px] z-10 hidden h-7 w-7 items-center justify-center rounded-full border border-[var(--borde)] bg-[var(--bg-card)] shadow-[0_2px_8px_rgba(0,0,0,0.12)] md:flex"
          >
            <ChevronLeft
              size={16}
              aria-hidden="true"
              className={`transition-transform ${compacto ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        <div className="mb-4 flex items-center justify-between px-2">
          <ThemeToggle compacto={compacto} />
          <button
            type="button"
            aria-label="Cerrar menú"
            ref={cerrarMovil}
            onClick={() => setAbierto(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border-none bg-transparent text-[var(--texto-muted)] md:hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className={`mb-8 px-2 ${compacto ? 'md:text-center' : ''}`}>
          <div className="font-['Syne'] text-[1.2rem] font-extrabold text-[var(--rojo-dark)]">
            {compacto ? <span className="hidden md:inline">R</span> : null}
            <span className={compacto ? 'md:hidden' : ''}>
              Remi<span className="text-[var(--amarillo)]">Soft</span>
            </span>
          </div>
          <div
            className={`mt-1 text-[0.7rem] uppercase tracking-[1.5px] text-[var(--texto-muted)] ${compacto ? 'md:hidden' : ''}`}
          >
            {subtitulo}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const activo = vistaActual === item.label.toLowerCase()
            return (
              <button
                key={item.label}
                type="button"
                aria-label={item.label}
                aria-current={activo ? 'page' : undefined}
                title={compacto ? item.label : undefined}
                onClick={() => navegar(item.label.toLowerCase())}
                className={`flex items-center gap-3 rounded-[10px] border-r-[3px] px-3 py-2.5 text-left font-['DM_Sans'] text-[0.875rem] font-medium transition-all duration-150 ease-in-out ${
                  compacto ? 'md:justify-center md:px-0' : ''
                } ${
                  activo
                    ? 'border-r-[var(--rojo)] bg-[var(--rojo-light)] text-[var(--rojo-dark)]'
                    : 'border-r-transparent bg-transparent text-[var(--texto-muted)]'
                }`}
              >
                <span aria-hidden="true" className="shrink-0 [&>svg]:size-5">{item.icon}</span>
                <span className={compacto ? 'md:hidden' : ''}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto rounded-full bg-[var(--accion-primaria)] px-2 py-0.5 text-[0.7rem] font-bold text-[var(--sobre-accion)] ${compacto ? 'md:hidden' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-[var(--borde)] pt-4">
          <div
            className={compacto ? 'md:hidden' : ''}
            onClick={(e) => {
              if (e.target instanceof Element && e.target.closest('button,a')) setAbierto(false)
            }}
          >
            {footer}
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={compacto ? 'Cerrar sesión' : undefined}
            className={`flex items-center gap-2 rounded-[10px] bg-transparent px-3 py-2 font-['DM_Sans'] text-[0.875rem] text-[var(--texto-muted)] ${
              compacto ? 'md:justify-center md:px-0' : ''
            }`}
          >
            <LogOut size={18} aria-hidden="true" />
            <span className={compacto ? 'md:hidden' : ''}>Cerrar sesión</span>
          </button>
          <small className={`break-all px-3 text-xs text-[var(--texto-muted)] ${compacto ? 'md:hidden' : ''}`}>
            Interfaz: <span translate="no">{versionInterfaz}</span>
          </small>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
