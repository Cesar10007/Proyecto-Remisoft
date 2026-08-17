function Navbar({ onLogin, onRegister }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex h-16 items-center justify-between border-b border-[var(--borde)] bg-[rgba(253,250,247,0.92)] px-[5%] backdrop-blur-[12px]">
      <a
        href="#"
        className="font-['Syne'] text-[1.4rem] font-extrabold tracking-[-0.5px] text-[var(--rojo-dark)] no-underline"
      >
        Remi<span className="text-[var(--amarillo)]">Soft</span>
      </a>

      <div className="flex items-center gap-2.5">
        <button
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-[var(--borde)] bg-transparent px-5 py-2 font-['DM_Sans'] text-sm font-medium text-[var(--texto-muted)] no-underline transition-all duration-200 ease-in-out hover:border-[#c0b8b0] hover:bg-[#f0ebe5] hover:text-[var(--texto)]"
          onClick={onLogin}
        >
          Iniciar sesión
        </button>

        <button
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-[var(--rojo)] bg-[var(--rojo)] px-5 py-2 font-['DM_Sans'] text-sm font-medium text-white no-underline transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-[var(--rojo-dark)] hover:bg-[var(--rojo-dark)]"
          onClick={onRegister}
        >
          Registrarse
        </button>
      </div>
    </nav>
  )
}

export default Navbar