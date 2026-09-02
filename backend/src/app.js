import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import 'dotenv/config'

import { authRequired as authMiddleware } from './middleware/auth.js'
import errorHandler from './middleware/errorHandler.js'

import authRoutes from './routes/auth.routes.js'
import passwordResetRoutes from './routes/passwordReset.routes.js'
import cajasRoutes from './routes/cajas.routes.js'
import categoriaProductosRoutes from './routes/categoriaProductos.routes.js'
import clienteRoutes from './routes/cliente.routes.js'
import detallePedidoRoutes from './routes/detallePedido.routes.js'
import domiciliosRoutes from './routes/domicilios.routes.js'
import ingredientesRoutes from './routes/ingredientes.routes.js'
import inventarioRoutes from './routes/inventario.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'
import productosRoutes from './routes/productos.routes.js'
import proveedorRoutes from './routes/proveedor.routes.js'
import rolRoutes from './routes/rol.routes.js'
import turnosRoutes from './routes/turnos.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import facturaRoutes from './routes/factura.routes.js'
import solicitudRegistroRoutes from './routes/solicitudRegistro.routes.js'

const app = express()

app.set('trust proxy', 1)

const allowedOrigin =
  process.env.FRONTEND_URL || 'http://localhost:5173'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.',
  },
})

app.use(helmet())

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
)

app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({
    status: 'RemiSoft Express online',
  })
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/send-reset-link', authLimiter)
app.use('/api/auth/reset-password', authLimiter)

app.use('/api/auth', authRoutes)
app.use('/api/auth', passwordResetRoutes)

app.use(authMiddleware)

app.use('/api/solicitudes', solicitudRegistroRoutes)
app.use('/api/cajas', cajasRoutes)
app.use('/api/categorias', categoriaProductosRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/detalle-pedido', detallePedidoRoutes)
app.use('/api/domicilios', domiciliosRoutes)
app.use('/api/facturas', facturaRoutes)
app.use('/api/ingredientes', ingredientesRoutes)
app.use('/api/inventario', inventarioRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/proveedores', proveedorRoutes)
app.use('/api/roles', rolRoutes)
app.use('/api/turnos', turnosRoutes)
app.use('/api/usuarios', usuariosRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    code: 'NOT_FOUND',
  })
})

app.use(errorHandler)

export default app