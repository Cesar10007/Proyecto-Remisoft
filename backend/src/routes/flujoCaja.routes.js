import { Router } from 'express';
import { index, show, store, update, destroy } from '../controllers/flujoCaja.controller.js';

const router = Router();

// GET /api/flujo-caja
router.get('/', index);

// GET /api/flujo-caja/:id
router.get('/:id', show);

// POST /api/flujo-caja
router.post('/', store);

// PUT /api/flujo-caja/:id
router.put('/:id', update);

// DELETE /api/flujo-caja/:id
router.delete('/:id', destroy);

export default router;
