import { Router } from 'express';
import { requireRole } from '../middleware/requireRole.js';
import { tablero, carta, operar, actualizarMesa } from '../controllers/salon.controller.js';

const router = Router();
router.use(requireRole('MESERO'));
router.get('/', tablero);
router.get('/carta', carta);
router.patch('/mesas/:numero/estado', actualizarMesa);
router.post('/pedidos', operar('abrir'));
router.put('/pedidos/:id', operar('editar'));
router.delete('/pedidos/:id', operar('cancelar'));
router.post('/pedidos/:id/rondas', operar('ronda'));
router.post('/pedidos/:id/cuenta', operar('cuenta'));
export default router;
