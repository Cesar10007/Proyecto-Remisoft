interface MenuItem { icon: string; label: string }
interface GerenteSidebarProps {
  menuItems: MenuItem[]
  vistaActual: string
  onNavigate: (vista: string) => void
  onLogout: () => void
}

function GerenteSidebar({ menuItems, vistaActual, onNavigate, onLogout }: GerenteSidebarProps) {
  return <aside className="fixed left-0 top-0 z-[100] flex min-h-screen w-[240px] flex-col border-r border-[var(--borde)] bg-[var(--bg-card)] p-4">
    <div className="mb-8 px-2"><div className="font-['Syne'] text-[1.2rem] font-extrabold text-[var(--rojo-dark)]">Remi<span className="text-[var(--amarillo)]">Soft</span></div><div className="mt-1 text-[0.7rem] uppercase tracking-[1.5px] text-[var(--texto-muted)]">Gerente</div></div>
    <div className="flex flex-1 flex-col gap-0.5">{menuItems.map((item, index) => <button key={index} onClick={() => onNavigate(item.label.toLowerCase())} className={`flex items-center gap-3 rounded-[10px] border-r-[3px] px-3 py-2.5 text-left font-['DM_Sans'] text-[0.875rem] font-medium transition-all duration-150 ease-in-out ${vistaActual === item.label.toLowerCase() ? 'border-r-[var(--rojo)] bg-[var(--rojo-light)] text-[var(--rojo-dark)]' : 'border-r-transparent bg-transparent text-[var(--texto-muted)]'}`}><span className="material-symbols-outlined text-[20px]">{item.icon}</span><span>{item.label}</span></button>)}</div>
    <div className="flex flex-col gap-1 border-t border-[var(--borde)] pt-4"><button className="mb-2 rounded-[10px] bg-[var(--rojo)] px-2.5 py-2.5 font-['DM_Sans'] text-[0.875rem] font-semibold text-white">Cerrar Caja</button><button onClick={onLogout} className="flex items-center gap-2 rounded-[10px] bg-transparent px-3 py-2 font-['DM_Sans'] text-[0.875rem] text-[var(--texto-muted)]"><span className="material-symbols-outlined text-[18px]">logout</span>Cerrar sesión</button></div>
  </aside>
}

export default GerenteSidebar