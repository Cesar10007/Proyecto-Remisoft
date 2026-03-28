function Landing() {
return (
    <>
      {/* HERO */}
    <section className="hero">
        <div className="hero-content">
            <div className="hero-badge">
                <span className="badge-dot"></span>
                Sistema de gestión inteligente
            </div>
            <h1>Gestiona tu<br /><em>restaurante</em><br />sin <span className="accent">complicaciones</span></h1>
            <p>RemiSoft centraliza pedidos, inventario, facturación y domicilios en una sola plataforma. Diseñado para el restaurante Familia Remi.</p>
            <div className="hero-actions">
                <button className="btn btn-primary" onClick={() => window.openModal('registro')}>Comenzar ahora</button>
                <button className="btn btn-ghost" onClick={() => document.getElementById('funciones').scrollIntoView({ behavior: 'smooth' })}>Ver funciones</button>
            </div>
            <div className="hero-stats">
                <div>
                    <div className="stat-num">7</div>
                    <div className="stat-label">Módulos principales</div>
                </div>
                <div>
                    <div className="stat-num">4</div>
                    <div className="stat-label">Roles de usuario</div>
                </div>
                <div>
                <div className="stat-num">IA</div>
                    <div className="stat-label">Análisis predictivo</div>
                </div>
            </div>
        </div>

        <div className="hero-visual">
            <div className="mockup-frame">
                <div className="mockup-bar">
                    <div className="dot dot-r"></div>
                    <div className="dot dot-y"></div>
                    <div className="dot dot-g"></div>
                    <div className="mockup-url">remisoft.app/dashboard</div>
                </div>
                <div className="mockup-body">
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px', color: '#6c757d' }}>
                        Panel de hoy
                    </div>
                    <div className="dash-grid">
                        <div className="dash-card"><div className="dash-card-label">Ventas</div><div className="dash-card-val rojo">$284k</div></div>
                        <div className="dash-card"><div className="dash-card-label">Pedidos</div><div className="dash-card-val verde">38</div></div>
                        <div className="dash-card"><div className="dash-card-label">Domicilios</div><div className="dash-card-val amarillo">12</div></div>
                    </div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '0.7rem', fontWeight: 700, marginBottom: '8px', color: '#6c757d' }}>Pedidos activos</div>
                    <div className="dash-orders">
                        <div className="order-row"><span>Mesa 3 · Combo corriente ×2</span><span className="order-badge badge-pending">Preparando</span></div>
                        <div className="order-row"><span>Mesa 7 · Hamburguesa BBQ</span><span className="order-badge badge-done">Listo</span></div>
                        <div className="order-row"><span>Domicilio #041 · Cra 5 #22</span><span className="order-badge badge-delivery">En camino</span></div>
                        <div className="order-row"><span>Mesa 1 · Desayuno ejecutivo ×3</span><span className="order-badge badge-pending">Preparando</span></div>
                    </div>
                    <div style={{ marginTop: '12px', padding: '10px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #dee2e6' }}>
                        <div style={{ fontSize: '0.65rem', color: '#a30000', fontWeight: 500, marginBottom: '3px' }}>⚠ Alerta de inventario — IA</div>
                        <div style={{ fontSize: '0.68rem', color: '#6c757d' }}>Papas fritas por debajo del mínimo. Se recomienda compra hoy.</div>
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
        <h2>Todo lo que necesita<br/>un restaurante moderno</h2>
        <p className="section-sub">Desde la toma del pedido hasta la factura electrónica DIAN, RemiSoft cubre el ciclo completo de operación.</p>
        <div className="features-grid">
            <div className="feature-card"><div className="feature-icon icon-rojo">🧾</div><h3>Gestión de pedidos</h3><p>Registro de pedidos por mesa o domicilio. Descuento automático de inventario según recetas configuradas.</p></div>
            <div className="feature-card"><div className="feature-icon icon-verde">📦</div><h3>Control de inventario</h3><p>Seguimiento en tiempo real de insumos. Alertas cuando el stock llega al mínimo definido por el administrador.</p></div>
            <div className="feature-card"><div className="feature-icon icon-amarillo">📄</div><h3>Facturación DIAN</h3><p>Generación automática de facturas electrónicas con CUFE, cumpliendo la resolución 000042 de 2020.</p></div>
            <div className="feature-card"><div className="feature-icon icon-rojo">🛵</div><h3>Módulo de domicilios</h3><p>Seguimiento en tiempo real de entregas. Estados actualizables por el repartidor desde su dispositivo.</p></div>
            <div className="feature-card"><div className="feature-icon icon-verde">🤖</div><h3>Análisis con IA</h3><p>Predicción de demanda por producto e ingrediente. Reportes automáticos de rentabilidad y tendencias de consumo.</p></div>
            <div className="feature-card"><div className="feature-icon icon-amarillo">💰</div><h3>Caja y facturación</h3><p>Apertura y cierre de turno, flujo de caja, múltiples métodos de pago y exportación de reportes contables.</p></div>
        </div>
    </section>

      {/* ROLES */}
    <section className="roles-section">
        <div className="roles-inner">
        <div className="section-tag">Usuarios del sistema</div>
        <h2 style={{ color: '#fff', fontFamily: "'Syne',sans-serif", fontSize: 'clamp(1.8rem,3vw,2.6rem)', fontWeight: 700, letterSpacing: '-1px', marginBottom: '12px' }}>Un sistema, cuatro roles</h2>
        <p className="section-sub">Cada perfil accede únicamente a las funciones que le corresponden.</p>
        <div className="roles-grid">
            <div className="role-card"><div className="role-avatar">👑</div><h3>Administrador</h3><p>Gestión total: usuarios, menú, reportes, inventario y configuración del sistema.</p></div>
            <div className="role-card"><div className="role-avatar">🍽</div><h3>Mesero</h3><p>Toma de pedidos por mesa, envío a cocina y seguimiento del estado del servicio.</p></div>
            <div className="role-card"><div className="role-avatar">🛵</div><h3>Repartidor</h3><p>Visualización de domicilios asignados, actualización de estado en tiempo real.</p></div>
            <div className="role-card"><div className="role-avatar">👤</div><h3>Cliente</h3><p>Exploración del menú, pedidos a domicilio, historial de compras y calificación del servicio.</p></div>
        </div>
        </div>
    </section>
    </>
)
}

export default Landing