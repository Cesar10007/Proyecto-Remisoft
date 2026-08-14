import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import cajasRoutes from './routes/cajas.routes.js';
import ingredientesRoutes from './routes/ingredientes.routes.js';
import domiciliosRoutes from './routes/domicilios.routes.js';
import proveedorRoutes from './routes/proveedor.routes.js';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : true,
    credentials: true,
  }),
);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'RemiSoft Express online' });
});

app.use('/api/cajas', cajasRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/domicilios', domiciliosRoutes);
app.use('/api/proveedores', proveedorRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`RemiSoft Express escuchando en http://${host}:${port}`);
});