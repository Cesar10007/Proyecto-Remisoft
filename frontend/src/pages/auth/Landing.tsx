interface LandingProps {
  onLogin: () => void
}

function Landing({ onLogin }: LandingProps) {
  return (
    <>
      {/* HERO */}
      <section className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 px-6 pt-[92px] pb-20 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F5C4B3] bg-[var(--rojo-light)] px-3.5 py-1.5 text-[0.78rem] font-medium text-[var(--rojo-dark)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--rojo)]"></span>
            Sistema de gestión inteligente
          </div>

          <h1 className="mb-5 max-w-[430px] font-['DM_Serif_Display'] text-[clamp(3rem,4.8vw,3.75rem)] font-normal leading-[0.98] tracking-[-0.5px] text-[var(--texto)]">
            Gestiona tu
            <br />
            <em className="not-italic text-[var(--rojo)]">restaurante</em>
            <br />
            sin <span className="text-[var(--amarillo)]">complicaciones</span>
          </h1>

          <p className="mb-8 max-w-[400px] text-[0.98rem] font-light leading-[1.65] text-[var(--texto-muted)]">
            RemiSoft centraliza pedidos, inventario, facturación y domicilios en una sola plataforma.
            Diseñado para el restaurante Familia Remi.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-[var(--rojo)] bg-[var(--rojo)] px-5 py-2 font-['DM_Sans'] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-[var(--rojo-dark)] hover:bg-[var(--rojo-dark)]"
              onClick={onLogin}
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-[var(--borde)] bg-transparent px-5 py-2 font-['DM_Sans'] text-sm font-medium text-[var(--texto-muted)] transition-all duration-200 ease-in-out hover:border-[#c0b8b0] hover:bg-[#f0ebe5] hover:text-[var(--texto)]"
              onClick={() =>
                document
                  .getElementById('funciones')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Ver funciones
            </button>
          </div>

          <div className="mt-10 flex gap-5 border-t border-[var(--borde)] pt-7 md:gap-7">
            <div>
              <div className="font-['DM_Serif_Display'] text-[1.9rem] font-normal text-[var(--texto)]">7</div>
              <div className="mt-0.5 text-[0.78rem] text-[var(--texto-muted)]">Módulos principales</div>
            </div>

            <div>
              <div className="font-['DM_Serif_Display'] text-[1.9rem] font-normal text-[var(--texto)]">4</div>
              <div className="mt-0.5 text-[0.78rem] text-[var(--texto-muted)]">Roles de usuario</div>
            </div>

            <div>
              <div className="font-['DM_Serif_Display'] text-[1.9rem] font-normal text-[var(--texto)]">IA</div>
              <div className="mt-0.5 text-[0.78rem] text-[var(--texto-muted)]">Análisis predictivo</div>
            </div>
          </div>
        </div>

        {/* DASHBOARD MOCKUP */}
        <div className="relative hidden w-full md:block">
          <div className="overflow-hidden rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] shadow-[var(--sombra),0_0_0_6px_rgba(216,90,48,0.04)] [transform:rotate(1deg)] transition-transform duration-500 ease-in-out hover:rotate-0">

            <div className="flex items-center gap-2 border-b border-[var(--borde)] bg-[#f4efe9] px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#F09595]"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-[#EF9F27]"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-[#5DCAA5]"></div>

              <div className="ml-0.5 flex h-6 flex-1 items-center rounded-md border border-[var(--borde)] bg-white px-2.5 text-[0.7rem] text-[var(--texto-muted)]">
                remisoft.app/dashboard
              </div>
            </div>

            <div className="p-4">
              <div className="mb-2.5 font-['DM_Sans'] text-[0.75rem] font-bold text-[#6c757d]">
                Panel de hoy
              </div>

              <div className="mb-3 grid grid-cols-3 gap-2">
                <div className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] p-3">
                  <div className="mb-1 text-[0.65rem] text-[var(--texto-muted)]">Ventas</div>
                  <div className="font-['DM_Sans'] text-[1.1rem] font-bold text-[var(--rojo-dark)]">$284k</div>
                </div>

                <div className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] p-3">
                  <div className="mb-1 text-[0.65rem] text-[var(--texto-muted)]">Pedidos</div>
                  <div className="font-['DM_Sans'] text-[1.1rem] font-bold text-[var(--verde)]">38</div>
                </div>

                <div className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] p-3">
                  <div className="mb-1 text-[0.65rem] text-[var(--texto-muted)]">Domicilios</div>
                  <div className="font-['DM_Sans'] text-[1.1rem] font-bold text-[#BA7517]">12</div>
                </div>
              </div>

              <div className="mb-2 font-['DM_Sans'] text-[0.7rem] font-bold text-[#6c757d]">
                Pedidos activos
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between rounded-lg border border-[var(--borde)] bg-[#f9f5f0] px-3 py-2 text-[0.72rem]">
                  <span>Mesa 3 · Combo corriente ×2</span>
                  <span className="rounded-full bg-[var(--amarillo-light)] px-2 py-0.5 text-[0.6rem] font-medium text-[#854F0B]">
                    Preparando
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[var(--borde)] bg-[#f9f5f0] px-3 py-2 text-[0.72rem]">
                  <span>Mesa 7 · Hamburguesa BBQ</span>
                  <span className="rounded-full bg-[var(--verde-light)] px-2 py-0.5 text-[0.6rem] font-medium text-[#0F6E56]">
                    Listo
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[var(--borde)] bg-[#f9f5f0] px-3 py-2 text-[0.72rem]">
                  <span>Domicilio #041 · Cra 5 #22</span>
                  <span className="rounded-full bg-[var(--rojo-light)] px-2 py-0.5 text-[0.6rem] font-medium text-[var(--rojo-dark)]">
                    En camino
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-[var(--borde)] bg-[#f9f5f0] px-3 py-2 text-[0.72rem]">
                  <span>Mesa 1 · Desayuno ejecutivo ×3</span>
                  <span className="rounded-full bg-[var(--amarillo-light)] px-2 py-0.5 text-[0.6rem] font-medium text-[#854F0B]">
                    Preparando
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-[10px] border border-[#dee2e6] bg-[#f8f9fa] p-2.5">
                <div className="mb-0.5 text-[0.65rem] font-medium text-[#a30000]">
                  ⚠ Alerta de inventario — IA
                </div>
                <div className="text-[0.68rem] text-[#6c757d]">
                  Papas fritas por debajo del mínimo. Se recomienda compra hoy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Landing
