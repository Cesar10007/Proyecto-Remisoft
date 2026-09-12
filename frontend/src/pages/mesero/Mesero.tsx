/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Mesas from './Mesas/Mesas'
import Pedidos from './Pedidos/Pedidos'
import Caja from './Caja/Caja'
import Facturas from './Facturas/Facturas'
import './Mesero.css'

const navItems = [
  { key: 'Mesas', icon: 'table_restaurant', label: 'Mesas' },
  { key: 'Pedidos', icon: 'receipt_long', label: 'Pedidos' },
  { key: 'Caja', icon: 'point_of_sale', label: 'Caja' },
  { key: 'Facturas', icon: 'description', label: 'Facturas' },
]

function Mesero() {
  const [activeItem, setActiveItem] = useState('Mesas')
  const [sidebarColapsado, setSidebarColapsado] = useState(false)

  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const nombreUsuario = user?.nombre ?? 'Mesero'

  const handleNavClick = (key: string) => {
    if (sidebarColapsado) setSidebarColapsado(false)
    setActiveItem(key)
  }

  return (
    <div
      className="flex min-h-screen font-['Manrope',_'DM_Sans',_sans-serif]"
      style={{
        ['--wa-primary' as any]: '#a5360d',
        ['--wa-primary-dark' as any]: '#852400',
        ['--wa-primary-light' as any]: '#ffdbd0',
        ['--wa-primary-container' as any]: '#c74d24',
        ['--wa-secondary' as any]: '#855400',
        ['--wa-secondary-light' as any]: '#ffddb7',
        ['--wa-secondary-fixed-dim' as any]: '#ffb95d',
        ['--wa-secondary-container' as any]: '#fcaa33',
        ['--wa-tertiary' as any]: '#00694c',
        ['--wa-tertiary-light' as any]: '#86f8c9',
        ['--wa-bg' as any]: '#fcf9f8',
        ['--wa-surface' as any]: '#ffffff',
        ['--wa-surface-low' as any]: '#f6f3f2',
        ['--wa-surface-mid' as any]: '#f0eded',
        ['--wa-surface-high' as any]: '#e5e2e1',
        ['--wa-text' as any]: '#1c1b1b',
        ['--wa-text-muted' as any]: '#58423b',
        ['--wa-border' as any]: 'rgba(224, 192, 182, 0.2)',
        background: 'var(--wa-bg)',
        color: 'var(--wa-text)',
      }}
    >

      {/* SIDEBAR */}
      <aside
        className={`relative flex h-screen shrink-0 flex-col bg-[var(--wa-bg)] p-6 transition-all duration-300 ease-in-out ${
          sidebarColapsado ? 'w-20 px-2' : 'w-64 px-4'
        }`}
      >

        {/* BOTÓN COLAPSAR/EXPANDIR */}
        <button
          onClick={() => setSidebarColapsado(prev => !prev)}
          title={sidebarColapsado ? 'Expandir menú' : 'Contraer menú'}
          className="absolute -right-3 top-8 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--wa-border)] bg-white shadow-[0_2px_8px_rgba(28,27,27,0.12)] transition hover:bg-[var(--wa-surface-low)]"
        >
          <span
            className={`material-symbols-outlined text-[16px] text-[var(--wa-text-muted)] transition-transform duration-300 ${
              sidebarColapsado ? 'rotate-180' : ''
            }`}
          >
            chevron_left
          </span>
        </button>

        <div className={`mb-10 px-2 ${sidebarColapsado ? 'text-center' : ''}`}>
          {sidebarColapsado ? (
            <span className="block text-[1.25rem] font-extrabold text-[var(--wa-primary)]">R</span>
          ) : (
            <span className="block text-[1.25rem] font-extrabold tracking-[-0.03em] text-[var(--wa-primary)]">
              Remi<span className="text-[var(--wa-primary)]">Soft</span>
            </span>
          )}

          {!sidebarColapsado && (
            <div className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">
              Mesero
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = activeItem === item.key

            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                title={sidebarColapsado ? item.label : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-[0.95rem] font-bold transition-all duration-150 ease-in-out active:scale-[0.97] ${
                  sidebarColapsado ? 'justify-center px-0' : ''
                } ${
                  isActive
                    ? 'bg-[var(--wa-surface)] text-[var(--wa-primary)] shadow-[0_2px_10px_rgba(28,27,27,0.05)]'
                    : 'bg-transparent text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {!sidebarColapsado && <span className="flex-1">{item.label}</span>}
              </button>
            )
          })}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <button
            title={sidebarColapsado ? 'Acción Rápida' : undefined}
            className={`flex w-full items-center gap-2 rounded-xl bg-gradient-to-br from-[var(--wa-primary)] to-[var(--wa-primary-container)] px-4 py-3.5 text-[0.9rem] font-extrabold text-white shadow-[0_16px_24px_rgba(165,54,13,0.22)] justify-center ${
              sidebarColapsado ? 'px-0' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {!sidebarColapsado && 'Acción Rápida'}
          </button>

          <button
            title={sidebarColapsado ? 'Configuraciones' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl bg-transparent px-3 py-3.5 text-left text-[0.95rem] font-bold text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)] ${
              sidebarColapsado ? 'justify-center px-0' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">settings</span>
            {!sidebarColapsado && 'Configuraciones'}
          </button>

          <button
            onClick={() => {
              logout()
              navigate('/')
            }}
            title={sidebarColapsado ? 'Cerrar sesión' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl bg-transparent px-3 py-3.5 text-left text-[0.95rem] font-bold text-[var(--wa-text-muted)] hover:bg-[var(--wa-surface-low)] ${
              sidebarColapsado ? 'justify-center px-0' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            {!sidebarColapsado && 'Cerrar sesión'}
          </button>
        </div>
      </aside>


      {/* CONTENIDO PRINCIPAL */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--wa-surface-low)]">

        {/* HEADER */}
        <header className="flex items-center justify-between gap-6 border-b border-[var(--wa-border)] bg-[rgba(252,249,248,0.8)] px-6 py-3 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] backdrop-blur-[12px]">
          <div className="flex items-center gap-6">
            <span className="text-[1.125rem] font-black text-[var(--wa-text)]">
              Bienvenido de nuevo, {nombreUsuario}
            </span>

            <div className="flex items-center gap-6">
              <button className="border-none bg-transparent text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-primary)]">
                Plano del Piso
              </button>
              <button className="border-none bg-transparent text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)]">
                Pago Rápido
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[var(--wa-text-muted)]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar mesas o artículos..."
                className="w-full rounded-full border border-[var(--wa-border)] bg-[var(--wa-surface)] py-2.5 pl-10 pr-4 text-[0.875rem] outline-none focus:border-[var(--wa-primary)]"
              />
            </div>

            <button className="flex items-center justify-center border-none bg-transparent text-[var(--wa-text-muted)]">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <div className="flex items-center gap-2 border-l border-[var(--wa-border)] pl-4">
              <span className="block text-[0.75rem] font-extrabold">{nombreUsuario}</span>
              <span className="material-symbols-outlined text-[var(--wa-primary)] [font-variation-settings:'FILL'_1]">
                account_circle
              </span>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6">
          {activeItem === 'Mesas' && <Mesas />}
          {activeItem === 'Pedidos' && <Pedidos />}
          {activeItem === 'Caja' && <Caja nombreUsuario={nombreUsuario} />}
          {activeItem === 'Facturas' && <Facturas nombreUsuario={nombreUsuario} />}
        </div>

      </main>
    </div>
  )
}

export default Mesero