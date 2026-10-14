import type { ReactNode } from 'react'

interface HeaderProps {
  seccionActiva: string
  nombreUsuario?: string
  // Texto bajo el título. Si no se indica, muestra el saludo con el nombre.
  subtitulo?: ReactNode
  // Controles propios de la sección (buscador, botones de acción).
  acciones?: ReactNode
}

// Encabezado de sección compartido: título, acciones y el usuario con su nombre.
function Header({ seccionActiva, nombreUsuario = 'Usuario', subtitulo, acciones }: HeaderProps) {
  const inicial = nombreUsuario.trim()[0]?.toUpperCase() ?? '?'
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-['Syne'] text-[1.4rem] font-extrabold tracking-[-0.5px] text-[var(--texto)] md:text-[1.6rem]">
          {seccionActiva}
        </h1>
        <p className="mt-0.5 text-[0.85rem] text-[var(--texto-muted)]">
          {subtitulo ?? <>Bienvenido de nuevo, {nombreUsuario}</>}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {acciones}
        <button
          aria-label="Notificaciones"
          className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--borde)] bg-[var(--bg-card)] text-[var(--texto-muted)]"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <div className="flex items-center gap-2.5 rounded-full border border-[var(--borde)] bg-[var(--bg-card)] py-1.5 pl-1.5 pr-3.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--rojo-light)] text-[0.85rem] font-bold text-[var(--rojo-dark)]">
            {inicial}
          </div>
          <span className="text-[0.85rem] font-medium text-[var(--texto)]">{nombreUsuario}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
