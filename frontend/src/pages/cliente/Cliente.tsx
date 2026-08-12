import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Cliente.css'

interface Meal {
  idMeal: string
  strMeal: string
  strCategory: string
  strArea: string
  strMealThumb: string
  strInstructions: string
}

interface Producto {
  id_producto: number
  Nombre: string
  Descripcion: string
  precio_venta: string
  Categoria: string
  Estado: number
}

function Cliente() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [meals, setMeals] = useState<Meal[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(false)
  const [seccion, setSeccion] = useState('Inicio')

  // TheMealDB — API externa
  useEffect(() => {
    setCargando(true)
    const fetchMeals = async () => {
      try {
        const results = await Promise.all([
          fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(r => r.json()),
          fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(r => r.json()),
          fetch('https://www.themealdb.com/api/json/v1/1/random.php').then(r => r.json()),
        ])
        setMeals(results.map(r => r.meals[0]))
      } catch (err) {
        console.error('Error cargando sugerencias:', err)
      } finally {
        setCargando(false)
      }
    }
    fetchMeals()
  }, [])

  // Productos activos del backend
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/productos/vista`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        Accept: 'application/json',
      }
    })
      .then(r => r.json())
      .then(data => setProductos(data.filter((p: Producto) => p.Estado === 1)))
      .catch(err => console.error(err))
  }, [])

  const navItems = [
    { icon: 'home', label: 'Inicio' },
    { icon: 'restaurant_menu', label: 'Menú' },
    { icon: 'receipt_long', label: 'Mis Pedidos' },
    { icon: 'person', label: 'Perfil' },
  ]

  return (
    <div className="cl-wrapper">
      {/* Sidebar */}
      <aside className="cl-sidebar">
        <div className="cl-sidebar-brand">
          <div className="cl-logo">Remi<span className="cl-logo-accent">Soft</span></div>
          <div className="cl-role">Cliente</div>
        </div>

        <nav className="cl-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.label}
              onClick={() => setSeccion(item.label)}
              className={`cl-nav-btn ${seccion === item.label ? 'is-active' : ''}`}
            >
              <span className="material-symbols-outlined cl-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="cl-sidebar-footer">
          <button onClick={() => { logout(); navigate('/') }} className="cl-logout-btn">
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="cl-main">
        <header className="cl-topbar">
          <div>
            <h1 className="cl-page-title">{seccion}</h1>
            <p className="cl-page-subtitle">Hola, {user?.nombre ?? 'Cliente'} 👋</p>
          </div>
          <div className="cl-user-pill">
            <div className="cl-user-avatar">{(user?.nombre?.[0] ?? 'C').toUpperCase()}</div>
            <span className="cl-user-name">{user?.nombre ?? 'Cliente'}</span>
          </div>
        </header>

        {/* Sugerencias de TheMealDB */}
        <section className="cl-card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="cl-section-title">🍽️ Sugerencias del día <span className="cl-badge-api">TheMealDB API</span></h3>
          <p className="cl-section-sub">Inspiración culinaria del mundo para tu visita</p>
          {cargando ? (
            <p className="cl-muted">Cargando sugerencias...</p>
          ) : (
            <div className="cl-meals-grid">
              {meals.map(meal => (
                <div key={meal.idMeal} className="cl-meal-card">
                  <img src={meal.strMealThumb} alt={meal.strMeal} className="cl-meal-img" />
                  <div className="cl-meal-body">
                    <h4 className="cl-meal-name">{meal.strMeal}</h4>
                    <div className="cl-meal-meta">
                      <span className="cl-meal-tag">{meal.strCategory}</span>
                      <span className="cl-meal-tag">{meal.strArea}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Menú del restaurante */}
        <section className="cl-card">
          <h3 className="cl-section-title">🍕 Nuestro Menú</h3>
          <p className="cl-section-sub">Productos disponibles en Familia Remi</p>
          <div className="cl-menu-grid">
            {productos.length === 0 ? (
              <p className="cl-muted">Sin productos disponibles</p>
            ) : (
              productos.map(p => (
                <div key={p.id_producto} className="cl-producto-card">
                  <div className="cl-producto-icon">
                    <span className="material-symbols-outlined">restaurant</span>
                  </div>
                  <div className="cl-producto-body">
                    <h4 className="cl-producto-name">{p.Nombre}</h4>
                    <p className="cl-producto-desc">{p.Descripcion}</p>
                    <div className="cl-producto-footer">
                      <span className="cl-producto-precio">
                        ${Number(p.precio_venta).toLocaleString('es-CO')}
                      </span>
                      <span className="cl-producto-cat">{p.Categoria}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Cliente