import { Router } from 'express';
import { index, show, store, update, destroy } from '../controllers/factura.controller.js';

const router = Router();

// GET /api/facturas
router.get('/', index);

// GET /api/facturas/:id
router.get('/:id', show);

// POST /api/facturas
router.post('/', store);

// PUT /api/facturas/:id
router.put('/:id', update);

// DELETE /api/facturas/:id
router.delete('/:id', destroy);

export default router;
