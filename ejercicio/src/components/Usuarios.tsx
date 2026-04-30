import Footer from './Footer'
import Header from './Header'
import Sidebar from './Sidebar'

const usuarios = [
  { id: 1, nombre: 'Ana Ruiz', correo: 'ana@remisoft.com', rol: 'Administradora' },
  { id: 2, nombre: 'Diego León', correo: 'diego@remisoft.com', rol: 'Ventas' },
  { id: 3, nombre: 'Luz Benítez', correo: 'luz@remisoft.com', rol: 'Soporte' },
]

export default function Usuarios() {
  return (
    <div className="page-shell">
      <Sidebar items={['Usuarios', 'Productos', 'Resumen']} />

      <main className="content-area">
        <Header title="Usuarios" subtitle="Lista de usuarios prototipo para la aplicación." />

        <section className="content-card">
          <h3 className="section-title">Usuarios activos</h3>
          <div className="item-grid">
            {usuarios.map((usuario) => (
              <article className="item-card" key={usuario.id}>
                <p className="item-label">Nombre</p>
                <p className="item-value">{usuario.nombre}</p>
                <p className="item-label">Correo</p>
                <p className="item-value">{usuario.correo}</p>
                <p className="item-label">Rol</p>
                <p className="item-value">{usuario.rol}</p>
              </article>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
