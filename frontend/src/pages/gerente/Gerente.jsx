import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const menuItems = [
  { icon: 'restaurant_menu', label: 'Menú' },
  { icon: 'inventory_2', label: 'Inventario' },
  { icon: 'payments', label: 'Finanzas' },
  { icon: 'add_shopping_cart', label: 'Pedidos' },
  { icon: 'groups', label: 'Mesas' },
  { icon: 'auto_awesome', label: 'IA Insights' },
  { icon: 'local_shipping', label: 'Proveedores' },
  { icon: 'receipt_long', label: 'Historial' },
  { icon: 'account_balance', label: 'Flujo de Caja' },
  { icon: 'schedule', label: 'Turnos' },
]

const metricas = [
  { icon: 'monetization_on', label: 'Ingresos del día', valor: '$4.250.000', badge: '+12.5%', badgeColor: 'verde' },
  { icon: 'account_balance_wallet', label: 'Flujo de caja', valor: '$28.140.500', badge: 'Estable', badgeColor: 'muted' },
  { icon: 'shopping_bag', label: 'Pedidos activos', valor: '42', badge: '8 pendientes', badgeColor: 'rojo' },
]

const inventario = [
  { nombre: 'Carnes & Proteínas', porcentaje: 82, color: 'verde' },
  { nombre: 'Vegetales Frescos', porcentaje: 45, color: 'amarillo' },
  { nombre: 'Bebidas & Licores', porcentaje: 12, color: 'rojo' },
]

const movimientos = [
  { icon: 'shopping_cart', titulo: 'Mesa 03 - Pago recibido', sub: 'Hace 14 min • Visa ***4212', monto: '+$84.500', positivo: true },
  { icon: 'local_shipping', titulo: 'Proveedor: La Huerta S.A.', sub: 'Hace 1 hora • Orden #9822', monto: '-$210.000', positivo: false },
  { icon: 'shopping_cart', titulo: 'Mesa 12 - Pago recibido', sub: 'Hace 3 horas • Efectivo', monto: '+$126.000', positivo: true },
  { icon: 'settings_backup_restore', titulo: 'Reembolso mesa 01', sub: 'Hace 5 horas • Cancelación', monto: '-$15.200', positivo: false },
]

const mesas = [
  { id: 'T-01', ocupada: false },
  { id: 'T-02', ocupada: true },
  { id: 'T-03', ocupada: true },
  { id: 'T-04', ocupada: false },
  { id: 'T-05', ocupada: false },
  { id: 'T-06', ocupada: true },
  { id: 'T-07', ocupada: false },
  { id: 'T-08', ocupada: false },
  { id: 'T-09', ocupada: true },
  { id: 'T-10', ocupada: false },
  { id: 'T-11', ocupada: false },
  { id: 'T-12', ocupada: false },
]

const barras = [
  { dia: 'LUN', alto: 40 },
  { dia: 'MAR', alto: 60 },
  { dia: 'MIE', alto: 80 },
  { dia: 'JUE', alto: 75 },
  { dia: 'VIE', alto: 95 },
  { dia: 'SAB', alto: 85 },
  { dia: 'DOM', alto: 70 },
]

function Gerente() {
  const [seccionActiva, setSeccionActiva] = useState('Menú')
  const navigate = useNavigate() 

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', fontFamily: "'DM Sans', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: '240px', minHeight: '100vh', background: 'var(--bg-card)',
        borderRight: '1px solid var(--borde)', display: 'flex', flexDirection: 'column',
        padding: '24px 16px', position: 'fixed', top: 0, left: 0, zIndex: 100
      }}>
        <div style={{ marginBottom: '32px', padding: '0 8px' }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: 'var(--rojo-dark)' }}>
            Remi<span style={{ color: 'var(--amarillo)' }}>Soft</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--texto-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' }}>
            Gerente
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menuItems.map(item => (
            <button
              key={item.label}
              onClick={() => setSeccionActiva(item.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px', border: 'none',
                cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                background: seccionActiva === item.label ? 'var(--rojo-light)' : 'transparent',
                color: seccionActiva === item.label ? 'var(--rojo-dark)' : 'var(--texto-muted)',
                borderRight: seccionActiva === item.label ? '3px solid var(--rojo)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--borde)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button style={{
            background: 'var(--rojo)', color: '#fff', border: 'none',
            borderRadius: '10px', padding: '10px', fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', marginBottom: '8px'
          }}>
            Cerrar Caja
          </button>
          <button  onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--texto-muted)', fontSize: '0.875rem', padding: '8px 12px',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* TOPBAR */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: 'var(--texto)', letterSpacing: '-0.5px' }}>
              {seccionActiva}
            </h1>
            <p style={{ color: 'var(--texto-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
              Bienvenido de nuevo, Gerente
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              background: 'var(--bg-card)', border: '1px solid var(--borde)',
              borderRadius: '50%', width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--texto-muted)', position: 'relative'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
              <span style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '8px', height: '8px', background: 'var(--rojo)',
                borderRadius: '50%', border: '2px solid var(--bg-card)'
              }}></span>
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--bg-card)', border: '1px solid var(--borde)',
              borderRadius: '100px', padding: '6px 14px 6px 6px'
            }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'var(--rojo-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--rojo-dark)', fontWeight: 700, fontSize: '0.85rem'
              }}>G</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--texto)' }}>Gerente</span>
            </div>
          </div>
        </header>

        {/* MÉTRICAS */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {metricas.map(m => (
            <div key={m.label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--borde)',
              borderRadius: '16px', padding: '24px', display: 'flex',
              flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px',
              boxShadow: 'var(--sombra)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '22px', padding: '8px', borderRadius: '10px',
                  background: m.badgeColor === 'verde' ? 'var(--verde-light)' : m.badgeColor === 'rojo' ? 'var(--rojo-light)' : '#f0ebe5',
                  color: m.badgeColor === 'verde' ? 'var(--verde)' : m.badgeColor === 'rojo' ? 'var(--rojo)' : 'var(--amarillo)'
                }}>{m.icon}</span>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px',
                  borderRadius: '100px',
                  background: m.badgeColor === 'verde' ? 'var(--verde-light)' : m.badgeColor === 'rojo' ? 'var(--rojo-light)' : '#f0ebe5',
                  color: m.badgeColor === 'verde' ? 'var(--verde)' : m.badgeColor === 'rojo' ? 'var(--rojo-dark)' : 'var(--texto-muted)'
                }}>{m.badge}</span>
              </div>
              <div>
                <p style={{ fontSize: '0.78rem', color: 'var(--texto-muted)', marginBottom: '4px' }}>{m.label}</p>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: 'var(--texto)' }}>{m.valor}</p>
              </div>
            </div>
          ))}
        </section>

        {/* GRÁFICA + ACCIONES + INVENTARIO */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>

          {/* GRÁFICA DE BARRAS */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--borde)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--sombra)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
              <div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--texto)' }}>Tendencia semanal</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--texto-muted)', marginTop: '2px' }}>Predicción de demanda basada en historial</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--rojo)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--rojo)', display: 'inline-block' }}></span>Proyectado
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--amarillo)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--amarillo)', display: 'inline-block' }}></span>Real
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', gap: '8px' }}>
              {barras.map(b => (
                <div key={b.dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: 'var(--rojo)', opacity: 0.85,
                    height: `${b.alto}%`, transition: 'height 0.3s ease'
                  }}></div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--texto-muted)', fontWeight: 600 }}>{b.dia}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ACCIONES RÁPIDAS */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--borde)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--sombra)' }}>
              <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', color: 'var(--texto)' }}>Acciones rápidas</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{
                  background: 'var(--rojo)', color: '#fff', border: 'none',
                  borderRadius: '10px', padding: '12px 16px', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  Nuevo Pedido
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>
                <button style={{
                  background: '#f9f5f0', color: 'var(--texto-muted)', border: '1px solid var(--borde)',
                  borderRadius: '10px', padding: '12px 16px', fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  Control de Menú
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
                </button>
              </div>
            </div>

            {/* INVENTARIO */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--borde)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--sombra)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: 'var(--texto)' }}>Estado inventario</h4>
                <span style={{ fontSize: '0.65rem', color: 'var(--texto-muted)', background: '#f0ebe5', padding: '2px 8px', borderRadius: '100px' }}>En vivo</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {inventario.map(i => (
                  <div key={i.nombre}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--texto-muted)', fontWeight: 500 }}>{i.nombre}</span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        color: i.color === 'verde' ? 'var(--verde)' : i.color === 'rojo' ? 'var(--rojo)' : '#BA7517'
                      }}>{i.porcentaje}%</span>
                    </div>
                    <div style={{ width: '100%', background: '#f0ebe5', borderRadius: '100px', height: '6px' }}>
                      <div style={{
                        width: `${i.porcentaje}%`, height: '100%', borderRadius: '100px',
                        background: i.color === 'verde' ? 'var(--verde)' : i.color === 'rojo' ? 'var(--rojo)' : 'var(--amarillo)'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* MESAS + MOVIMIENTOS */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '16px' }}>

          {/* MESAS */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--borde)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--sombra)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--texto)' }}>Estado de mesas</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--texto-muted)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--verde)', display: 'inline-block' }}></span>Disponible
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--texto-muted)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amarillo)', display: 'inline-block' }}></span>Ocupada
                </span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
              {mesas.map(m => (
                <div key={m.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', padding: '12px 8px', borderRadius: '12px',
                  border: `2px solid ${m.ocupada ? 'rgba(239,159,39,0.3)' : 'rgba(29,158,117,0.3)'}`,
                  background: m.ocupada ? 'var(--amarillo-light)' : 'var(--verde-light)',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--texto-muted)' }}>{m.id}</span>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '16px',
                    color: m.ocupada ? 'var(--amarillo)' : 'var(--verde)'
                  }}>{m.ocupada ? 'person' : 'check_circle'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* MOVIMIENTOS */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--borde)', borderRadius: '16px', padding: '28px', boxShadow: 'var(--sombra)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--texto)' }}>Movimientos recientes</h3>
              <button style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--rojo)', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todo</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {movimientos.map((mov, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                      background: mov.positivo ? 'var(--verde-light)' : 'var(--rojo-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: mov.positivo ? 'var(--verde)' : 'var(--rojo)'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{mov.icon}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--texto)' }}>{mov.titulo}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--texto-muted)' }}>{mov.sub}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: mov.positivo ? 'var(--verde)' : 'var(--rojo)', whiteSpace: 'nowrap' }}>{mov.monto}</span>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>
    </div>
  )
}

export default Gerente