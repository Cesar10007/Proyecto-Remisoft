/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/hooks'
import Mesas from './Mesas/Mesas'
import Pedidos from './Pedidos/Pedidos'
import Caja from './Caja/Caja'
import Facturas from './Facturas/Facturas'
import './Mesero.css'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'

const navItems = [
  { key: 'Mesas', icon: 'table_restaurant', label: 'Mesas' },
  { key: 'Pedidos', icon: 'receipt_long', label: 'Pedidos' },
  { key: 'Caja', icon: 'point_of_sale', label: 'Caja' },
  { key: 'Facturas', icon: 'description', label: 'Facturas' },
]

function Mesero() {
  const [activeItem, setActiveItem] = useState('Mesas')

  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const nombreUsuario = user?.nombre ?? 'Mesero'
  const nombreCompleto = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Mesero'

  return (
    <div
      className="wa-wrapper flex min-h-screen font-['Manrope',_'DM_Sans',_sans-serif]"
      style={{
        background: 'var(--wa-bg)',
        color: 'var(--wa-text)',
      }}
    >

      {/* SIDEBAR */}
      <Sidebar
        subtitulo="Mesero"
        colapsable
        menuItems={navItems}
        vistaActual={activeItem.toLowerCase()}
        onNavigate={(vista) => setActiveItem(navItems.find((item) => item.label.toLowerCase() === vista)?.key ?? activeItem)}
        onLogout={() => {
          logout()
          navigate('/')
        }}
        footer={
          <button
            type="button"
            onClick={() => setActiveItem('Pedidos')}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[var(--wa-primary)] to-[var(--wa-primary-container)] px-4 py-3 text-[0.9rem] font-extrabold text-white"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Acción Rápida
          </button>
        }
      />


      {/* CONTENIDO PRINCIPAL */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--wa-surface-low)]">

        {/* ENCABEZADO */}
        <div className="border-b border-[var(--wa-border)] bg-[var(--bg-card)] px-4 py-4 pt-16 md:px-6 md:py-4 md:pt-4">
          <Header
            seccionActiva={activeItem}
            nombreUsuario={nombreCompleto}
            acciones={
              <>
                <button type="button" onClick={() => setActiveItem('Mesas')} className="hidden border-none bg-transparent text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-primary)] md:block">
                  Plano del Piso
                </button>
                <button type="button" onClick={() => setActiveItem('Facturas')} className="hidden border-none bg-transparent text-[0.625rem] font-extrabold uppercase tracking-[0.18em] text-[var(--wa-text-muted)] md:block">
                  Pago Rápido
                </button>
                <div className="relative w-full md:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[var(--wa-text-muted)]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Buscar mesas o artículos..."
                    className="w-full rounded-full border border-[var(--wa-border)] bg-[var(--wa-surface)] py-2.5 pl-10 pr-4 text-[0.875rem] outline-none focus:border-[var(--wa-primary)]"
                  />
                </div>
              </>
            }
          />
        </div>

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