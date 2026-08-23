import { Router } from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
} from '../controllers/rol.controller.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

router.use(requireRole('SUPERADMIN'));

router.get('/', index);
router.get('/:id', show);
router.post('/', store);
router.put('/:id', update);
router.delete('/:id', destroy);

export default router;