import { Router } from 'express'
import { requireRole } from '../middleware/requireRole.js'
import { listarRestaurantes } from '../controllers/restaurantes.controller.js'

const router = Router()

router.use(requireRole('SUPERADMIN', 'GERENTE'))

router.get('/', listarRestaurantes)

export default router