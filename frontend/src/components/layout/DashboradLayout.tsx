// src/components/layout/DashboardLayout.tsx
import { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export interface NavItem {
  icon: string
  label: string
  path: string
}

interface DashboardLayoutProps {
  roleTitle: string
  navItems: NavItem[]
  children: ReactNode
  quickAction?: ReactNode
}

export function DashboardLayout({ roleTitle, navItems, children, quickAction }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg)] font-['DM_Sans',_sans-serif] text-[var(--texto)]">
      {/* Sidebar Común */}
      <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-[var(--borde)] bg-[var(--bg-card)] p-5">
        <div className="mb-8 px-2">
          <span className="block font-['Syne'] text-xl font-extrabold text-[var(--rojo-dark)]">
            Remi<span className="text-[var(--amarillo)]">Soft</span>
          </span>
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-[var(--texto-muted)]">
            {roleTitle}
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--rojo-light)] font-bold text-[var(--rojo-dark)]'
                    : 'text-[var(--texto-muted)] hover:bg-[#f5ede7]'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--borde)] pt-4">
          {quickAction}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[var(--texto-muted)] hover:bg-[#f5ede7]"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content & Topbar */}
      <div className="ml-64 flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[var(--borde)] bg-[var(--bg-card)] px-8">
          <span className="font-bold text-[var(--texto)]">
            Bienvenido, {user?.nombre ?? roleTitle}
          </span>
          <div className="flex items-center gap-4">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--borde)] text-[var(--texto-muted)]">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <div className="flex items-center gap-2 rounded-full border border-[var(--borde)] px-3 py-1 text-sm font-semibold">
              <span className="material-symbols-outlined text-[var(--rojo)]">account_circle</span>
              {user?.nombre ?? 'Usuario'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}