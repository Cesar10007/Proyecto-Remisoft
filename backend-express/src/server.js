import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import 'dotenv/config';

import { authRequired as authMiddleware } from './middleware/auth.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import passwordResetRoutes from './routes/passwordReset.routes.js';
import ajusteInventarioRoutes from './routes/ajusteInventario.routes.js';
import cajasRoutes from './routes/cajas.routes.js';
import categoriaProductosRoutes from './routes/categoriaProductos.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import compraRoutes from './routes/compra.routes.js';
import configuracionRoutes from './routes/configuracion.routes.js';
import detalleCompraRoutes from './routes/detalleCompra.routes.js';
import detalleFacturaRoutes from './routes/detalleFactura.routes.js';
import detallePedidoRoutes from './routes/detallePedido.routes.js';
import domiciliosRoutes from './routes/domicilios.routes.js';
import estadoPedidoRoutes from './routes/estadoPedido.routes.js';
import facturaRoutes from './routes/factura.routes.js';
import flujoCajaRoutes from './routes/flujoCaja.routes.js';
import gastoRoutes from './routes/gasto.routes.js';
import ingredientesRoutes from './routes/ingredientes.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import logActividadRoutes from './routes/logActividad.routes.js';
import notificacionRoutes from './routes/notificacion.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import permisoRoutes from './routes/permiso.routes.js';
import plantillaEmailRoutes from './routes/plantillaEmail.routes.js';
import productoIngredienteRoutes from './routes/productoIngrediente.routes.js';
import productosRoutes from './routes/productos.routes.js';
import proveedorIngredienteRoutes from './routes/proveedorIngrediente.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';
import reporteCierreRoutes from './routes/reporteCierre.routes.js';
import rolRoutes from './routes/rol.routes.js';
import tipoDocumentoRoutes from './routes/tipoDocumento.routes.js';
import tipoUsuarioRoutes from './routes/tipoUsuario.routes.js';
import turnosRoutes from './routes/turnos.routes.js';
import unidadMedidaRoutes from './routes/unidadMedida.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

const app = express();

/*
 * Codespaces/Vite reenvía solicitudes mediante proxy y agrega
 * X-Forwarded-For. Confiar en un proxy evita el error de
 * express-rate-limit y permite identificar correctamente al cliente.
 */
app.set('trust proxy', 1);

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos. Intenta de nuevo en 15 minutos.',
  },
});

app.use(helmet());

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'RemiSoft Express online' });
});

/* Rutas públicas sensibles: limitar antes de registrar los routers. */
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/send-reset-link', authLimiter);
app.use('/api/auth/reset-password', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);

/* Todo lo que sigue exige un JWT válido. */
app.use(authMiddleware);

app.use('/api/ajuste-inventario', ajusteInventarioRoutes);
app.use('/api/cajas', cajasRoutes);
app.use('/api/categorias', categoriaProductosRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/detalle-compra', detalleCompraRoutes);
app.use('/api/detalle-factura', detalleFacturaRoutes);
app.use('/api/detalle-pedido', detallePedidoRoutes);
app.use('/api/domicilios', domiciliosRoutes);
app.use('/api/estado-pedido', estadoPedidoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/flujo-caja', flujoCajaRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/log-actividad', logActividadRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/plantillas-email', plantillaEmailRoutes);
app.use('/api/producto-ingrediente', productoIngredienteRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/proveedor-ingrediente', proveedorIngredienteRoutes);
app.use('/api/reporte-cierre', reporteCierreRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/tipos-documento', tipoDocumentoRoutes);
app.use('/api/tipos-usuario', tipoUsuarioRoutes);
app.use('/api/turnos', turnosRoutes);
app.use('/api/unidades-medida', unidadMedidaRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use(errorHandler);

app.listen(port, host, () => {
  console.log(`RemiSoft Express escuchando en http://${host}:${port}`);
});