import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { gastosDelMes, pedidosActivos, tendenciaVentas, ventasDiarias } from '../controllers/reportes.controller.js';

const router = Router();

const gerencia = requireRole('SUPERADMIN', 'GERENTE');
// Mesero también ve las ventas del día (Mesero > Caja > Reportes).
const ventasDelDia = requireRole('SUPERADMIN', 'GERENTE', 'MESERO');

// GET /api/reportes/ventas-diarias?desde&hasta
router.get('/ventas-diarias', ventasDelDia, ventasDiarias);

// GET /api/reportes/pedidos-activos
router.get('/pedidos-activos', gerencia, pedidosActivos);

// GET /api/reportes/gastos-del-mes
router.get('/gastos-del-mes', gerencia, gastosDelMes);

// GET /api/reportes/tendencia?periodo=semana|mes|anio
router.get('/tendencia', gerencia, tendenciaVentas);

export default router;
