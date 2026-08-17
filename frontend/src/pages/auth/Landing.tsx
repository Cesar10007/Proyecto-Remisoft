import './Auth.css'

interface LandingProps {
  onRegister: () => void
}

function Landing({ onRegister }: LandingProps) {
  return (
    <>
      {/* HERO */}
      <section className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-[5%] pt-[100px] pb-20 md:grid-cols-2 md:gap-[60px] md:pt-[140px]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F5C4B3] bg-[var(--rojo-light)] px-3.5 py-1.5 text-[0.78rem] font-medium text-[var(--rojo-dark)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--rojo)]"></span>
            Sistema de gestión inteligente
          </div>

          <h1 className="mb-5 font-['Syne'] text-[clamp(2.4rem,4vw,3.6rem)] font-extrabold leading-[1.1] tracking-[-1.5px] text-[var(--texto)]">
            Gestiona tu
            <br />
            <em className="not-italic text-[var(--rojo)]">restaurante</em>
            <br />
            sin <span className="text-[var(--amarillo)]">complicaciones</span>
          </h1>

          <p className="mb-8 max-w-[480px] text-[1.05rem] font-light leading-[1.7] text-[var(--texto-muted)]">
            RemiSoft centraliza pedidos, inventario, facturación y domicilios en una sola plataforma.
            Diseñado para el restaurante Familia Remi.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] border-[var(--rojo)] bg-[var(--rojo)] px-5 py-2 font-['DM_Sans'] text-sm font-medium text-white transition-all duration-200 ease-in-out hover:-translate-y-px hover:border-[var(--rojo-dark)] hover:bg-[var(--rojo-dark)]"
              onClick={onRegister}
            >
              Comenzar ahora
            </button>

            <button
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

          <div className="mt-10 flex gap-5 border-t border-[var(--borde)] pt-8 md:gap-8">
            <div>
              <div className="font-['Syne'] text-[1.8rem] font-bold text-[var(--texto)]">
                7
              </div>
              <div className="mt-0.5 text-[0.78rem] text-[var(--texto-muted)]">
                Módulos principales
              </div>
            </div>

            <div>
              <div className="font-['Syne'] text-[1.8rem] font-bold text-[var(--texto)]">
                4
              </div>
              <div className="mt-0.5 text-[0.78rem] text-[var(--texto-muted)]">
                Roles de usuario
              </div>
            </div>

            <div>
              <div className="font-['Syne'] text-[1.8rem] font-bold text-[var(--texto)]">
                IA
              </div>
              <div className="mt-0.5 text-[0.78rem] text-[var(--texto-muted)]">
                Análisis predictivo
              </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD MOCKUP */}
        <div className="relative hidden md:block">
          <div className="overflow-hidden rounded-2xl border border-[var(--borde)] bg-[var(--bg-card)] shadow-[var(--sombra),0_0_0_6px_rgba(216,90,48,0.04)] [transform:perspective(1000px)_rotateY(-4deg)_rotateX(2deg)] transition-transform duration-500 ease-in-out hover:[transform:perspective(1000px)_rotateY(0deg)_rotateX(0deg)]">

            {/* Barra superior del navegador */}
            <div className="flex items-center gap-2 border-b border-[var(--borde)] bg-[#f4efe9] px-4 py-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#F09595]"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-[#EF9F27]"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-[#5DCAA5]"></div>

              <div className="ml-0.5 flex h-6 flex-1 items-center rounded-md border border-[var(--borde)] bg-white px-2.5 text-[0.7rem] text-[var(--texto-muted)]">
                remisoft.app/dashboard
              </div>
            </div>

            {/* Contenido del mockup */}
            <div className="p-4">

              <div className="mb-2.5 font-['Syne'] text-[0.75rem] font-bold text-[#6c757d]">
                Panel de hoy
              </div>

              {/* Tarjetas */}
              <div className="mb-3 grid grid-cols-3 gap-2">

                <div className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] p-3">
                  <div className="mb-1 text-[0.65rem] text-[var(--texto-muted)]">
                    Ventas
                  </div>
                  <div className="font-['Syne'] text-[1.1rem] font-bold text-[var(--rojo-dark)]">
                    $284k
                  </div>
                </div>

                <div className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] p-3">
                  <div className="mb-1 text-[0.65rem] text-[var(--texto-muted)]">
                    Pedidos
                  </div>
                  <div className="font-['Syne'] text-[1.1rem] font-bold text-[var(--verde)]">
                    38
                  </div>
                </div>

                <div className="rounded-[10px] border border-[var(--borde)] bg-[#f9f5f0] p-3">
                  <div className="mb-1 text-[0.65rem] text-[var(--texto-muted)]">
                    Domicilios
                  </div>
                  <div className="font-['Syne'] text-[1.1rem] font-bold text-[#BA7517]">
                    12
                  </div>
                </div>

              </div>

              <div className="mb-2 font-['Syne'] text-[0.7rem] font-bold text-[#6c757d]">
                Pedidos activos
              </div>

              {/* Pedidos */}
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

              {/* Alerta de inventario */}
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

      {/* FEATURES */}
      <section className="section" id="funciones">
        <div className="section-tag">
          Funcionalidades
        </div>

        <h2>
          Todo lo que necesita
          <br />
          un restaurante moderno
        </h2>

        <p className="section-sub">
          Desde la toma del pedido hasta la factura electrónica DIAN, RemiSoft cubre el ciclo completo de operación.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-rojo">🧾</div>
            <h3>Gestión de pedidos</h3>
            <p>Registro de pedidos por mesa o domicilio. Descuento automático de inventario según recetas configuradas.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-verde">📦</div>
            <h3>Control de inventario</h3>
            <p>Seguimiento en tiempo real de insumos. Alertas cuando el stock llega al mínimo definido por el administrador.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-amarillo">📄</div>
            <h3>Facturación DIAN</h3>
            <p>Generación automática de facturas electrónicas con CUFE, cumpliendo la resolución 000042 de 2020.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-rojo">🛵</div>
            <h3>Módulo de domicilios</h3>
            <p>Seguimiento en tiempo real de entregas. Estados actualizables por el repartidor desde su dispositivo.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-verde">🤖</div>
            <h3>Análisis con IA</h3>
            <p>Predicción de demanda por producto e ingrediente. Reportes automáticos de rentabilidad y tendencias de consumo.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-amarillo">💰</div>
            <h3>Caja y facturación</h3>
            <p>Apertura y cierre de turno, flujo de caja, múltiples métodos de pago y exportación de reportes contables.</p>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="roles-section">
        <div className="roles-inner">
          <div className="section-tag">Usuarios del sistema</div>

          <h2 className="roles-title">Un sistema, cuatro roles</h2>

          <p className="section-sub">
            Cada perfil accede únicamente a las funciones que le corresponden.
          </p>

          <div className="roles-grid">
            <div className="role-card">
              <div className="role-avatar">👑</div>
              <h3>Administrador</h3>
              <p>Gestión total: usuarios, menú, reportes, inventario y configuración del sistema.</p>
            </div>

            <div className="role-card">
              <div className="role-avatar">🍽</div>
              <h3>Mesero</h3>
              <p>Toma de pedidos por mesa, envío a cocina y seguimiento del estado del servicio.</p>
            </div>

            <div className="role-card">
              <div className="role-avatar">🛵</div>
              <h3>Repartidor</h3>
              <p>Visualización de domicilios asignados, actualización de estado en tiempo real.</p>
            </div>

            <div className="role-card">
              <div className="role-avatar">👤</div>
              <h3>Cliente</h3>
              <p>Exploración del menú, pedidos a domicilio, historial de compras y calificación del servicio.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Landing