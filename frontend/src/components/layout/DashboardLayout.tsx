import type { ReactNode } from 'react'
import { useAuth } from '../../store/hooks'
import { DashboardSidebar, type DashboardNavItem } from './DashboardSidebar'
import { useDashboardSidebarCollapsed } from './useDashboardSidebar'

interface DashboardLayoutProps {
  roleTitle: string
  navItems: DashboardNavItem[]
  children: ReactNode
  quickAction?: ReactNode
}

export function DashboardLayout({ roleTitle, navItems, children, quickAction }: DashboardLayoutProps) {
  const { user } = useAuth()
  const sidebarCollapsed = useDashboardSidebarCollapsed()

  return (
    <div className="sa-wrapper min-h-screen bg-[var(--bg)] font-['DM_Sans',_sans-serif] text-[var(--texto)]">
      <DashboardSidebar roleTitle={roleTitle} navItems={navItems} footerActions={quickAction} />
      <div className={`ml-0 flex min-h-screen flex-col transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-60'}`}>
        <header className="flex min-h-16 items-center justify-between border-b border-[var(--borde)] bg-[var(--bg-card)] px-4 pl-16 lg:px-8">
          <span className="font-bold text-[var(--texto)]">
            Bienvenido, {user?.nombre ?? roleTitle}
          </span>
          <div className="flex items-center gap-2 rounded-full border border-[var(--borde)] px-3 py-1 text-sm font-semibold">
            <span className="material-symbols-outlined text-[var(--rojo)]">account_circle</span>
            {user?.nombre ?? 'Usuario'}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
