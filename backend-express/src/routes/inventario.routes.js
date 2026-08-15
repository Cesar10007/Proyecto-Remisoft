import { Router } from 'express';
import { index, show, store, update, destroy, ajustarStock, stockBajo } from '../controllers/inventario.controller.js';

const router = Router();

// GET /api/inventario
router.get('/', index);

// GET /api/inventario/alertas/stock-bajo
router.get('/alertas/stock-bajo', stockBajo);

// GET /api/inventario/:id
router.get('/:id', show);

// POST /api/inventario
router.post('/', store);

// POST /api/inventario/:id/ajustar
router.post('/:id/ajustar', ajustarStock);

// PUT /api/inventario/:id
router.put('/:id', update);

// DELETE /api/inventario/:id
router.delete('/:id', destroy);

export default router;
