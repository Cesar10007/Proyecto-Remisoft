import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import { setDashboardSidebarCollapsed, useDashboardSidebarCollapsed } from './useDashboardSidebar'

export interface DashboardNavItem {
  id: string
  icon: string
  label: string
  path?: string
  end?: boolean
  badge?: string | number
}

interface DashboardSidebarProps {
  roleTitle: string
  navItems: DashboardNavItem[]
  activeItem?: string
  onNavigate?: (itemId: string) => void
  footerActions?: ReactNode
}

const linkClasses = (active: boolean) =>
  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
    active
      ? 'bg-[var(--rojo-light)] font-bold text-[var(--rojo-dark)]'
      : 'text-[var(--texto-muted)] hover:bg-[#f5ede7]'
  }`

export function DashboardSidebar({
  roleTitle,
  navItems,
  activeItem,
  onNavigate,
  footerActions,
}: DashboardSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const collapsed = useDashboardSidebarCollapsed()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <>
      <button
        type="button"
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--borde)] bg-[var(--bg-card)] text-[var(--texto)] shadow-sm lg:hidden"
      >
        <span className="material-symbols-outlined">
          {mobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-[var(--borde)] bg-[var(--bg-card)] p-5 transition-[width,transform,padding] duration-200 lg:translate-x-0 ${
          collapsed ? 'lg:w-20 lg:px-3' : ''
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`mb-5 flex items-center gap-2 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <button
            type="button"
            aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
            aria-pressed={collapsed}
            title={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
            onClick={() => setDashboardSidebarCollapsed(!collapsed)}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--texto-muted)] hover:bg-[#f5ede7] lg:flex"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className={`flex flex-col ${collapsed ? 'lg:hidden' : ''}`}>
            <span className="block font-['Syne'] text-xl font-extrabold text-[var(--rojo-dark)]">
              Remi<span className="text-[var(--amarillo)]">Soft</span>
            </span>
            <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--texto-muted)]">
              {roleTitle}
            </span>
          </div>
          {collapsed && (
            <span className="hidden font-['Syne'] text-xl font-extrabold text-[var(--rojo-dark)] lg:block" aria-hidden="true">
              R
            </span>
          )}
        </div>

        <nav aria-label={`Menú de ${roleTitle}`} className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const content = (
              <>
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`rounded-full bg-[var(--rojo)] px-2 py-0.5 text-xs font-bold text-white ${collapsed ? 'lg:hidden' : ''}`}>
                    {item.badge}
                  </span>
                )}
              </>
            )

            if (item.path) {
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.end}
                  onClick={closeMobileMenu}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `${linkClasses(isActive)} ${collapsed ? 'lg:justify-center' : ''}`
                  }
                >
                  {content}
                </NavLink>
              )
            }

            const isActive = activeItem === item.id

            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  onNavigate?.(item.id)
                  closeMobileMenu()
                }}
                className={`${linkClasses(isActive)} ${collapsed ? 'lg:justify-center' : ''}`}
              >
                {content}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--borde)] pt-4">
          <div className={collapsed ? 'lg:hidden' : ''}>{footerActions}</div>
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Cerrar sesión' : undefined}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--texto-muted)] hover:bg-[#f5ede7] ${
              collapsed ? 'lg:justify-center' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className={collapsed ? 'lg:hidden' : ''}>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
