import { Router } from 'express';
import {
  index,
  show,
  stockBajo,
} from '../controllers/inventario.controller.js';

const router = Router();

// GET /api/inventario
router.get('/', index);

// Debe declararse antes de /:id.
router.get('/alertas/stock-bajo', stockBajo);

// GET /api/inventario/:id
router.get('/:id', show);

export default router;
