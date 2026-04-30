import Footer from './Footer'
import Header from './Header'
import Sidebar from './Sidebar'

const productos = [
  { id: 1, nombre: 'Soporte técnico', precio: 'USD 120', estado: 'Disponible' },
  { id: 2, nombre: 'Licencia anual', precio: 'USD 250', estado: 'Próximo' },
  { id: 3, nombre: 'Mantenimiento', precio: 'USD 80', estado: 'Disponible' },
]

export default function Productos() {
  return (
    <div className="page-shell">
      <Sidebar items={['Usuarios', 'Productos', 'Resumen']} />

      <main className="content-area">
        <Header title="Productos" subtitle="Ejemplo de productos y servicios en la interfaz." />

        <section className="content-card">
          <h3 className="section-title">Servicios</h3>
          <div className="item-grid">
            {productos.map((producto) => (
              <article className="item-card" key={producto.id}>
                <p className="item-label">Servicio</p>
                <p className="item-value">{producto.nombre}</p>
                <p className="item-label">Precio</p>
                <p className="item-value">{producto.precio}</p>
                <p className="item-label">Estado</p>
                <p className="item-value">{producto.estado}</p>
              </article>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
