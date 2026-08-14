import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cajasRoutes from './routes/cajas.routes.js';
import ingredientesRoutes from './routes/ingredientes.routes.js';
import domiciliosRoutes from './routes/domicilios.routes.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'RemiSoft Express online' }));

app.use('/api/cajas', cajasRoutes);
app.use('/api/ingredientes', ingredientesRoutes);
app.use('/api/domicilios', domiciliosRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`RemiSoft Express escuchando en puerto ${port}`);
});
