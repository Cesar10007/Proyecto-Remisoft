import { useState, type ReactNode } from 'react'
import ThemeToggle from '../common/ThemeToggle'

export interface SidebarMenuItem {
  icon: string
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
}

// Menú lateral de los paneles. En escritorio es fijo; en celular se abre desde una barra superior.
function Sidebar({ subtitulo, menuItems, vistaActual, onNavigate, onLogout, footer }: SidebarProps) {
  const [abierto, setAbierto] = useState(false)

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
          onClick={() => setAbierto(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-transparent text-[var(--texto)]"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {abierto && <div className="fixed inset-0 z-[99] bg-black/40 md:hidden" onClick={() => setAbierto(false)} />}

      <aside
        className={`fixed left-0 top-0 z-[100] flex h-screen w-[240px] flex-col overflow-y-auto border-r border-[var(--borde)] bg-[var(--bg-card)] p-4 transition-transform duration-200 md:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border-none bg-transparent text-[var(--texto-muted)] md:hidden"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="mb-8 px-2">
          <div className="font-['Syne'] text-[1.2rem] font-extrabold text-[var(--rojo-dark)]">
            Remi<span className="text-[var(--amarillo)]">Soft</span>
          </div>
          <div className="mt-1 text-[0.7rem] uppercase tracking-[1.5px] text-[var(--texto-muted)]">{subtitulo}</div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {menuItems.map((item) => {
            const activo = vistaActual === item.label.toLowerCase()
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navegar(item.label.toLowerCase())}
                className={`flex items-center gap-3 rounded-[10px] border-r-[3px] px-3 py-2.5 text-left font-['DM_Sans'] text-[0.875rem] font-medium transition-all duration-150 ease-in-out ${
                  activo
                    ? 'border-r-[var(--rojo)] bg-[var(--rojo-light)] text-[var(--rojo-dark)]'
                    : 'border-r-transparent bg-transparent text-[var(--texto-muted)]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto rounded-full bg-[var(--rojo)] px-2 py-0.5 text-[0.7rem] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="flex flex-col gap-1 border-t border-[var(--borde)] pt-4">
          {footer}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-[10px] bg-transparent px-3 py-2 font-['DM_Sans'] text-[0.875rem] text-[var(--texto-muted)]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
