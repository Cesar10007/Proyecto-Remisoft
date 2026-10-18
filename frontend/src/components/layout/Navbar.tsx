import Button from '../common/Button'
import ThemeToggle from '../common/ThemeToggle'

interface NavbarProps {
  onLogin: () => void
}

function Navbar({ onLogin }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex h-16 items-center justify-between border-b border-[var(--borde)] bg-[var(--t-bg-rgba_253_250_247_0_92,rgba(253,250,247,0.92))] px-[5%] backdrop-blur-[12px]">
      
      <div className="flex items-center gap-4">
      <ThemeToggle />
      <a
        href="#"
        className="font-['Syne'] text-[1.4rem] font-extrabold tracking-[-0.5px] text-[var(--rojo-dark)] no-underline"
      >
        Remi<span className="text-[var(--amarillo)]">Soft</span>
      </a>
      </div>

      <div className="flex items-center gap-2.5">
        <Button onClick={onLogin}>Iniciar sesión</Button>
      </div>
    </nav>
  )
}

export default Navbar
