import express from 'express';
import cors from 'cors';

import authMiddleware from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import passwordResetRoutes from './routes/passwordReset.routes.js';
import cajasRoutes from './routes/cajas.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import domiciliosRoutes from './routes/domicilios.routes.js';
import facturaRoutes from './routes/factura.routes.js';
import flujoCajaRoutes from './routes/flujoCaja.routes.js';
import ingredientesRoutes from './routes/ingredientes.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import productosRoutes from './routes/productos.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.use(cors());
app.use(express.json());

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'RemiSoft Express online' });
});

// Rutas públicas
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);

// Rutas protegidas
app.use(authMiddleware);
app.use('/api/cajas', cajasRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/domicilios', domiciliosRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/flujo-caja', flujoCajaRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

app.listen(port, host, () => {
  console.log(`RemiSoft Express escuchando en http://${host}:${port}`);
});
